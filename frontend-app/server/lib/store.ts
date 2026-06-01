import type { ContextAnalysis } from './models';

/**
 * In-memory store. Production would swap for SQLite/Postgres.
 */
const store = new Map<string, ContextAnalysis>();

export function save(analysis: ContextAnalysis): void {
  store.set(analysis.id, analysis);
}

export function get(id: string): ContextAnalysis | undefined {
  return store.get(id);
}

export function list(): ContextAnalysis[] {
  return Array.from(store.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function search(id: string, query: string): {
  findings: ContextAnalysis['findings'];
  decisions: ContextAnalysis['decisions'];
  risks: ContextAnalysis['risks'];
} {
  const analysis = store.get(id);
  if (!analysis) return { findings: [], decisions: [], risks: [] };
  const q = query.toLowerCase();
  const match = (s: string) => s.toLowerCase().includes(q);
  return {
    findings: analysis.findings.filter((f) => match(f.title) || match(f.summary) || f.tags.some(match)),
    decisions: analysis.decisions.filter((d) => match(d.decision) || match(d.why) || match(d.outcome)),
    risks: analysis.risks.filter((r) => match(r.title) || match(r.reason)),
  };
}
