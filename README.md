# AI-Based Agents E-Commerce — README

**Overview**

This repository contains a full-stack AI-driven fashion recommendation application composed of a Python FastAPI backend and a React + Vite frontend. The system collects user style preferences, profiles users, queries an LLM to generate candidate items, enforces strict catalog constraints, and returns curated product recommendations.

**Architecture Diagram**

```mermaid
flowchart LR
  A[User (Browser / Mobile App)] -->|preferences, NL queries| F(Frontend - React + Vite)
  F -->|POST /api/stylist/recommendations| B[Backend - FastAPI]
  B --> C[Recommendation Agent]
  C --> D[LLM (Groq)]
  C --> E[Product Catalog (Postgres / Neon)]
  D -->|text response| C
  C -->|validated results| B
  B -->|response| F
  F --> A
```

**Folder Structure (high-level)**

- `backend/` — FastAPI service, LLM client, recommendation agents, DB connectors
  - `app/agents/` — orchestration, profiling, and agent logic
  - `app/api/` — route definitions and error handlers
  - `app/core/` — configuration and exceptions
  - `app/llm/` — Groq client + helpers
  - `app/recommendations/` — recommendation engine and profile builder
  - `run.py`, `pyproject.toml`, `.env`
- `frontend/` — React + Vite UI, product catalog, and AI integration
  - `src/app/` — pages, components, contexts (preferences, cart), services
  - `src/app/data/` — seed product data used in UI
  - `tests/` — unit and integration tests (Vitest)

**AI Workflow**

1. Collect structured user preferences (budget, season, colors, body type, etc.).
2. Build a concise style profile using collected answers (profile builder).
3. Retrieve a filtered product catalog from the database.
4. Format a strictly constrained prompt containing the profile and the exact catalog.
5. Call the LLM and parse its structured response.
6. Validate output against budget and catalog; fall back to partial outfits if necessary.
7. Log generation metadata (costs, token usage, count) and return results to the frontend.

**Recommendation Pipeline (detailed)**

- Input validation: ensure `UserPreferences` are sane (budget/height numeric, colors array).
- Catalog retrieval: fetch in-scope products from Postgres / Neon.
- Prompt construction: include product IDs, exact names, prices, and rules (e.g., STRICT CATALOG ENFORCEMENT, budget constraints, output format).
- LLM call: send the prompt to `Groq` (configurable model via `GROQ_MODEL`).
- Parsing: parse the LLM textual output into structured items, extracting name, price, and reason.
- Validation: compare each recommended item against the catalog and sum prices vs. budget.
- Response: return sanitized recommendations and log metrics.

**Prompt Strategy**

- Principle: explicit constraints, short catalog context, and rigid output format reduce hallucinations.
- Use numbered output templates with labeled fields (`Product Name:`, `Price:`, `Reason:`).
- Enforce budget math and strict catalog matching in the prompt instructions.
- Include failure-handling instructions (e.g., recommend partial outfits when full outfit exceeds budget).

**Tech Stack**

- Frontend: React 18, Vite, TypeScript, Tailwind (UI), Vitest + Testing Library (tests)
- Backend: Python, FastAPI, Groq LLM client, Pydantic, Rich
- Database: PostgreSQL / Neon (via `NEON_DATABASE_URL`)
- Monitoring & Logging: structured logger for recommendations and cost monitors
- Testing / Mocks: `vitest`, `msw` for API mocking

**How to Run (development)**

Backend (Python):

```bash
# from repository root
cd backend
python -m venv .venv
.venv\Scripts\activate    # Windows PowerShell
pip install -r requirements.txt
cp .env.example .env      # or create .env with values below
python run.py
```

Frontend (React):

```bash
cd frontend
npm install   # or pnpm install
npm run dev
```

Run frontend tests:

```bash
cd frontend
npm install
npm run test
```

**Environment Variables**

- `GROQ_API_KEY` — API key for Groq LLM (required by backend).
- `GROQ_MODEL` — model id to use (default: `llama3-8b-8192`).
- `NEON_DATABASE_URL` — Postgres/Neon connection string.
- `VITE_BACKEND_URL` — frontend build-time backend URL (defaults to `http://localhost:3000`).
- Optional runtime flags in `app/core/config.py`: `MAX_RECOMMENDATIONS`, `MOCK_DATA_IF_DB_FAILS`.

**Known Limitations**

- LLM responses may still require robust parsing and sanitization; edge-cases exist for ambiguous price formats.
- Current pipeline uses synchronous LLM calls; high concurrency could increase latency and costs.
- Prompt-context length is bounded; large catalogs must be filtered or truncated before prompting.
- Tests currently focus on frontend utilities and a mocked integration; e2e tests for full stack are not yet present.

**Future Improvements**

- Add zero-downtime DB migrations and CI/CD for schema changes.
- Implement streaming parsing + token-cost-aware batching to reduce LLM costs.
- Add cache layer for frequent queries and product lookups.
- Add end-to-end tests (Playwright / Cypress) for real-world flows.
- Enhance prompt engineering with few-shot examples and automated prompt tuning.
- Add monitoring dashboards for per-recommendation cost and latency.

---

If you'd like, I can also:
- Generate an interactive architecture diagram file (Mermaid / FigJam)
- Add CI workflow for running the unit and integration tests

**Ownership**

This repository is solely owned and maintained by Hafiz Muhammad Muneeb. All application architecture, implementation, and integration work was completed by the owner. AI coding assistants were used only as development aids for ideation, debugging, and documentation where appropriate.
