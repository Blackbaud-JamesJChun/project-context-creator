import { randomUUID } from 'node:crypto';
import { getSource, SOURCE_CATALOG } from './sources';
import { SAMPLE_CORPUS, type RawDataPoint } from './seed-data';
import type {
  ContextAnalysis,
  ContextRequest,
  Finding,
  Gap,
  PastDecision,
  RiskOrConstraint,
  SourceDefinition,
} from './models';

const REFINEMENT_QUESTIONS = [
  'That sounds broad — can you narrow this to a specific moment in the journey?',
  'Which system is the source of truth for this?',
  'Is this a user problem or a system/process problem?',
  'Can you give a concrete example of this happening?',
];

/**
 * Smart-organization analyzer.
 * Deterministic: ranks, dedupes, categorizes — no LLM required.
 */
export function analyzeSmart(req: ContextRequest, corpus: RawDataPoint[] = SAMPLE_CORPUS): ContextAnalysis {
  const horizonCutoff = monthsAgo(req.timeHorizonMonths);
  const requestedSourceIds = new Set(req.sources);

  // Filter corpus by source selection and time horizon.
  const relevant = corpus.filter((dp) => {
    if (requestedSourceIds.size > 0 && !requestedSourceIds.has(dp.sourceId)) return false;
    return new Date(dp.date) >= horizonCutoff;
  });

  // Match by topic keyword if topic is set; otherwise keep all.
  const topicMatched = req.topic
    ? relevant.filter((dp) => matchesTopic(dp, req.topic))
    : relevant;
  // Do not silently fall back to unrelated records when a topic has no matches.
  // Returning explicit gaps makes missing evidence obvious and prevents generic summaries.
  const hasTopic = req.topic.trim().length > 0;
  const working = hasTopic ? topicMatched : relevant;

  const sourcesScanned = unique(relevant.map((d) => d.sourceId))
    .map((id) => getSource(id))
    .filter((s): s is SourceDefinition => !!s);

  const findings: Finding[] = working
    .filter((d) => d.type === 'finding')
    .map((d) => toFinding(d, working));

  // Sort by importance and keep all but mark top 5 implicitly via rank.
  findings.sort((a, b) => b.importanceScore - a.importanceScore);

  const risks: RiskOrConstraint[] = working
    .filter((d) => d.type === 'risk')
    .map((d) => ({
      id: randomUUID(),
      title: d.title,
      reason: d.summary,
      previouslyRuledOut: d.meta?.['previouslyRuledOut'],
      sourceIds: [d.sourceId],
    }));

  const decisions: PastDecision[] = working
    .filter((d) => d.type === 'decision')
    .map((d) => ({
      id: randomUUID(),
      date: d.date,
      decision: d.title,
      why: d.summary,
      owner: d.meta?.['owner'] ?? 'unknown',
      outcome: d.meta?.['outcome'] ?? 'unknown',
      sourceIds: [d.sourceId],
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  const gaps: Gap[] = working
    .filter((d) => d.type === 'gap')
    .map((d) => ({
      id: randomUUID(),
      description: `${d.title} — ${d.summary}`,
      recommendedNextStep: d.meta?.['recommendedNextStep'] ?? 'Plan targeted research.',
    }));

  if (hasTopic && working.length === 0) {
    gaps.push({
      id: randomUUID(),
      description: `No data found for topic "${req.topic}" in the selected time horizon and sources.`,
      recommendedNextStep:
        'Add grantmaking-specific sources or upload Tier 3 exports (Aha, Dovetail, Rally, Salesforce, Qlik, Mixpanel, HEAP, Klue, Gong, CMI).',
    });
  }

  // If AI mode requested, layer on generated refinement question.
  const refinementQuestions = [...REFINEMENT_QUESTIONS];
  if (req.analysisMode !== 'smart') {
    refinementQuestions.push(generateCustomQuestion(req.topic, findings));
  }

  return {
    id: randomUUID(),
    topic: req.topic,
    decision: req.decision,
    timeHorizonMonths: req.timeHorizonMonths,
    analysisMode: req.analysisMode,
    createdAt: new Date().toISOString(),
    sourcesScanned,
    findings,
    risks,
    decisions,
    gaps,
    refinementQuestions,
  };
}

function toFinding(d: RawDataPoint, allWorking: RawDataPoint[]): Finding {
  const source = getSource(d.sourceId);
  const convergence = computeConvergence(d, allWorking);
  const recency = computeRecency(d.date);
  const authority = authorityFor(d.sourceId);
  const importance = round(convergence * 0.4 + recency * 0.35 + authority * 0.25);
  return {
    id: randomUUID(),
    title: d.title,
    summary: d.summary,
    sourceId: d.sourceId,
    sourceLabel: source?.label ?? d.sourceId,
    date: d.date,
    url: d.url ?? source?.url,
    tags: d.tags,
    convergenceScore: convergence,
    recencyScore: recency,
    authorityScore: authority,
    importanceScore: importance,
  };
}

function computeConvergence(target: RawDataPoint, all: RawDataPoint[]): number {
  // Convergence = how many other sources share at least one tag.
  const otherSources = new Set<string>();
  for (const dp of all) {
    if (dp.sourceId === target.sourceId) continue;
    if (dp.tags.some((t) => target.tags.includes(t))) otherSources.add(dp.sourceId);
  }
  return Math.min(1, otherSources.size / 4);
}

function computeRecency(dateIso: string): number {
  const months = monthsBetween(new Date(dateIso), new Date());
  // 0 months -> 1, 24 months -> ~0.
  return clamp01(1 - months / 24);
}

function authorityFor(sourceId: string): number {
  // Internal first-party research and analytics > public reviews > academic background.
  const tier1 = new Set(['dovetail', 'rally', 'sharepoint-ux-research', 'blackbaud-institute']);
  const tier2 = new Set(['mixpanel', 'heap', 'gong', 'aha', 'ado', 'qlik', 'salesforce']);
  const tier3 = new Set(['klue', 'cmi', 'g2', 'gartner', 'capterra', 'trustpilot']);
  if (tier1.has(sourceId)) return 1;
  if (tier2.has(sourceId)) return 0.8;
  if (tier3.has(sourceId)) return 0.65;
  return 0.5;
}

function matchesTopic(dp: RawDataPoint, topic: string): boolean {
  const q = topic.toLowerCase();
  const haystack = `${dp.title} ${dp.summary} ${dp.tags.join(' ')}`.toLowerCase();
  // Match any keyword (split on whitespace) — fuzzy enough for demo.
  return q.split(/\s+/).filter((t) => t.length > 2).some((t) => haystack.includes(t));
}

function generateCustomQuestion(topic: string, findings: Finding[]): string {
  if (findings.length === 0) return `What is the most concrete user pain you've heard related to ${topic || 'this topic'}?`;
  const top = findings[0];
  return `Findings suggest "${top.title.toLowerCase()}" — is that the moment we should focus on, or a downstream symptom?`;
}

// --- helpers ---

function monthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}

function monthsBetween(a: Date, b: Date): number {
  return Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()));
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function listAllSources(): SourceDefinition[] {
  return SOURCE_CATALOG;
}
