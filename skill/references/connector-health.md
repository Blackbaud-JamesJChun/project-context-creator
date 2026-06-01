# Connector Health Diagnostics

## Health endpoint

```
GET http://localhost:4300/api/connectors/health
```

Returns a JSON array of per-connector status objects:

```json
[
  { "id": "rally",    "status": "ok" | "auth_error" | "unreachable" | "degraded", "latencyMs": 120 },
  { "id": "aha",      "status": "ok" | "auth_error" | "unreachable" | "degraded", "latencyMs": 85 },
  { "id": "dovetail", "status": "ok" | "auth_error" | "unreachable" | "degraded", "latencyMs": 94 }
]
```

## Status meanings

| Status        | Meaning                                                           | Action                                                        |
|---------------|-------------------------------------------------------------------|---------------------------------------------------------------|
| `ok`          | Connector authenticated and reachable.                            | Proceed normally.                                             |
| `auth_error`  | Token present but rejected by the provider.                       | Re-prompt user for a valid token via the `inputs` secret.     |
| `unreachable` | Network timeout or DNS failure.                                   | Check VPN, confirm endpoint URL in `mcp.json`.                |
| `degraded`    | Responding but returning partial or error payloads.               | Use with caution; flag results as potentially incomplete.      |
| `unconfigured`| No token supplied; connector skipped.                             | Treat source as unavailable; fall back to manual export.       |

## Diagnostic flow

1. Call `GET /api/connectors/health` before calling `POST /api/context/analyze`.
2. For each connector the user selected as a source:
   - If `ok` → include in the analysis call.
   - If `auth_error` → prompt the user to re-enter the token (never log or display the token value).
   - If `unreachable` or `degraded` → warn the user and ask whether to skip or proceed with the risk flagged.
   - If `unconfigured` → treat as Tier 3 manual-export gap; surface in the Gaps section of the output.
3. Surface a health summary banner before presenting findings:
   - **All connectors healthy** — no action needed.
   - **Partial coverage** — list which connectors were skipped and why.
   - **All selected connectors unavailable** — halt and guide user through recovery before proceeding.

## Rally-specific notes

- Endpoint: `https://mcp.rallyuxr.com/mcp`
- Auth: `Authorization: Bearer <rallyApiToken>`
- Common issue: tokens expire every 90 days. If `auth_error`, direct user to Rally UXR Settings → API Tokens.

## Aha-specific notes

- Endpoint: `https://blackbaud.aha.io/api/v1/mcp`
- Auth: `Authorization: Bearer <ahaApiToken>`
- Common issue: tokens are workspace-scoped. Confirm the token matches the `blackbaud` workspace.
  To generate: Aha! → Profile → Developer → API Keys.

## Dovetail-specific notes

- Endpoint: `https://dovetail.com/api/mcp`
- Auth: `Authorization: Bearer <dovetailApiToken>`
- Common issue: token must have at least `read:insights` scope.
  To generate: Dovetail → Settings → API → Personal tokens.
