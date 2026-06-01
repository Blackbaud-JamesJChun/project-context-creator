import type { SourceDefinition } from './models';

/**
 * Catalog of every data source the Project Context Builder knows about.
 * Tiered by how we can access them today.
 */
export const SOURCE_CATALOG: SourceDefinition[] = [
  // --- Tier 1: public / no auth ---
  { id: 'blackbaud-institute', label: 'Blackbaud Institute', tier: 'public', category: 'industry-research', url: 'https://institute.blackbaud.com/', available: true },
  { id: 'blackbaud-insights', label: 'Blackbaud Industry Insights', tier: 'public', category: 'industry-research', url: 'https://www.blackbaud.com/industry-insights/resources', available: true },
  { id: 'givingusa', label: 'Giving USA', tier: 'public', category: 'industry-research', url: 'https://givingusa.org/', available: true },
  { id: 'candid', label: 'Candid', tier: 'public', category: 'industry-research', url: 'https://candid.org/', available: true },
  { id: 'candid-learning', label: 'Candid Learning', tier: 'public', category: 'help-training', url: 'https://learning.candid.org/', available: true },
  { id: 'nccs', label: 'Urban Institute NCCS', tier: 'public', category: 'academic', url: 'https://urbaninstitute.github.io/nccs/', available: true },
  { id: 'council-nonprofits', label: 'Council of Nonprofits', tier: 'public', category: 'industry-research', url: 'https://www.councilofnonprofits.org/', available: true },
  { id: 'nonprofit-impact', label: 'Nonprofit Impact Matters', tier: 'public', category: 'industry-research', url: 'https://www.nonprofitimpactmatters.org/data/national-nonprofits-sector-reports/', available: true },
  { id: 'boardsource', label: 'BoardSource', tier: 'public', category: 'industry-research', url: 'https://boardsource.org/', available: true },
  { id: 'afp', label: 'Association of Fundraising Professionals', tier: 'public', category: 'industry-research', url: 'https://afpglobal.org/', available: true },
  { id: 'independent-sector', label: 'Independent Sector', tier: 'public', category: 'industry-research', url: 'https://independentsector.org/', available: true },
  { id: 'ssir', label: 'Stanford Social Innovation Review', tier: 'public', category: 'academic', url: 'https://ssir.org/', available: true },
  { id: 'google-scholar', label: 'Google Scholar', tier: 'public', category: 'academic', url: 'https://scholar.google.com/', available: true },
  { id: 'sage-journals', label: 'SAGE Journals', tier: 'public', category: 'academic', url: 'https://journals.sagepub.com/', available: true },
  { id: 'iu-lilly', label: 'IU Lilly Family School of Philanthropy', tier: 'public', category: 'academic', url: 'https://philanthropy.indianapolis.iu.edu/research/latest/index.html', available: true },
  { id: 'wiley-nonprofit', label: 'Wiley Nonprofit Management & Leadership', tier: 'public', category: 'academic', url: 'https://onlinelibrary.wiley.com/journal/15427854', available: true },
  { id: 'nvsq', label: 'SAGE NVSQ (Nonprofit & Voluntary Sector Quarterly)', tier: 'public', category: 'academic', url: 'https://journals.sagepub.com/home/nvsa', available: true },
  { id: 'voluntas', label: 'Cambridge Voluntas', tier: 'public', category: 'academic', url: 'https://www.cambridge.org/core/journals/voluntas', available: true },
  { id: 'jhu-ccss', label: 'JHU Center for Civil Society Studies', tier: 'public', category: 'academic', url: 'https://ccss.jhu.edu/', available: true },
  { id: 'istr', label: 'International Society for Third-Sector Research', tier: 'public', category: 'academic', url: 'https://www.istr.org/', available: true },
  { id: 'arnova', label: 'ARNOVA', tier: 'public', category: 'academic', url: 'https://www.arnova.org/', available: true },
  { id: 'issuelab', label: 'IssueLab', tier: 'public', category: 'industry-research', url: 'https://www.issuelab.org/', available: true },
  { id: 'wnon', label: 'Tandfonline Nonprofit Management', tier: 'public', category: 'academic', url: 'https://www.tandfonline.com/journals/wnon20', available: true },
  { id: 'gartner', label: 'Gartner Peer Insights', tier: 'public', category: 'reviews', url: 'https://www.gartner.com/peer-insights/home', available: true },
  { id: 'g2', label: 'G2', tier: 'public', category: 'reviews', url: 'https://www.g2.com/', available: true },
  { id: 'capterra', label: 'Capterra', tier: 'public', category: 'reviews', url: 'https://www.capterra.com/', available: true },
  { id: 'trustpilot', label: 'Trustpilot', tier: 'public', category: 'reviews', url: 'https://www.trustpilot.com/', available: true },
  { id: 'bb-kb', label: 'Blackbaud Knowledgebase', tier: 'public', category: 'help-training', url: 'https://kb.blackbaud.com/knowledgebase/', available: true },
  { id: 'bb-training', label: 'Blackbaud Training & Support', tier: 'public', category: 'help-training', url: 'https://www.blackbaud.com/training-support/support/howto', available: true },
  { id: 'bb-webinars', label: 'Blackbaud On-Demand Webinars', tier: 'public', category: 'help-training', url: 'https://www.blackbaud.com/events/all-events?event-type=595', available: true },
  { id: 'bb-university', label: 'Blackbaud University', tier: 'public', category: 'help-training', url: 'https://learn.blackbaud.com/pages/18/home', available: true },
  { id: 'yt-bb-support', label: 'YouTube — Blackbaud Support', tier: 'public', category: 'help-training', url: 'https://www.youtube.com/@BlackbaudSupport', available: true },
  { id: 'yt-bb-skydev', label: 'YouTube — SKY Developer', tier: 'public', category: 'help-training', url: 'https://www.youtube.com/@BlackbaudSKYDeveloper', available: true },
  { id: 'bb-community', label: 'Blackbaud Community', tier: 'public', category: 'community', url: 'https://community.blackbaud.com/', available: true },

  // --- Tier 2: MCP-ready internal sources ---
  { id: 'sharepoint-ux', label: 'SharePoint — UX Team', tier: 'mcp', category: 'internal-research', url: 'https://blackbaud.sharepoint.com/sites/UXteam/Shared%20Documents/Forms/AllItems.aspx', available: false },
  { id: 'sharepoint-ux-research', label: 'SharePoint — UX Research', tier: 'mcp', category: 'internal-research', url: 'https://blackbaud.sharepoint.com/sites/UXteam/Shared%20Documents/UX%20Research', available: false },
  { id: 'miro', label: 'Miro', tier: 'mcp', category: 'design-files', url: 'https://miro.com/app/dashboard/', available: false },
  { id: 'figma', label: 'Figma', tier: 'mcp', category: 'design-files', url: 'https://www.figma.com/files/1033400962799437589/recents-and-sharing', available: false },
  { id: 'ado', label: 'Azure DevOps', tier: 'mcp', category: 'internal-research', url: 'https://dev.azure.com/blackbaud', available: false },
  { id: 'bb-videohub', label: 'Blackbaud Video Hub', tier: 'mcp', category: 'help-training', url: 'https://blackbaud.sharepoint.com/_layouts/15/videohub.aspx', available: false },

  // --- Tier 3: login required, no unified MCP yet ---
  { id: 'aha', label: 'Aha Idea Bank', tier: 'manual-export', category: 'internal-research', url: 'https://blackbaud.aha.io/products/BLKB/', requiresExport: true, available: false },
  { id: 'dovetail', label: 'Dovetail', tier: 'manual-export', category: 'internal-research', url: 'https://blackbaud.dovetail.com/home', requiresExport: true, available: false },
  { id: 'rally', label: 'Rally UXR', tier: 'manual-export', category: 'internal-research', url: 'https://app.rallyuxr.com/blackbaud/studies/overview', requiresExport: true, available: false },
  { id: 'gong', label: 'Gong', tier: 'manual-export', category: 'sales-calls', url: 'https://blackbaud.app.gong.io/home', requiresExport: true, available: false },
  { id: 'salesforce', label: 'Salesforce', tier: 'manual-export', category: 'crm', url: 'https://blackbaud.lightning.force.com/lightning/page/home', requiresExport: true, available: false },
  { id: 'qlik', label: 'Qlik', tier: 'manual-export', category: 'product-analytics', url: 'https://blackbaudinsights.us.qlikcloud.com/insights/home', requiresExport: true, available: false },
  { id: 'mixpanel', label: 'Mixpanel', tier: 'manual-export', category: 'product-analytics', url: 'https://mixpanel.com/project/2168831/view/138520/app/home', requiresExport: true, available: false },
  { id: 'heap', label: 'HEAP', tier: 'manual-export', category: 'product-analytics', url: 'https://heapanalytics.com/app/env/528267405/overview/usage-baselines', requiresExport: true, available: false },
  { id: 'cmi', label: 'Competitive & Market Intelligence (CMI)', tier: 'manual-export', category: 'competitive', url: 'https://outlook.cloud.microsoft/groups/blackbaud.com/CMI/files', requiresExport: true, available: false },
  { id: 'klue', label: 'Klue', tier: 'manual-export', category: 'competitive', url: 'https://v2.app.klue.com/ask-klue?group=12238&sort=battlecards', requiresExport: true, available: false },
];

export function getSource(id: string): SourceDefinition | undefined {
  return SOURCE_CATALOG.find((s) => s.id === id);
}
