# AI Fashion Stylist - Architecture Documentation

## Overview

This document provides a comprehensive analysis of the AI Fashion Stylist repository architecture, identifying load-bearing files, their purposes, and their roles in the system.

## Load-Bearing Files

### Entry Point
- **`backend/run.py`** - Application entry point that starts the FastAPI server using uvicorn

### Core Application
- **`backend/app/api/app.py`** - Main FastAPI application that aggregates all route modules and configures CORS middleware

### Configuration
- **`backend/app/core/config.py`** - Centralized configuration management containing all environment variables, API keys, model settings, and application constants

### LLM Integration
- **`backend/app/llm/groq_client.py`** - Centralized Groq LLM client wrapper that handles all API calls to Groq

### Database Layer
- **`backend/app/db/database.py`** - Primary database manager class handling connections, table setup, and product queries
- **`backend/app/db/database_retrieval.py`** - Alternative database retrieval agent with specialized query methods
- **`backend/app/db/manager.py`** - Database management utilities
- **`backend/app/db/retrieval.py`** - Product retrieval logic

### AI Agents
- **`backend/app/agents/orchestration/recommendation_agent.py`** - Core recommendation engine that uses LLM to select products
- **`backend/app/agents/orchestration/db_agent.py`** - Database agent for CLI operations with fallback to mock data
- **`backend/app/agents/profiling/profile_builder.py`** - Converts user answers into style profiles using LLM
- **`backend/app/agents/profiling/fashion_profiler.py`** - Batch and interactive fashion profiling
- **`backend/app/agents/profiling/fashion_collector.py`** - Interactive fashion preference collection
- **`backend/app/agents/free_trial_agent.py`** - Free tier management with daily limits
- **`backend/app/agents/gamified_unlock.py`** - Gamified premium unlock system
- **`backend/app/agents/fashion_stylist.py`** - Fashion styling and match scoring logic

### API Routes
- **`backend/app/api/v1/stylist_routes.py`** - Stylist recommendation endpoints
- **`backend/app/api/v1/admin_routes.py`** - Admin dashboard endpoints (stats, products, metrics, trends)
- **`backend/app/api/v1/chat_routes.py`** - AI chat, voice shopping, and outfit completion endpoints
- **`backend/app/api/v1/search_routes.py`** - Natural language product search endpoints

### Recommendation Logic
- **`backend/app/recommendations/recommendation_engine.py`** - Generalized recommendation engine with match scoring
- **`backend/app/recommendations/engine.py`** - Alternative recommendation engine implementation
- **`backend/app/recommendations/profile_builder.py`** - Profile building for recommendations

### Monitoring & Logging
- **`backend/app/logging/logger.py`** - Structured application logger with cost tracking and session reporting
- **`backend/app/monitoring/cost_logger.py`** - Token usage and cost calculation utilities
- **`backend/app/monitoring/cost_monitor.py`** - Cost monitoring class
- **`backend/app/monitoring/token_monitor.py`** - Token usage tracking
- **`backend/app/monitoring/usage_monitor.py`** - Usage statistics monitoring
- **`backend/app/monitoring/recommendation_logger.py`** - Recommendation-specific logging
- **`backend/app/monitoring/monitoring_report.py`** - Monitoring report generation

### Validation & Schemas
- **`backend/app/schemas/requests.py`** - Pydantic request schemas for API validation
- **`backend/app/schemas/responses.py`** - Pydantic response schemas

### Error Handling
- **`backend/app/core/exceptions.py`** - Custom exception hierarchy for application-specific errors

### Prompts
- **`backend/app/prompts/templates.py`** - Centralized prompt templates for all LLM interactions

### Utilities
- **`backend/app/utils/text_to_json.py`** - Text to JSON conversion utilities
- **`backend/app/utils/questions.py`** - Question templates for user interaction
- **`backend/app/tools/seed_db.py`** - Database seeding tool with sample product data

---

## File Purposes by Concern

### Which File Controls the AI Workflow

**Primary:** `backend/app/api/v1/stylist_routes.py`

This file orchestrates the main AI workflow for fashion recommendations:
1. Receives user input via `StylistRequest` schema
2. Formats input for profile building
3. Calls `build_style_profile()` to generate user style profile
4. Retrieves filtered products from database
5. Calls `get_recommendations()` to get AI-selected products
6. Enriches recommendations with database metadata
7. Returns structured response

**Secondary:** `backend/app/agents/orchestration/recommendation_agent.py`

Contains the core recommendation logic that:
- Formats product catalog for LLM consumption
- Constructs detailed prompts with user profile and product data
- Calls LLM to select matching products
- Parses LLM response and extracts recommendations
- Enforces budget constraints and catalog limits

### Which File Manages State

**File-based State:**
- **`backend/app/agents/free_trial_agent.py`** - Manages free trial state in `free_trial_usage.json` file, tracking daily request limits per user
- **`backend/app/agents/gamified_unlock.py`** - Manages gamification state in `gamified_unlocks.json` file, tracking premium unlock status and spending thresholds

**Database State:**
- **`backend/app/db/database.py`** - Manages persistent database state including:
  - Products catalog
  - AI usage logs (cost tracking)
  - Free trial records
  - Database connections and transactions

### Which File Calls the LLM

**Primary LLM Client:** `backend/app/llm/groq_client.py`

This is the centralized LLM client that:
- Wraps the Groq Python SDK
- Provides `call_groq()` function for all LLM interactions
- Handles both simple prompt mode and full message list mode
- Includes automatic cost logging
- Provides `extract_text()` helper for response parsing
- Raises `LLMError` exceptions on failures

**Legacy Direct Calls (being migrated):**
- `backend/app/agents/orchestration/recommendation_agent.py` - Direct Groq SDK calls
- `backend/app/agents/profiling/profile_builder.py` - Direct Groq SDK calls
- `backend/app/agents/free_trial_agent.py` - Direct Groq SDK calls
- `backend/app/agents/gamified_unlock.py` - Direct Groq SDK calls

### Which File Retrieves Products

**Primary:** `backend/app/db/database.py`

Main product retrieval methods:
- `get_filtered_products()` - Retrieves products filtered by budget, occasion, season, colors
- `get_all_products()` - Retrieves complete product catalog
- `insert_sample_products()` - Seeds database with sample data

**Alternative Retrieval:**
- `backend/app/db/database_retrieval.py` - `DatabaseRetrievalAgent` class with specialized query methods
- `backend/app/agents/orchestration/db_agent.py` - `fetch_products()` function with mock data fallback for CLI

### Which File Validates User Input

**Primary:** `backend/app/schemas/requests.py`

Contains Pydantic schemas that validate all API input:
- `StylistRequest` - Validates stylist recommendation requests (budget, occasion, colors, etc.)
- `CompleteOutfitRequest` - Validates outfit completion requests
- `ChatMessage` - Validates chat message inputs
- `NLSearchRequest` - Validates natural language search queries

**Secondary:** `backend/app/api/v1/stylist_routes.py`

Contains inline schema definitions (duplicate of schemas module - should be consolidated):
- `StylistRequest` - Request validation
- `RecommendationItem` - Response item validation
- `StylistResponse` - Response structure validation

**Application-Level Validation:**
- `backend/app/core/exceptions.py` - Defines `ValidationError` exception for validation failures

### Which File Handles Failures

**Primary:** `backend/app/core/exceptions.py`

Defines custom exception hierarchy for structured error handling:
- `AppError` - Base exception for all application errors
- `DatabaseError` - Database operation failures
- `LLMError` - LLM/Groq API call failures
- `ProfileBuildError` - Profile generation failures
- `RecommendationError` - Recommendation pipeline failures
- `FreeTierLimitError` - Free tier quota exceeded
- `ValidationError` - Input validation failures

**Implementation:**
- `backend/app/llm/groq_client.py` - Catches exceptions and raises `LLMError`
- `backend/app/api/v1/*.py` - Route handlers catch exceptions and return error responses
- `backend/app/db/database.py` - Database connection error handling with fallback logic

### Which File Contains Configuration

**Primary:** `backend/app/core/config.py`

Centralized configuration containing:
- **Groq API Settings:** `GROQ_API_KEY`, `GROQ_BASE_URL`
- **Model Configuration:** `MODEL_NAME`, `PROFILE_MODEL`, `RECOMMENDATION_MODEL`
- **Pricing:** `MODEL_PRICING` dictionary with per-model costs
- **Database:** `DATABASE_URL` (Neon PostgreSQL connection string)
- **Application Settings:** `MAX_RECOMMENDATIONS`, `MOCK_DATA_IF_DB_FAILS`
- **UI Settings:** `CLI_COLORS` palette
- **API Settings:** `API_TIMEOUT`, `MAX_RETRIES`

**Environment Variables:**
- Loaded from `.env` file using `python-dotenv`
- All sensitive values (API keys, database URLs) are environment-based

### Which File Contains Logging

**Primary:** `backend/app/logging/logger.py`

Structured logging utilities including:
- `calculate_cost()` - Token cost calculation
- `display_cost_report()` - Rich console cost reporting
- `log_api_call()` - Per-call API logging with token tracking
- `log_session_costs()` - Session-level cost aggregation
- `estimate_prompt_tokens()` - Token estimation utility
- `get_cost_efficiency_rating()` - Cost efficiency analysis

**Specialized Logging:**
- `backend/app/monitoring/cost_logger.py` - Cost tracking and reporting (legacy, being migrated)
- `backend/app/monitoring/token_monitor.py` - Token usage monitoring class
- `backend/app/monitoring/usage_monitor.py` - Usage statistics tracking
- `backend/app/monitoring/recommendation_logger.py` - Recommendation-specific logging
- `backend/app/monitoring/monitoring_report.py` - Monitoring report generation

**Database Logging:**
- `backend/app/db/database.py` - Logs AI usage to database `ai_logs` table

---

## Data Flow Architecture

### Recommendation Request Flow

```
User Request (API)
    ↓
stylist_routes.py (validation)
    ↓
profile_builder.py (profile generation)
    ↓
database.py (product retrieval)
    ↓
recommendation_agent.py (LLM selection)
    ↓
groq_client.py (LLM API call)
    ↓
logger.py (cost logging)
    ↓
stylist_routes.py (response enrichment)
    ↓
User Response
```

### State Management Flow

```
Free Trial Request
    ↓
free_trial_agent.py (check limits)
    ↓
free_trial_usage.json (read state)
    ↓
[Process Request]
    ↓
free_trial_usage.json (update state)
```

### Error Handling Flow

```
Exception Occurs
    ↓
Module-Specific Catch
    ↓
Raise Custom Exception (exceptions.py)
    ↓
API Route Catch
    ↓
Return Error Response
```

---

## Key Architectural Decisions

1. **Centralized LLM Client:** `groq_client.py` provides single point of control for all LLM interactions, enabling consistent error handling, logging, and configuration.

2. **Separated Agents:** AI logic is separated into specialized agents (orchestration, profiling, free trial, gamification) for clear separation of concerns.

3. **Modular Routes:** API routes are split by domain (stylist, admin, chat, search) for maintainability.

4. **Configuration Centralization:** All configuration lives in `config.py` to avoid scattered environment variable access.

5. **Custom Exception Hierarchy:** Typed exceptions enable precise error handling without depending on third-party library exceptions.

6. **Prompt Template Centralization:** All LLM prompts are in `templates.py` for easy versioning and A/B testing.

7. **Dual Database Access:** Both `database.py` (class-based) and `database_retrieval.py` (agent-based) provide flexibility for different use cases.

---

## Migration Notes

The codebase shows evidence of ongoing refactoring:

- **LLM Calls:** Some files still use direct Groq SDK calls instead of the centralized `groq_client.py`
- **Schemas:** Duplicate schema definitions exist in both `schemas/requests.py` and route files
- **Logging:** Both `logging/logger.py` and `monitoring/cost_logger.py` provide similar functionality

Recommended next steps:
1. Migrate all direct Groq calls to use `groq_client.py`
2. Consolidate schema definitions to use only `schemas/` module
3. Standardize on `logging/logger.py` for all logging needs
