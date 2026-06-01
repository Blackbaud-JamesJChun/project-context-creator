---
name: project-context-builder
description: Gather, organize, and analyze existing research, decisions, competitive intel, and user insights about a topic before starting a UX project. Activate when the user says "gather context", "build project context", "what do we already know about...", "kick off discovery for...", "research summary for...", or mentions starting a new UX project and needing background. Connects to the Project Context Builder app (skyux-spa-project-context-builder) and its backend API to ingest data from SharePoint, Figma, Miro, Aha, Dovetail, Rally UXR, Gong, Salesforce, Qlik, Mixpanel, HEAP, Klue, CMI documents, Blackbaud Institute, GivingUSA, Candid, NCCS, Gartner, G2, Capterra, and academic nonprofit research journals. Designed for UX designers, researchers, and PMs at Blackbaud.
---

# Project Context Builder

A Copilot skill that helps UX teams ramp up on a new project quickly by gathering everything we already know about a topic — past research, decisions made (and why), competitive intelligence, user feedback, market data, and gaps worth investigating.

> **How to install this skill in your repo**
> 1. Create the folder `.github/skills/project-context-builder/` at the root of your repository.
> 2. Save this file (or just its contents) inside that folder as `SKILL.md`.
> 3. Commit and push. GitHub Copilot will pick it up automatically on its next session.
> 4. (Optional) Run the companion app + backend from `skyux-spa-project-context-builder/` to power the API endpoints referenced below.

---

## When to activate

Activate when the user asks any of:

- "Gather project context for [topic]"
- "What do we already know about [feature / persona / workflow]?"
- "Kick off discovery for [project]"
- "Build a research brief on [topic]"
- "Summarize what's been done on [area] so I don't repeat it"
- Any new-project kickoff where they need to ramp up fast

## Prerequisites

The skill expects the local backend to be running:

```bash
cd skyux-spa-project-context-builder
npm run server
```

Backend listens on `http://localhost:4300/api` by default. The companion UI runs at `https://localhost:4200/project-context-builder/` via `npm start`.

If the backend is unreachable, tell the user:
> "The Project Context Builder backend isn't running. Start it with `cd skyux-spa-project-context-builder && npm run server` and try again."

---

## Workflow

Follow this exact sequence — do not skip steps.

### Step 1 — Capture the topic and scope

Ask the user (in one consolidated message):

> Before I gather context, a few quick questions:
> 1. **Topic** — what feature, persona, workflow, or problem are we researching?
> 2. **Decision** — what decision are you trying to make with this context? (e.g., "scope an MVP", "pick a direction", "validate a hypothesis")
> 3. **Time horizon** — only include data from the last N months? (default: 24)

### Step 2 — Confirm data sources

Present the source tiers and ask which to include. Default to "all available".

**Tier 1 — Public / no-auth (always available):**
- Blackbaud Institute, GivingUSA, Candid, NCCS, Urban Institute, Council of Nonprofits, BoardSource, AFP, Independent Sector, SSIR, Indiana University Lilly School, ARNOVA, ISTR, IssueLab, JHU CCSS, Cambridge Voluntas, Wiley Nonprofit journals, SAGE NVSQ, Tandfonline Nonprofit Mgmt & Leadership, Gartner Peer Insights, G2, Capterra, Trustpilot, Google Scholar
- Blackbaud Knowledgebase, Training Support, On-demand webinars, Blackbaud University, YouTube (Blackbaud Support, SKY Developer), Blackbaud Community

**Tier 2 — Internal with MCP (if MCP server is configured):**
- SharePoint (UX team docs + research), Figma, Miro, Azure DevOps, Blackbaud Video Hub

**Tier 3 — Login-required, no unified MCP yet (manual export required):**
- Aha Idea Bank, Dovetail, Rally UXR, Gong, Salesforce, Qlik, Mixpanel, HEAP, CMI (Outlook group files), Klue

For Tier 3, if the user wants those sources included, ask the **export confirmation question** (mandatory — do not skip):

> **Did you export data from any of these and have it ready to upload?**
> - Aha Idea Bank
> - Dovetail
> - Rally UXR
> - Salesforce
> - Qlik
> - Mixpanel
> - HEAP
> - Klue
> - Gong
> - CMI (Competitive & Market Intelligence) documents
>
> If yes, share the file paths or upload them in the app at `https://localhost:4200/project-context-builder/`. If no, I'll proceed without them and flag them as gaps.

### Step 3 — Choose analysis depth

> Two analysis modes are available:
> - **Smart Organization** (fast, deterministic) — dedupe, categorize, surface most recent + most cited findings, build a decision timeline.
> - **AI Deep Dive** (slower, generative) — summarize large datasets, detect contradictions across sources, score risks, infer gaps, recommend next research moves.
>
> Which do you want? (You can run both — Smart first, then layer AI on top.)

### Step 4 — Trigger the backend

```http
POST http://localhost:4300/api/context/analyze
Content-Type: application/json

{
  "topic": "<user topic>",
  "decision": "<what decision>",
  "timeHorizonMonths": 24,
  "sources": ["blackbaud-institute", "givingusa", "sharepoint-ux", "dovetail-export"],
  "uploadedFiles": ["<paths if any>"],
  "analysisMode": "smart"
}
```

Show a brief status message while waiting ("Pulling from N sources…").

### Step 5 — Format the response

Use this **exact structure**. Do not improvise.

```markdown
# Project Context: <Topic>

> **Decision in play:** <what they're deciding>
> **Sources scanned:** <count> · **Time horizon:** last <N> months · **Analysis:** <mode>

## 🎯 Top 5 Key Findings
1. **<Finding>** — <one-sentence detail>. _Source: <name>, <date>._
2. ...
(rank by recency × source authority × convergence across sources)

## ⚠️ Risks & Constraints
- **<Constraint>** — <why it matters>. _Previously ruled out: <approach> because <reason>._

## 🗂️ Past Decisions (most recent first)
| When | What was decided | Why | Owner | Outcome |
|------|------------------|-----|-------|---------|
| <date> | <decision> | <reason> | <person/team> | <known outcome or "unknown"> |

## 🕳️ Gaps & Open Questions
- **<Gap>** — we don't know <X>. _Recommended next step: <action>._

## 🧭 Suggested Refinement Questions
Before going further, consider asking your team:
- "That sounds broad — can you narrow this to a specific moment in the journey?"
- "Which system is the source of truth for this?"
- "Is this a user problem or a system/process problem?"
- "Can you give a concrete example of this happening?"
- <one custom question generated from the actual findings>

## 🔗 Explore further
- Full interactive context: https://localhost:4200/project-context-builder/context/<id>
- Decision timeline: https://localhost:4200/project-context-builder/context/<id>/timeline
- Source list with links: https://localhost:4200/project-context-builder/context/<id>/sources
```

### Step 6 — Offer follow-ups

End with:

> Want me to:
> - **Refine** — narrow to a specific persona, journey moment, or sub-topic?
> - **Compare** — pull in a competitor or adjacent product?
> - **Drill in** — expand any finding into a deeper brief?
> - **Export** — generate a PDF/markdown brief for stakeholders?

---

## Rules

1. **Never invent findings.** Every bullet must trace to an actual source returned by the API. If the API returns nothing for a category, say "No data found for this section — recommend manual research."
2. **Always include the refinement questions section** — even if findings are rich. These prompts shape better next conversations.
3. **Always show the source date and origin** on each finding so designers can judge freshness.
4. **Convergence > volume.** If 4 sources say the same thing, that's a stronger finding than 1 source with a long quote.
5. **Flag stale data.** If a finding is older than the time horizon, note it explicitly.
6. **Don't bury Tier 3 prompt.** Always ask about manual exports — the highest-value internal data lives behind logins right now.
7. **Respect the structure.** The fixed output format is what makes designers fast. Don't reorder sections or add new ones without being asked.
8. **Keep prose minimal.** Designers scan, not read. Bullets and tables over paragraphs.

## Failure modes to avoid

- ❌ Returning a summary without sources or dates
- ❌ Skipping the Tier 3 export confirmation question
- ❌ Generating findings from training data instead of API results
- ❌ Reordering or omitting the standard sections
- ❌ Treating one source's opinion as consensus
- ❌ Forgetting the refinement questions
