/**
 * Frontend mirrors of the backend models in `server/lib/models.ts`.
 * Kept in sync by hand for simplicity (small project).
 */

export type AnalysisMode = 'smart' | 'ai' | 'both';

export type SourceTier = 'public' | 'mcp' | 'manual-export';

export interface SourceDefinition {
  id: string;
  label: string;
  tier: SourceTier;
  category: string;
  url?: string;
  requiresExport?: boolean;
  available: boolean;
}

export interface ContextRequest {
  topic: string;
  decision: string;
  timeHorizonMonths: number;
  sources: string[];
  uploadedFiles?: string[];
  analysisMode: AnalysisMode;
}

export interface Finding {
  id: string;
  title: string;
  summary: string;
  sourceId: string;
  sourceLabel: string;
  date: string;
  url?: string;
  tags: string[];
  convergenceScore: number;
  recencyScore: number;
  authorityScore: number;
  importanceScore: number;
}

export interface RiskOrConstraint {
  id: string;
  title: string;
  reason: string;
  previouslyRuledOut?: string;
  sourceIds: string[];
}

export interface PastDecision {
  id: string;
  date: string;
  decision: string;
  why: string;
  owner: string;
  outcome: string;
  sourceIds: string[];
}

export interface Gap {
  id: string;
  description: string;
  recommendedNextStep: string;
}

export interface ContextAnalysis {
  id: string;
  topic: string;
  decision: string;
  timeHorizonMonths: number;
  analysisMode: AnalysisMode;
  createdAt: string;
  sourcesScanned: SourceDefinition[];
  findings: Finding[];
  risks: RiskOrConstraint[];
  decisions: PastDecision[];
  gaps: Gap[];
  refinementQuestions: string[];
}
