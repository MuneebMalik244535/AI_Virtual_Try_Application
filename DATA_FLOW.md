# Data Flow

This document describes how data enters the application, how it moves through the backend, where filtering and recommendation logic runs, where the final response is produced, and how invalid data is handled.

## 1. Where data comes from

- User input arrives through the frontend UI in `frontend/src/app/pages/stylist/processing.tsx` or a similar stylist flow page.
- The frontend collects a `UserPreferences` object containing:
  - `budget`
  - `occasion`
  - `season`
  - `colors`
  - `height`
  - `body_type`
  - `skin_tone`
  - `style_preference`
  - `gender`
  - optional `user_image`
- The frontend sends this data in a POST request to the backend API endpoint `/api/stylist/recommendations`.

## 2. How data moves through the system

1. **API entrypoint**
   - The backend receives the HTTP request in `backend/app/api/v1/stylist_routes.py`.
   - FastAPI maps the request body to the `StylistRequest` Pydantic schema in `backend/app/schemas/requests.py`.

2. **Validation**
   - Pydantic validates required fields, datatypes, and constraints before the route handler runs.
   - If validation fails, FastAPI calls the validation exception handler in `backend/app/api/error_handlers.py` and returns a `422` response.

3. **Profile building**
   - After validation, the route builds a user answer dictionary and calls `build_style_profile` in `backend/app/agents/profiling/profile_builder.py`.
   - `build_style_profile` constructs a prompt and optionally calls the Groq LLM via `backend/app/llm/groq_client.py`.
   - The result is a style profile paragraph representing the user’s fashion preferences.

4. **Catalog retrieval**
   - The route creates a `DatabaseManager` instance from `backend/app/db/database.py`.
   - It calls `DatabaseManager.get_filtered_products(...)` to fetch a product subset from PostgreSQL.
   - This subset is built using the user’s budget and optionally occasion, season, and colors.
   - The route closes the DB connection after retrieval.

5. **Recommendation generation**
   - The backend passes the generated profile and filtered product catalog to `get_recommendations` in `backend/app/agents/orchestration/recommendation_agent.py`.
   - That module formats the catalog into a prompt, calls the Groq LLM, extracts text, and parses recommendations.

6. **Response enrichment**
   - The route takes the parsed recommendation items and matches them back to the DB product catalog.
   - It enriches each recommendation with an `image_url` and normalized product fields.
   - The final output is returned as a `StylistResponse` object.

## 3. Where filtering happens

- Primary filtering happens in the database layer `backend/app/db/database.py` inside `DatabaseManager.get_filtered_products`.
- This method filters products by:
  - `price <= budget`
  - optionally using `occasion` and `season` keywords in `style_tags` or `description`
  - limiting the returned set to a maximum number of items (e.g. 70)
- The database layer reduces the catalog size before the LLM is prompted.

## 4. Where recommendations happen

- Recommendation generation happens in `backend/app/agents/orchestration/recommendation_agent.py`.
- The process is:
  - format the filtered catalog for the LLM prompt
  - send the prompt to the Groq LLM via `backend/app/llm/groq_client.py`
  - receive the raw text response
  - parse the text into structured recommendation records
- The recommendation agent is the core location for AI-driven recommendation logic.

## 5. Where the response is generated

- The final response object is built in `backend/app/api/v1/stylist_routes.py`.
- After recommendation parsing, the route enriches recommendations with matching catalog data and returns:
  - `recommendations`: list of products with `name`, `price`, `reason`, and `image_url`
  - `success`: boolean
  - `message`: success or error text
- If any internal error occurs after validation, the route catches it and returns a structured failure response.

## 6. How invalid data is handled

1. **Invalid request shape or missing fields**
   - FastAPI and Pydantic reject invalid requests before the handler executes.
   - The client gets a `422` response with `success: false` and a generic invalid input message.

2. **Invalid field content**
   - Pydantic field validators enforce rules like `budget > 0`, `height > 0`, `colors` array length, and string lengths.
   - If a validator fails, the request is rejected and the invalid data never reaches the recommendation logic.

3. **Internal processing errors**
   - If profile generation or recommendation generation throws an `AppError`, the `AppError` handler returns `400` with a friendly message.
   - Unexpected exceptions are caught by the route or the HTTP exception middleware and result in `500` plus a generic error message.

4. **Fallback / degraded behavior**
   - If the LLM fails while building the style profile, `build_style_profile` returns a fallback profile generated without the LLM.
   - If the recommendation engine fails, the route returns an empty recommendation list and reports failure back to the client.

## 7. Summary of key data movement

- User → Frontend form → POST `/api/stylist/recommendations`
- Backend request validation → `StylistRequest`
- Preference answers → `build_style_profile` → style profile text
- User budget/preferences → database filter → product catalog subset
- Profile + catalog → LLM prompt → recommendations text
- Parsed recommendations → enrichment with catalog metadata
- Final JSON response → frontend

This document is intended to help developers understand where each responsibility lives and where key transformation points exist in the recommendation flow.