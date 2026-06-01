import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { analyzeSmart, listAllSources } from './lib/analyze';
import { buildContextCorpus } from './lib/ingest';
import { get, list, save, search } from './lib/store';
import type { ContextRequest } from './lib/models';

const app = express();
const PORT = Number(process.env['PORT'] ?? 4300);
const DIST_DIR = path.resolve(process.cwd(), 'dist/project-context-builder');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.get('/api/sources', (_req, res) => {
  res.json({ sources: listAllSources() });
});

app.post('/api/context/analyze', async (req, res) => {
  const body = req.body as Partial<ContextRequest>;
  const request: ContextRequest = {
    topic: body.topic ?? '',
    decision: body.decision ?? '',
    timeHorizonMonths: body.timeHorizonMonths ?? 24,
    sources: body.sources ?? [],
    uploadedFiles: body.uploadedFiles ?? [],
    analysisMode: body.analysisMode ?? 'smart',
  };

  try {
    const corpus = await buildContextCorpus(request);
    const analysis = analyzeSmart(request, corpus);
    save(analysis);
    return res.json({ analysis });
  } catch (error) {
    return res.status(500).json({
      error: 'analysis_failed',
      message: error instanceof Error ? error.message : 'Unknown analysis failure',
    });
  }
});

app.get('/api/context', (_req, res) => {
  res.json({ items: list().map((a) => ({ id: a.id, topic: a.topic, createdAt: a.createdAt })) });
});

app.get('/api/context/:id', (req, res) => {
  const analysis = get(req.params['id']!);
  if (!analysis) return res.status(404).json({ error: 'not found' });
  return res.json({ analysis });
});

app.get('/api/context/:id/search', (req, res) => {
  const q = (req.query['q'] as string | undefined) ?? '';
  const result = search(req.params['id']!, q);
  res.json(result);
});

// Serve the built Angular app (if present) so a single port hosts UI + API.
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
  // eslint-disable-next-line no-console
  console.log(`[project-context-builder] Serving UI from ${DIST_DIR}`);
} else {
  // eslint-disable-next-line no-console
  console.log(`[project-context-builder] No dist/ found — run \`npm run build\` to enable single-port UI.`);
}

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[project-context-builder] Ready on http://localhost:${PORT}`);
});
