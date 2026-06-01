# Project Context Builder

A dual-mode tool that helps UX designers, researchers, and PMs **get up to speed on a new project fast** by gathering, organizing, and analyzing everything already known about a topic — past research, decisions (and why), competitive intel, user signals, market data, and gaps worth investigating.

## Two ways to use it

### 1. Web app (interactive)

```bash
npm install
npm run dev   # starts both frontend (4200) and backend (4300)
```

Then open **http://localhost:4200** and start a new context brief.

The app gives you:
- A wizard to pick topic, decision, time horizon, sources, and analysis mode
- **Dashboard** — top 5 findings ranked by recency × source authority × convergence
- **Decision timeline** — chronological view of past decisions, why, and outcomes
- **Search** — full-text search across findings, decisions, and risks
- **Sources** — every source that contributed, with links

### 2. GitHub Copilot skill (quick brief)

The skill `project-context-builder` lives in [.github/skills/project-context-builder/SKILL.md](.github/skills/project-context-builder/SKILL.md). It activates on prompts like:

- "Gather project context for [topic]"
- "What do we already know about [feature]?"
- "Kick off discovery for [project]"

When active, it walks you through topic → decision → sources → analysis mode, calls the backend, and returns a structured brief with **findings · risks · decisions · gaps · refinement questions** — formatted for fast scanning.

> **Requires the backend running** at `http://localhost:4300`. Start with `npm run server`.

## Output format (designed for fast ramp-up)

Every brief — whether from the app or Copilot — uses the same fixed shape so designers know exactly where to look:

1. **🎯 Top 5 key findings** — each with source, date, recency/convergence score
2. **⚠️ Risks &amp; constraints** — what's been ruled out and why
3. **🗂️ Past decisions** — what was decided, why, by whom, with outcome
4. **🕳️ Gaps &amp; open questions** — what we don't know + recommended next step
5. **🧭 Refinement questions** — prompts to sharpen the next conversation:
   - "Narrow this to a specific moment in the journey?"
   - "Which system is the source of truth?"
   - "User problem or system/process problem?"
   - "Can you give a concrete example?"

## Data sources

The catalog (`server/lib/sources.ts`) covers 45+ sources across three tiers:

| Tier | How it's accessed | Examples |
|------|-------------------|----------|
| **Public** | Direct API / scrape, no auth | Blackbaud Institute, GivingUSA, Candid, NCCS, SSIR, Gartner, G2, Capterra, Trustpilot, BoardSource, AFP, ARNOVA, Cambridge Voluntas, JHU CCSS, etc. |
| **MCP-ready** | Via Azure DevOps / Microsoft MCP servers (when configured) | SharePoint UX team, Figma, Miro, Azure DevOps, Blackbaud Video Hub |
| **Manual export** | Upload CSV/JSON (no unified MCP yet) | Aha, Dovetail, Rally UXR, Gong, Salesforce, Qlik, Mixpanel, HEAP, CMI, Klue |

The skill **always asks** if you exported data from Tier 3 sources before running, because those hold the highest-value internal signal. Sources you don't include are flagged as gaps in the output.

## Analysis modes

- **Smart Organization** (default, fast, deterministic): dedupe, categorize, rank by recency + source authority + tag convergence, build the decision timeline.
- **AI Deep Dive** (slower, generative): summarize large datasets, detect contradictions, score risks, infer gaps, generate custom refinement questions.
- **Both**: smart first, then AI layer on top.

## Architecture

```
skyux-spa-project-context-builder/
├── .github/skills/project-context-builder/   ← Copilot skill (SKILL.md)
├── server/                                    ← Express + TypeScript backend
│   ├── index.ts                               ← REST API on :4300
│   └── lib/
│       ├── models.ts                          ← Shared types
│       ├── sources.ts                         ← 45+ source catalog
│       ├── analyze.ts                         ← Ranking + analysis logic
│       ├── seed-data.ts                       ← Sample corpus for demo
│       └── store.ts                           ← In-memory store
└── src/app/                                   ← Angular / SKY UX frontend
    ├── home/                                  ← Wizard (start a brief)
    ├── context/                               ← Brief views
    │   ├── context-shell.*                    ← Tab layout
    │   ├── dashboard/                         ← Findings, risks, decisions, gaps
    │   ├── timeline/                          ← Chronological decisions/constraints
    │   ├── search/                            ← Full-text search
    │   └── sources/                           ← Source list w/ links
    └── shared/
        ├── models.ts
        └── context.service.ts                 ← API client
```

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/health` | Liveness check |
| `GET` | `/api/sources` | Full source catalog |
| `POST` | `/api/context/analyze` | Run analysis, returns full brief |
| `GET` | `/api/context` | List saved briefs |
| `GET` | `/api/context/:id` | Get one brief |
| `GET` | `/api/context/:id/search?q=...` | Search within a brief |

## Authenticated connector env vars

The backend now supports provider-specific ingestion for selected live connectors when credentials are present.

- `DOVETAIL_API_TOKEN` - enables Dovetail API ingestion (`dovetail` source)
- `ADO_PAT` - enables Azure DevOps wiki search ingestion (`ado` source)
- `ADO_ORG` - optional ADO org name (default: `blackbaud`)
- `ADO_PROJECT` - optional project filter for ADO search

If these vars are missing, the backend degrades gracefully and skips authenticated connector fetches.

## Why this exists

Gathering context before a project today is fragmented and slow. Data lives in 15+ tools, half behind SSO, and the people who know things are tired of repeating themselves. This tool:

- **Lowers risk** of repeating ruled-out approaches by surfacing past decisions with reasoning
- **Saves stakeholder time** by aggregating known answers instead of pinging people
- **Surfaces gaps** so research effort goes where signal is actually missing
- **Ranks freshness** so the most recent and most-converged-on findings rise to the top
- **Standardizes the brief shape** so designers learn one structure and can scan any topic

## Roadmap / future work

- Replace in-memory store with SQLite/PostgreSQL
- Wire real connectors for Tier 1 sources (currently uses seed data)
- Hook into Azure DevOps + Microsoft MCP for Tier 2
- File upload UI for Tier 3 exports
- Real LLM call for AI Deep Dive mode (currently a stub)
- Export to PDF/markdown stakeholder brief
- Collaboration: annotations and team notes

---

Original SKY UX scaffolding documentation below.

---

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
