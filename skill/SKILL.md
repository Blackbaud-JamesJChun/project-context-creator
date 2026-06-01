---
name: project-context-builder
description: Gather, organize, and analyze existing research, decisions, competitive intel, and user insights before starting a UX project.
argument-hint: Topic, decision to support, and optional time horizon in months.
---

# Project Context Builder

## References

- MCP setup and connector reference: `./references/mcp-setup.md`
- MCP server config template: `./assets/mcp.json`
- Source tiers: `./references/source-tier-map.md`
- Source IDs for API payloads: `./references/source-id-cheatsheet.md`
- Quality constraints: `./references/quality-rules.md`
- Backend scope boundary: `./references/backend-boundary.md`
- Connector health diagnostics: `./references/connector-health.md`

## Assets

- Intake prompt template: `./assets/intake-questions-template.md`
- Tier 3 export confirmation prompt: `./assets/tier3-export-confirmation.md`
- API payload template: `./assets/api-request-template.json`
- Output format template: `./assets/response-template.md`
- Follow-up options template: `./assets/follow-up-options-template.md`

## When to Use

- User asks to gather project context for a topic before discovery.
- User asks what is already known about a feature, persona, workflow, or problem.
- User wants a kickoff research summary to avoid repeating prior work.
- User asks for a discovery brief with past decisions, risks, and open gaps.

## What You Provide

- Topic scope (feature, persona, workflow, or problem area).
- Decision to inform (for example: scope MVP, pick direction, validate hypothesis).
- Time horizon in months (default 24).
- Selected data source tiers and any Tier 3 export file paths.
- Analysis mode selection: smart organization or AI deep dive.

## Procedure

1. Ask a consolidated kickoff prompt for: topic, decision, and time horizon.
2. Confirm source tiers to include. Default to all available sources.
3. Ask the mandatory Tier 3 export confirmation question for login-required systems. If exports are not provided, proceed and flag as gaps.
4. Ask user to choose analysis depth: smart organization, AI deep dive, or both.
5. Ensure backend is running at `http://localhost:4300/api`. If unavailable, instruct the user to run:
	- `cd /path/to/skyux-spa-project-context-builder && npm run server`
	- If path is unknown: `find ~/Documents -maxdepth 5 -type d -name 'skyux-spa-project-context-builder'`
6. Run connector health diagnostics before calling analyze (see `./references/connector-health.md`):
	- Call `GET http://localhost:4300/api/connectors/health`.
	- For any selected source with status `auth_error`: re-prompt the user for a valid token (never display the token value).
	- For `unreachable` or `degraded`: warn the user and confirm whether to skip or proceed with the risk flagged.
	- For `unconfigured`: treat as a Tier 3 gap and surface it in the Gaps section.
	- Surface a health summary banner before presenting findings.
7. Call `POST /api/context/analyze` with topic, decision, time horizon, selected sources, uploaded file paths, and analysis mode.
8. Present findings in this fixed order:
	- Project Context title and run metadata
	- Top 5 Key Findings with source and date on each
	- Risks and Constraints
	- Past Decisions table (most recent first)
	- Gaps and Open Questions
	- Suggested Refinement Questions
	- Explore Further links
9. Enforce quality rules:
	- Never invent findings.
	- Always include source origin and date.
	- Prioritize convergence across sources over volume.
	- Flag stale findings older than time horizon.
	- Include refinement questions even when evidence is strong.
10. End with follow-up options: refine, compare, drill in, or export.
