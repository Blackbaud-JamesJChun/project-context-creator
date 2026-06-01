import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { SAMPLE_CORPUS, type RawDataPoint } from './seed-data';
import { getSource, SOURCE_CATALOG } from './sources';
import type { ContextRequest, SourceDefinition } from './models';

const REQUEST_TIMEOUT_MS = Number(process.env['SOURCE_FETCH_TIMEOUT_MS'] ?? 8000);
const MAX_PARALLEL_FETCHES = Number(process.env['MAX_PARALLEL_FETCHES'] ?? 6);
const INCLUDE_SEED_FALLBACK = process.env['USE_SEED_FALLBACK'] !== 'false';
const DOVETAIL_API_TOKEN = process.env['DOVETAIL_API_TOKEN']?.trim();
const ADO_PAT = process.env['ADO_PAT']?.trim();
const ADO_ORG = process.env['ADO_ORG']?.trim() || 'blackbaud';
const ADO_PROJECT = process.env['ADO_PROJECT']?.trim();

/**
 * Builds the analysis corpus by ingesting live sources first.
 * - Live sources: any catalog source with available=true
 * - Seed fallback: only for explicitly requested non-live sources
 * - Uploaded files: converted into findings so users can inject private data
 */
export async function buildContextCorpus(req: ContextRequest): Promise<RawDataPoint[]> {
  const requestedIds = new Set(req.sources ?? []);
  const hasExplicitSourceSelection = requestedIds.size > 0;

  const liveSources = SOURCE_CATALOG.filter((source) => {
    if (!isSourceLive(source)) return false;
    return hasExplicitSourceSelection ? requestedIds.has(source.id) : true;
  });

  const liveData = await ingestLiveSources(liveSources, req.topic);
  const uploadedData = ingestUploadedFiles(req.uploadedFiles ?? [], req.topic);
  const seedFallback = ingestSeedFallback(req, requestedIds, hasExplicitSourceSelection);

  return dedupeByKey([...liveData, ...uploadedData, ...seedFallback]);
}

async function ingestLiveSources(sources: SourceDefinition[], topic: string): Promise<RawDataPoint[]> {
  if (sources.length === 0) return [];

  const tasks = sources.map((source) => async () => ingestSingleLiveSource(source, topic));
  const results = await runLimited(tasks, Math.max(1, MAX_PARALLEL_FETCHES));

  return results.flat().filter((item): item is RawDataPoint => !!item);
}

async function ingestSingleLiveSource(source: SourceDefinition, topic: string): Promise<RawDataPoint[]> {
  if (source.id === 'dovetail' && DOVETAIL_API_TOKEN) {
    const points = await ingestDovetail(topic);
    if (points.length > 0) return points;
  }

  if (source.id === 'ado' && ADO_PAT) {
    const points = await ingestAzureDevOps(topic);
    if (points.length > 0) return points;
  }

  if (!source.url) return [];

  try {
    const html = await fetchText(source.url, REQUEST_TIMEOUT_MS, sourceRequestHeaders(source.id));
    const title = extractTag(html, 'title') || source.label;
    const description =
      extractMetaDescription(html) ||
      `Live connector fetched ${source.label}. Additional parsing may be required for deeper extraction.`;

    return [
      {
        sourceId: source.id,
        title: normalizeWhitespace(title).slice(0, 180),
        summary: normalizeWhitespace(description).slice(0, 500),
        date: new Date().toISOString().slice(0, 10),
        url: source.url,
        tags: buildTags(source, topic, `${title} ${description}`),
        type: 'finding',
        meta: {
          ingestion: 'live-fetch',
        },
      },
    ];
  } catch {
    // Silent per-source failure keeps ingestion resilient when a source is down.
    return [];
  }
}

async function ingestDovetail(topic: string): Promise<RawDataPoint[]> {
  if (!DOVETAIL_API_TOKEN) return [];

  try {
    const url = new URL('https://dovetail.com/api/v1/insights');
    url.searchParams.set('page[size]', '20');

    const raw = await fetchJson(url.toString(), REQUEST_TIMEOUT_MS, {
      Authorization: `Bearer ${DOVETAIL_API_TOKEN}`,
      Accept: 'application/json',
    });

    const data = extractArray(raw, 'results', 'data');
    return data
      .map((row) => {
        const id = asString(row['id']);
        const title = asString(row['title']) ?? asString(row['name']);
        const summary =
          asString(row['summary']) ??
          asString(row['description']) ??
          asString(row['text']) ??
          'Dovetail insight pulled from live connector.';
        if (!title) return undefined;

        const createdAt = asIsoDate(asString(row['created_at']) ?? asString(row['createdAt'])) ?? new Date().toISOString().slice(0, 10);

        return {
          sourceId: 'dovetail',
          title: normalizeWhitespace(title).slice(0, 180),
          summary: normalizeWhitespace(summary).slice(0, 500),
          date: createdAt,
          url: id ? `https://blackbaud.dovetail.com/insights/${id}` : 'https://blackbaud.dovetail.com/home',
          tags: unique(['dovetail', 'internal-research', ...topicTokens(topic)]),
          type: 'finding' as const,
          meta: {
            ingestion: 'dovetail-api',
          },
        };
      })
      .filter((item): item is RawDataPoint => !!item);
  } catch {
    return [];
  }
}

async function ingestAzureDevOps(topic: string): Promise<RawDataPoint[]> {
  if (!ADO_PAT) return [];

  const payload = {
    searchText: topic || 'fundraising',
    $top: 20,
    filters: {
      Project: ADO_PROJECT ? [ADO_PROJECT] : undefined,
    },
    includeFacets: false,
  };

  const auth = Buffer.from(`:${ADO_PAT}`).toString('base64');
  const api = `https://almsearch.dev.azure.com/${ADO_ORG}/_apis/search/wikiresult?api-version=7.1-preview.1`;

  try {
    const raw = await fetchJson(api, REQUEST_TIMEOUT_MS, {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }, JSON.stringify(payload));

    const results = extractArray(raw, 'results', 'value');
    return results
      .map((row) => {
        const title = asString(row['fileName']) ?? asString(row['path']) ?? asString(row['wiki']) ?? 'Azure DevOps wiki result';
        const summary =
          asString(row['snippet']) ??
          asString(row['content']) ??
          asString(row['project']) ??
          'Azure DevOps wiki search result from live connector.';
        const url = asString(row['url']) ?? asString(row['path']) ?? `https://dev.azure.com/${ADO_ORG}`;
        const createdAt = asIsoDate(asString(row['createdDate']) ?? asString(row['lastModifiedDate'])) ?? new Date().toISOString().slice(0, 10);

        return {
          sourceId: 'ado',
          title: normalizeWhitespace(title).slice(0, 180),
          summary: normalizeWhitespace(summary).slice(0, 500),
          date: createdAt,
          url,
          tags: unique(['ado', 'internal-research', ...topicTokens(topic)]),
          type: 'finding' as const,
          meta: {
            ingestion: 'ado-search-api',
          },
        };
      })
      .filter((item): item is RawDataPoint => !!item);
  } catch {
    return [];
  }
}

function ingestUploadedFiles(uploadedFiles: string[], topic: string): RawDataPoint[] {
  const points: RawDataPoint[] = [];

  for (const filePath of uploadedFiles) {
    try {
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) continue;
      const ext = path.extname(filePath).toLowerCase();

      if (ext === '.json') {
        const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as unknown;
        if (Array.isArray(parsed)) {
          for (const row of parsed) {
            const candidate = normalizeUploadedObject(row, filePath, topic);
            if (candidate) points.push(candidate);
          }
          continue;
        }
      }

      const text = fs.readFileSync(filePath, 'utf-8');
      points.push({
        sourceId: 'uploaded-file',
        title: `Uploaded file: ${path.basename(filePath)}`,
        summary: normalizeWhitespace(text).slice(0, 500),
        date: new Date().toISOString().slice(0, 10),
        url: filePath,
        tags: buildUploadedTags(topic, text),
        type: 'finding',
        meta: {
          ingestion: 'uploaded-file',
        },
      });
    } catch {
      // Ignore malformed/unreadable upload files so one bad file does not block analysis.
      continue;
    }
  }

  return points;
}

function normalizeUploadedObject(value: unknown, filePath: string, topic: string): RawDataPoint | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const row = value as Record<string, unknown>;

  const title = asString(row['title']) ?? asString(row['finding']) ?? asString(row['summary']);
  const summary = asString(row['summary']) ?? asString(row['description']) ?? asString(row['details']);
  if (!title || !summary) return undefined;

  const date = asIsoDate(asString(row['date'])) ?? new Date().toISOString().slice(0, 10);

  return {
    sourceId: asString(row['sourceId']) ?? 'uploaded-file',
    title: normalizeWhitespace(title).slice(0, 180),
    summary: normalizeWhitespace(summary).slice(0, 500),
    date,
    url: asString(row['url']) ?? filePath,
    tags: normalizeTags(row['tags']) ?? buildUploadedTags(topic, `${title} ${summary}`),
    type: normalizeType(asString(row['type'])) ?? 'finding',
    meta: {
      ingestion: 'uploaded-json',
    },
  };
}

function ingestSeedFallback(
  req: ContextRequest,
  requestedIds: Set<string>,
  hasExplicitSourceSelection: boolean,
): RawDataPoint[] {
  if (!INCLUDE_SEED_FALLBACK) return [];
  if (!hasExplicitSourceSelection) return [];

  return SAMPLE_CORPUS.filter((point) => {
    const source = getSource(point.sourceId);
    if (!source) return false;
    if (source.available) return false;
    return requestedIds.has(point.sourceId);
  });
}

async function fetchText(
  url: string,
  timeoutMs: number,
  extraHeaders: Record<string, string> = {},
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'project-context-builder/1.0 (+live-source-ingestion)',
        Accept: 'text/html,application/xhtml+xml',
        ...extraHeaders,
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(
  url: string,
  timeoutMs: number,
  headers: Record<string, string>,
  body?: string,
): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: body ? 'POST' : 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'project-context-builder/1.0 (+live-source-ingestion)',
        ...headers,
      },
      body,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

function extractTag(html: string, tagName: string): string | undefined {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = html.match(regex);
  return match?.[1] ? stripHtml(match[1]) : undefined;
}

function extractMetaDescription(html: string): string | undefined {
  const patterns = [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return stripHtml(match[1]);
  }

  return undefined;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ');
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function sourceRequestHeaders(sourceId: string): Record<string, string> {
  if (sourceId === 'dovetail' && DOVETAIL_API_TOKEN) {
    return {
      Authorization: `Bearer ${DOVETAIL_API_TOKEN}`,
    };
  }

  return {};
}

function buildTags(source: SourceDefinition, topic: string, text: string): string[] {
  const base = [source.tier, source.category, source.id].map((t) => t.toLowerCase());

  const textLc = text.toLowerCase();
  const topicalSignals = ['grant', 'grantmaking', 'donor', 'fundraising', 'onboarding', 'workflow']
    .filter((token) => textLc.includes(token));

  return unique([...base, ...topicalSignals]);
}

function buildUploadedTags(topic: string, text: string): string[] {
  const topicTags = topic
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const textLc = text.toLowerCase();
  const signals = ['grant', 'grantmaking', 'donor', 'fundraising', 'onboarding', 'workflow']
    .filter((token) => textLc.includes(token));

  return unique(['uploaded', ...topicTags, ...signals]);
}

async function runLimited<T>(tasks: Array<() => Promise<T>>, limit: number): Promise<T[]> {
  const results: T[] = [];
  let index = 0;

  async function worker(): Promise<void> {
    while (index < tasks.length) {
      const current = index;
      index += 1;
      const result = await tasks[current]!();
      results[current] = result;
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function topicTokens(topic: string): string[] {
  return topic
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function asIsoDate(value?: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

function normalizeTags(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const tags = value.filter((v): v is string => typeof v === 'string').map((v) => v.trim()).filter(Boolean);
  return tags.length > 0 ? unique(tags) : undefined;
}

function normalizeType(value?: string): RawDataPoint['type'] | undefined {
  if (!value) return undefined;
  if (value === 'finding' || value === 'decision' || value === 'risk' || value === 'gap') return value;
  return undefined;
}

function dedupeByKey(points: RawDataPoint[]): RawDataPoint[] {
  const seen = new Set<string>();
  const output: RawDataPoint[] = [];

  for (const point of points) {
    const key = `${point.sourceId}|${point.title}|${point.date}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(point);
  }

  return output;
}

function isSourceLive(source: SourceDefinition): boolean {
  if (source.available) return true;
  if (source.id === 'dovetail') return Boolean(DOVETAIL_API_TOKEN);
  if (source.id === 'ado') return Boolean(ADO_PAT);
  return false;
}

function extractArray(value: unknown, ...keys: string[]): Array<Record<string, unknown>> {
  if (!value || typeof value !== 'object') return [];
  const obj = value as Record<string, unknown>;

  for (const key of keys) {
    const candidate = obj[key];
    if (Array.isArray(candidate)) {
      return candidate.filter((row): row is Record<string, unknown> => !!row && typeof row === 'object');
    }
  }

  return [];
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function buildMissingDataGap(topic: string): RawDataPoint {
  return {
    sourceId: `gap-${randomUUID()}`,
    title: `No connector results found for ${topic || 'the requested topic'}`,
    summary:
      'No live connector data or uploaded files produced topic-matching findings. Add source-specific exports or connect additional sources.',
    date: new Date().toISOString().slice(0, 10),
    tags: ['gap', 'connector', 'ingestion'],
    type: 'gap',
  };
}
