# Failure Modes Analysis - AI Fashion Stylist

## Overview
This document lists failure modes that are directly supported by the current repository implementation. Each entry is based on actual code behavior and existing error-handling paths.

---

## 1. Input Validation Failures

### 1.1 Missing or invalid request input
**Where:** `backend/app/api/v1/stylist_routes.py`, `backend/app/api/v1/chat_routes.py`, `backend/app/schemas/requests.py`

**Description:** Invalid or missing request payload fields are rejected by Pydantic request models.

**How it is detected:** FastAPI request body parsing uses Pydantic models and raises `RequestValidationError` when required fields are missing or constraints fail.

**Current handling:** Validation errors are logged and mapped to a generic invalid-input user message by `backend/app/api/error_handlers.py`.

**Remaining limitation:** Field-level validation feedback remains generic and is not surfaced in a structured way to clients.

**Evidence from the code:** `backend/app/schemas/requests.py` uses `Field(..., min_length=1, gt=0)` and `backend/app/api/app.py` registers `validation_error_handler`.

---

## 2. Configuration Failures

### 2.1 Missing Groq API key
**Where:** `backend/app/llm/groq_client.py`, `backend/app/core/config.py`, `backend/app/api/app.py`

**Description:** The Groq client fails when `GROQ_API_KEY` is absent or remains the placeholder value.

**How it is detected:** `call_groq()` checks `GROQ_API_KEY` and raises `ConfigurationError` if it is missing or invalid.

**Current handling:** The failure is logged at startup if environment validation fails, and runtime calls convert the error into `LLMError` with a safe user-facing message.

**Remaining limitation:** The application logs the issue but may continue running until an LLM request is made.

**Evidence from the code:** `backend/app/llm/groq_client.py` contains a guard for `GROQ_API_KEY == "gsk_your_api_key_here"`, and `backend/app/api/app.py` calls `validate_environment()` on startup.

---

## 3. LLM Response Failures

### 3.1 Malformed LLM output
**Where:** `backend/app/llm/groq_client.py`

**Description:** The Groq response may not contain the expected `choices[0].message.content` structure.

**How it is detected:** `extract_text()` catches `KeyError`, `IndexError`, and `TypeError` when extracting the assistant message content.

**Current handling:** The error is logged and translated into `MalformedAIResponseError`, which maps to a safe user message.

**Remaining limitation:** The system does not retry or recover from malformed responses.

**Evidence from the code:** `backend/app/llm/groq_client.py` raises `MalformedAIResponseError` inside `extract_text()` when the response structure is unexpected.

---

## 4. Recommendation Failures

### 4.1 Hallucinated or unmatched product recommendations
**Where:** `backend/app/api/v1/stylist_routes.py`

**Description:** LLM-recommended product names may not match any catalog product returned by the database.

**How it is detected:** The route performs exact-name matching against `product_catalog` and may find `None` for some recommendation items.

**Current handling:** The route uses a placeholder image URL for unmatched products and still returns the recommendation item.

**Remaining limitation:** Invalid or hallucinated recommendation items can be returned to the client rather than rejected or corrected.

**Evidence from the code:** `stylist_routes.py` assigns a fallback image URL when `matching_db_product` is `None`.

---

## 5. Database Failures

### 5.1 Database connection failure
**Where:** `backend/app/db/database.py`

**Description:** The backend fails to connect when `NEON_DATABASE_URL` is missing or the database service is unavailable.

**How it is detected:** `DatabaseManager.connect()` checks for `NEON_DATABASE_URL` and catches exceptions from `psycopg2.connect()`.

**Current handling:** The error is logged and a `DatabaseError` is raised with a safe user message.

**Remaining limitation:** There is no retry or fallback strategy for transient connection failures.

**Evidence from the code:** `database.py` logs `database_error` and raises `DatabaseError` in `connect()`.

---

### 5.2 Empty product catalog or no filtered matches
**Where:** `backend/app/db/database.py`, `backend/app/api/v1/stylist_routes.py`

**Description:** Filtered catalog queries can return an empty list when no products match the criteria.

**How it is detected:** `get_filtered_products()` returns `[]` for no matches or on query failure.

**Current handling:** The recommendation endpoint proceeds with an empty catalog and may still return an empty or incomplete recommendation set.

**Remaining limitation:** The API does not explicitly signal that no catalog items matched the request.

**Evidence from the code:** `get_filtered_products()` returns `[]` in its `except` block, and `stylist_routes.py` does not validate `product_catalog` before `get_recommendations()`.

---

## Most Important Failure Mode

### Hallucinated or unmatched LLM recommendations

**Why it matters:** This is the primary AI-specific risk in the project. The product is only valuable when recommended items correspond to real catalog products.

**How it is detected:** Exact-name matching in `backend/app/api/v1/stylist_routes.py` reveals when LLM output does not match products in the supplied catalog.

**Current handling:** The route applies fallback image data and returns the recommendation item, while malformed LLM responses are logged by the Groq client.

**Remaining limitation:** There is no strict enforcement or retry mechanism for invalid LLM output, so bad recommendations may still reach users.

**Evidence from the code:** `stylist_routes.py` falls back to a placeholder image when `matching_db_product` is `None`, and `groq_client.py` validates response structure in `extract_text()`.
