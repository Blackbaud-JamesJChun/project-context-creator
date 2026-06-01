/**
 * Sample seed data used by the demo analyzer when no real connectors are wired up yet.
 * Lets the UI and Copilot skill flow work end-to-end without external dependencies.
 */

export interface RawDataPoint {
  sourceId: string;
  title: string;
  summary: string;
  date: string;
  url?: string;
  tags: string[];
  type: 'finding' | 'decision' | 'risk' | 'gap';
  meta?: Record<string, string>;
}

export const SAMPLE_CORPUS: RawDataPoint[] = [
  {
    sourceId: 'givingusa',
    title: 'Individual giving declined 2.4% in real terms last year',
    summary:
      'Giving USA reports a continued multi-year decline in the share of households donating, even as total dollars hold flat due to large donors.',
    date: '2025-06-18',
    url: 'https://givingusa.org/',
    tags: ['fundraising', 'donor-retention', 'macro-trend'],
    type: 'finding',
  },
  {
    sourceId: 'blackbaud-institute',
    title: 'Mid-level donors are the fastest-growing retention opportunity',
    summary:
      "Blackbaud Institute's most recent index identifies $1k-$10k donors as the highest-ROI segment for retention investments.",
    date: '2025-09-02',
    url: 'https://institute.blackbaud.com/',
    tags: ['donor-retention', 'mid-level', 'segmentation'],
    type: 'finding',
  },
  {
    sourceId: 'dovetail',
    title: 'Onboarding friction during first gift entry — 7 of 9 interviews',
    summary:
      'Qualitative study with new fundraisers shows confusion locating constituent records before logging a first gift. Most quit and re-enter from search.',
    date: '2025-11-04',
    url: 'https://blackbaud.dovetail.com/home',
    tags: ['onboarding', 'gift-entry', 'workflow'],
    type: 'finding',
  },
  {
    sourceId: 'rally',
    title: 'Diary study: 14 days of fundraiser activity',
    summary:
      'Participants spend ~22% of week reconciling data across systems. Most-cited frustration: gift batch errors discovered only at close-of-month.',
    date: '2025-08-12',
    url: 'https://app.rallyuxr.com/blackbaud/studies/overview',
    tags: ['workflow', 'data-quality', 'gift-batch'],
    type: 'finding',
  },
  {
    sourceId: 'gong',
    title: 'Top objection in 38% of last quarter calls: "switching cost"',
    summary:
      'Prospects raise migration risk and retraining cost as primary blockers. Sales response varies — no canonical talk track yet.',
    date: '2025-10-22',
    url: 'https://blackbaud.app.gong.io/home',
    tags: ['sales', 'objection', 'migration'],
    type: 'finding',
  },
  {
    sourceId: 'klue',
    title: 'Competitor X launched AI-assisted donor research in April',
    summary:
      'Battlecard updated: competitor positions a "donor briefing" feature using LLM summarization of public donor signals. Pricing parity, narrower CRM coverage.',
    date: '2025-04-30',
    url: 'https://v2.app.klue.com/ask-klue?group=12238&sort=battlecards',
    tags: ['competitive', 'ai', 'donor-research'],
    type: 'finding',
  },
  {
    sourceId: 'g2',
    title: 'Reviews trending: praise for reporting, criticism for setup',
    summary:
      'Sentiment analysis across 142 recent reviews — reporting is the top-praised area, initial setup and user provisioning is the top complaint.',
    date: '2025-12-15',
    url: 'https://www.g2.com/',
    tags: ['reviews', 'setup', 'reporting'],
    type: 'finding',
  },
  {
    sourceId: 'mixpanel',
    title: 'Drop-off at step 3 of new-user onboarding: 41%',
    summary:
      'Funnel analysis of last 90 days shows largest drop after the "connect a data source" step. Power users skip it; new users get stuck.',
    date: '2026-01-08',
    url: 'https://mixpanel.com/project/2168831/view/138520/app/home',
    tags: ['onboarding', 'funnel', 'analytics'],
    type: 'finding',
  },
  {
    sourceId: 'aha',
    title: 'Top-voted idea: AI-assisted constituent matching (412 votes)',
    summary:
      'Customers asking for fuzzy / AI-driven match suggestions when entering new constituents. Many duplicate suggestions filed since 2023.',
    date: '2026-02-19',
    url: 'https://blackbaud.aha.io/products/BLKB/',
    tags: ['ai', 'constituent-matching', 'feature-request'],
    type: 'finding',
  },
  {
    sourceId: 'sharepoint-ux-research',
    title: 'Persona refresh: "The Accidental Admin" emerged in 2024 research',
    summary:
      'Non-technical staff getting handed admin duties after turnover. Smaller orgs especially. Was a minor segment in 2022 — now estimated 28% of admin users.',
    date: '2024-11-12',
    url: 'https://blackbaud.sharepoint.com/sites/UXteam',
    tags: ['persona', 'admin', 'small-org'],
    type: 'finding',
  },

  // --- Past decisions ---
  {
    sourceId: 'sharepoint-ux-research',
    title: 'Decision: deprecate wizard-style onboarding (Q3 2024)',
    summary:
      'After two rounds of testing, the linear wizard was replaced with a checklist pattern because users wanted to skip ahead and return later.',
    date: '2024-09-30',
    url: 'https://blackbaud.sharepoint.com/sites/UXteam',
    tags: ['onboarding', 'decision'],
    type: 'decision',
    meta: { owner: 'UX — Onboarding pod', outcome: 'Adopted across 3 products; +12% completion' },
  },
  {
    sourceId: 'ado',
    title: 'Decision: pause AI-assisted gift coding pilot (Q1 2025)',
    summary:
      'Pilot showed accuracy gains but compliance review flagged training-data provenance concerns. Pilot paused pending vendor review.',
    date: '2025-02-14',
    url: 'https://dev.azure.com/blackbaud',
    tags: ['ai', 'gift-coding', 'decision', 'compliance'],
    type: 'decision',
    meta: { owner: 'Fundraising platform team', outcome: 'On hold — re-evaluate Q3 2026' },
  },
  {
    sourceId: 'cmi',
    title: 'Decision: position against Competitor X on ecosystem breadth, not feature parity',
    summary:
      'CMI brief concluded chasing feature parity in donor research would dilute. Positioning instead emphasizes integrated giving ecosystem.',
    date: '2025-07-21',
    url: 'https://outlook.cloud.microsoft/groups/blackbaud.com/CMI/files',
    tags: ['competitive', 'positioning', 'decision'],
    type: 'decision',
    meta: { owner: 'PMM + CMI', outcome: 'Adopted in FY26 messaging' },
  },

  // --- Risks / constraints ---
  {
    sourceId: 'ado',
    title: 'Data residency constraints for EU customers',
    summary:
      'Any analysis pipeline touching EU constituent data must remain in-region. Affects where AI services can be deployed.',
    date: '2025-05-10',
    url: 'https://dev.azure.com/blackbaud',
    tags: ['compliance', 'eu', 'ai'],
    type: 'risk',
    meta: { previouslyRuledOut: 'Single-region US-only AI inference' },
  },
  {
    sourceId: 'sharepoint-ux-research',
    title: 'Mobile-first onboarding ruled out in 2023',
    summary:
      'Past research showed admin tasks are overwhelmingly desktop. Mobile-first onboarding was deprioritized; mobile parity scoped instead.',
    date: '2023-10-04',
    url: 'https://blackbaud.sharepoint.com/sites/UXteam',
    tags: ['mobile', 'onboarding', 'risk'],
    type: 'risk',
    meta: { previouslyRuledOut: 'Mobile-first onboarding flow' },
  },

  // --- Gaps ---
  {
    sourceId: 'rally',
    title: 'Gap: no recent research on multi-org administrators',
    summary:
      'Last study touching users who admin 2+ tenants is from 2022. Significant product changes since.',
    date: '2026-03-01',
    url: 'https://app.rallyuxr.com/blackbaud/studies/overview',
    tags: ['gap', 'multi-org', 'admin'],
    type: 'gap',
    meta: { recommendedNextStep: 'Recruit 6-8 multi-org admins for 60-min interviews' },
  },
  {
    sourceId: 'heap',
    title: 'Gap: limited behavioral signal on "Accidental Admin" persona',
    summary:
      'We can identify the persona qualitatively but lack a HEAP segment to size it or track behavior longitudinally.',
    date: '2026-02-25',
    url: 'https://heapanalytics.com/app/env/528267405/overview/usage-baselines',
    tags: ['gap', 'analytics', 'persona'],
    type: 'gap',
    meta: { recommendedNextStep: 'Define HEAP segment rules for non-technical admin signal' },
  },
];
