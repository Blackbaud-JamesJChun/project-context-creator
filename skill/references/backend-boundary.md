# Backend Integration Boundary

This skill invokes a local backend endpoint:

- `POST http://localhost:4300/api/context/analyze`
- `GET  http://localhost:4300/api/connectors/health`

Important boundary:

- MCP configuration alone does not guarantee live-source output.
- The backend must ingest from those connectors for results to change.
- If backend ingestion is not implemented, output may come from seed/sample corpora.

Operational guidance:

1. Validate backend health before running the skill.
2. Call `GET /api/connectors/health` to confirm Rally, Aha, and Dovetail connector status before calling analyze.
3. Validate connector ingestion path before claiming live coverage.
4. Keep manual-export prompts active as a fallback.

See `./connector-health.md` for full status codes, per-provider notes, and the diagnostic flow.
