/**
 * Shared types between backend and frontend.
 */

export type AnalysisMode = 'smart' | 'ai' | 'both';

export type SourceTier = 'public' | 'mcp' | 'manual-export';

export interface SourceDefinition {
  id: string;
  label: string;
  tier: SourceTier;
  category:
    | 'industry-research'
    | 'academic'
    | 'reviews'
    | 'internal-research'
    | 'design-files'
    | 'product-analytics'
    | 'sales-calls'
    | 'crm'
    | 'competitive'
    | 'community'
    | 'help-training';
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
  date: string; // ISO
  url?: string;
  tags: string[];
  convergenceScore: number; // 0..1, how many sources agree
  recencyScore: number; // 0..1
  authorityScore: number; // 0..1
  importanceScore: number; // combined
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
