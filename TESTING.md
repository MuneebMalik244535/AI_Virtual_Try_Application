# Testing

## 1. Testing Strategy

### Unit tests
- Backend uses `pytest` for small test cases around data validation and environment-based configuration.
- Frontend uses `vitest` for unit tests covering utility logic, API client behavior, and a React context provider.

### Integration tests
- Frontend includes one integration test using `msw` to mock the recommendation API endpoint and verify that `stylistApi.getRecommendations` correctly handles a backend response.
- There are no backend integration tests currently present in the repository.

### End-to-end tests
- No end-to-end tests are present.
- There is no Playwright, Cypress, or equivalent e2e suite in the repository.

### Manual testing
- Manual verification is not documented as a dedicated test script or checklist in the repository.
- The existing test setup shows the intended manual validation points: API client behavior, input validation, and configuration behavior.

## 2. Test Coverage

### What components are tested
- Backend request schema validation through `backend/tests/test_request_schema.py`.
- Backend environment validation for `DatabaseManager` in `backend/tests/test_database_manager.py`.
- Frontend utility filtering logic in `frontend/tests/unit/filter.test.ts`.
- Frontend API client success and error handling in `frontend/tests/unit/stylistApi.test.ts`.
- Frontend preferences context default values in `frontend/tests/unit/preferences-context.test.ts`.
- Frontend recommendation API integration with a mocked backend in `frontend/tests/integration/recommendation-api.int.test.ts`.

### What components are not tested
- Backend FastAPI route handlers and endpoint behavior.
- Backend recommendation engine, product retrieval, stylist orchestration, and profile-building logic.
- Backend persistence and actual database query behavior beyond environment URL handling.
- Backend LLM/Groq integration, prompt generation, and AI response handling.
- Backend logging, monitoring, and structured logger output.
- Frontend pages, components, and user interface flows beyond unit-level service/context tests.
- Full production-like end-to-end user flow from frontend to backend.

### Current limitations
- The current test set is small and centered on schema validation and a few frontend units.
- Backend tests do not exercise real API routes or database behavior.
- Frontend integration coverage is limited to a mocked API client scenario, not actual network requests to a live backend.
- No coverage or test reports are included, so code coverage is not currently measured or enforced.

## 3. Existing Test Files

- `backend/tests/test_request_schema.py`
  - Verifies Pydantic request schemas for stylist, search, chat, and outfit requests.
  - Checks clean-up of input values and validation rejection for invalid payloads.

- `backend/tests/test_database_manager.py`
  - Verifies that `DatabaseManager` requires `NEON_DATABASE_URL`.
  - Tests environment handling around database client initialization.

- `backend/tests/__init__.py`
  - Package initializer for backend test discovery.

- `frontend/tests/unit/filter.test.ts`
  - Unit tests for `filterProducts`, verifying category filtering and price range behavior.

- `frontend/tests/unit/stylistApi.test.ts`
  - Unit tests for the frontend recommendation API client, including success and failure response handling.

- `frontend/tests/unit/preferences-context.test.ts`
  - Unit test for the preferences context provider, ensuring default preferences are available.

- `frontend/tests/integration/recommendation-api.int.test.ts`
  - Integration test using `msw` to mock a backend recommendation endpoint and verify the frontend API client.

## 4. Manual Verification Performed

The repository contains test files that verify the following areas by inspection of code and coverage intent:

- Recommendation API
  - Frontend `stylistApi.getRecommendations` is exercised with a mocked backend response.

- Input validation
  - Backend request schema tests confirm validation and default values for request payloads.

- Database retrieval
  - Backend tests verify `DatabaseManager` environment validation, but do not execute real retrieval queries.

- LLM integration
  - No automated tests cover LLM or Groq integration in the existing repository.

- Error handling
  - Frontend API client tests validate error handling for non-OK HTTP responses.
  - Backend schema tests validate request rejection for invalid input.

- Logging
  - There are no tests present for logging behavior.

## 5. Missing Tests

- Backend API route tests for FastAPI endpoints.
- Backend integration tests that exercise actual database queries or use a test database.
- Backend tests for recommendation engine, stylist orchestration, and AI prompt handling.
- Backend tests for LLM/Groq client interactions.
- Backend tests for logging and monitoring output.
- Frontend UI component and page tests beyond service and context logic.
- End-to-end tests covering a user flow from frontend through backend.
- Coverage measurement and reporting setup.

## 6. Future Improvements

- Add backend FastAPI route tests using `TestClient` or `httpx.AsyncClient` to verify endpoint contracts and response payloads.
- Add backend integration tests against a local or in-memory test database for product retrieval and recommendation flows.
- Add targeted tests for the Groq/LLM client layer and response parsing.
- Add frontend component tests for critical UI pages and user flows.
- Add end-to-end tests with a framework such as Playwright or Cypress to validate the full application flow.
- Add code coverage tooling and enforce coverage thresholds for key packages.
- Document manual verification steps and acceptance criteria for each major flow.
