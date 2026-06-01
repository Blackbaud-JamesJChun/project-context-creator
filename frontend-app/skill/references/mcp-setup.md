# MCP Setup and Authentication

This skill can pull context from multiple MCP-connected systems. Use this guide to install the MCP config, authenticate each data source, and verify connector health.

## 1. Install the MCP config in your workspace

Copy the skill template to your active workspace root as `.vscode/mcp.json`:

- `./assets/mcp.json`

If `.vscode/mcp.json` already exists, merge any missing server entries instead of overwriting your current file.

## 2. Restart VS Code

Restart VS Code after saving `.vscode/mcp.json` so MCP server discovery refreshes.

## 3. Authenticate each source

### Token-based sources (prompted by `inputs`)

The first MCP call to these sources will prompt you for secure token entry:

- Rally UXR: `rallyApiToken`
- Dovetail: `dovetailApiToken`
- Aha!: `ahaApiToken`

Token generation references:

- Rally UXR: Settings -> API Tokens
- Dovetail: Settings -> API -> Personal tokens (minimum scope: `read:insights`)
- Aha!: Profile -> Developer -> API Keys (workspace-scoped token for `blackbaud`)

### OAuth/interactive sources

These sources usually open an interactive sign-in flow from MCP tools:

- Figma (`https://mcp.figma.com/mcp`)
- Miro (`https://mcp.miro.com/`)
- Qlik (`https://blackbaudinsights.us.qlikcloud.com/api/v1/mcp`)
- Mixpanel (`https://mcp.mixpanel.com/mcp`)
- Heap (`https://mcp.pipedream.net/v2`)

If prompted, complete the provider sign-in in browser and return to VS Code.

### Local command-based connectors

These run through `npx` and may require pre-auth in their own CLIs:

- Azure DevOps MCP (`@azure-devops/mcp`)
- Salesforce MCP (`@salesforce/mcp`)
- WorkIQ MCP (`@microsoft/workiq`)

If these fail, ensure `node` and `npx` are installed, then complete the provider-specific login flow for the underlying tool.

## 4. Validate auth and reachability

Before running project context analysis, check connector health:

`GET http://localhost:4300/api/connectors/health`

Interpretation:

- `ok`: authenticated and reachable
- `auth_error`: token/sign-in invalid, re-authenticate
- `unreachable`: endpoint/network/VPN issue
- `degraded`: partial responses, proceed with caution
- `unconfigured`: token or auth not provided

## 5. Troubleshooting

- If token prompts do not appear: restart VS Code and reconnect MCP servers.
- If `auth_error` persists: regenerate token and retry.
- If only some sources connect: continue with available connectors and keep Tier 3 manual-export prompts enabled.
- Never hardcode tokens in files; always use `${input:...}` placeholders.

## Notes

- Some entries in `mcp.json` are placeholders until org-level auth/endpoint access is confirmed.
- Keep Tier 3 manual-export behavior enabled for non-live systems.
