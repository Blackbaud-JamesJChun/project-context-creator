# Project Context Builder

> Gathers and synthesizes prior research, decisions, market intel, and user insights so UX teams can start projects with shared context.

**Status: draft**

---

## Overview

This skill is for UX designers, UX researchers, and PMs who need fast context before starting discovery work. It guides a consistent intake flow, validates source coverage, calls the local Project Context Builder backend, and returns a scan-friendly synthesis with findings, risks, decisions, and gaps.

## Supported folders

Create these folders as your skill needs them — they are not pre-created:

| Folder | Purpose | Example contents |
|--------|---------|-----------------|
| `skill/references/` | Reference documents the skill loads on demand | `research-standards.md`, `accessibility-guidelines.md` |
| `skill/assets/` | Templates and static resources the skill uses | `analysis-template.md`, `summary-format.md` |
| `skill/scripts/` | Executable helper scripts agents can run | `validate.py`, `extract-themes.sh` |
| `skill/evals/` | Eval definitions only | `eval-scenarios.yaml`, `trigger-prompts.md` |
| `eval-results/` | Eval results organized by iteration | `iteration-1/<eval-name>/{with_skill,without_skill}/` |

## Testing

To test this skill:

1. Open a new VS Code workspace (not this repo)
2. Open the Command Palette and use **"GitHub Copilot: Add Skill"**
3. Point it to the `skill/` folder inside your skill's directory in this locally cloned repo (e.g., `~/path-to-repo/skills/<skill-name>/skill/`)
4. Open GitHub Copilot and verify the skill triggers with a relevant prompt
5. Example test prompts:
   - `Gather project context for digital fundraising onboarding.`
   - `What do we already know about first-time donor conversion?`
   - `Build a research brief for nonprofit donation form completion.`
