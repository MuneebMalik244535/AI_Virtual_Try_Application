# AI Fashion Stylist Backend

A production-ready backend for AI-powered fashion recommendations using FastAPI, Groq LLM, and PostgreSQL.

## Architecture

The backend follows a clean, modular architecture:

```
backend/
├── app/
│   ├── agents/              # AI agent orchestration
│   │   ├── orchestration/  # Recommendation and database agents
│   │   ├── profiling/      # User profiling and preference collection
│   │   ├── free_trial_agent.py
│   │   ├── gamified_unlock.py
│   │   └── fashion_stylist.py
│   ├── api/                # API routes and endpoints
│   │   ├── v1/            # Version 1 API routes
│   │   │   ├── stylist_routes.py
│   │   │   ├── admin_routes.py
│   │   │   ├── chat_routes.py
│   │   │   └── search_routes.py
│   │   └── app.py        # Main FastAPI application
│   ├── core/              # Configuration and error handling
│   │   ├── config.py
│   │   └── exceptions.py
│   ├── db/                # Database management
│   │   ├── database.py
│   │   ├── retrieval.py
│   │   └── manager.py
│   ├── llm/               # LLM client
│   │   └── groq_client.py
│   ├── logging/           # Logging utilities
│   │   └── logger.py
│   ├── monitoring/        # Cost tracking and monitoring
│   │   ├── cost_logger.py
│   │   ├── cost_monitor.py
│   │   ├── token_monitor.py
│   │   ├── usage_monitor.py
│   │   ├── recommendation_logger.py
│   │   └── monitoring_report.py
│   ├── prompts/           # Prompt templates
│   │   └── templates.py
│   ├── recommendations/   # Recommendation logic
│   │   ├── engine.py
│   │   ├── profile_builder.py
│   │   └── recommendation_engine.py
│   ├── schemas/           # Pydantic schemas
│   │   ├── requests.py
│   │   └── responses.py
│   ├── tools/             # Utility tools
│   │   └── seed_db.py
│   └── utils/             # Utility functions
│       ├── text.py
│       ├── text_to_json.py
│       └── questions.py
├── run.py                # Main entry point
├── .env                  # Environment variables
├── pyproject.toml        # Python dependencies
└── README.md            # This file
```

## Setup

1. Install runtime dependencies:
```bash
pip install -e .
```

2. Install development dependencies for tests:
```bash
pip install -e .[dev]
```

3. Configure environment variables in `.env` or copy `.env.example`:
```bash
copy .env.example .env
```

4. Update `.env` with your values:
```
GROQ_API_KEY=your_groq_api_key
NEON_DATABASE_URL=your_neon_database_url
GROQ_MODEL=llama3-8b-8192
BACKEND_ALLOWED_ORIGINS=http://localhost:5173
```

5. Run the server:
```bash
python run.py
```

## Testing

Run backend tests with:
```bash
pytest
```

## API Endpoints

### Stylist Recommendations
- `POST /api/stylist/recommendations` - Generate AI-powered fashion recommendations

### Admin
- `GET /api/admin/stats` - Get business KPIs
- `GET /api/admin/products` - Get paginated product list
- `GET /api/admin/metrics` - Get AI usage metrics
- `GET /api/admin/trends` - Get trend predictions

### Chat & Voice
- `POST /api/chat` - AI chat stylist
- `POST /api/voice-shop` - Voice shopping
- `POST /api/complete-outfit` - Complete outfit suggestions

### Search
- `POST /api/search` - Natural language product search

## Features

- **AI-Powered Recommendations**: Uses Groq LLM for personalized fashion suggestions
- **User Profiling**: Collects and analyzes user preferences
- **Cost Monitoring**: Tracks token usage and API costs
- **Database Integration**: PostgreSQL for product catalog and user data
- **Multi-Modal Support**: Voice, text, and chat interactions
- **Gamification**: Free trial system with unlockable premium features

## Development

The codebase is organized into clear modules:
- **Agents**: AI orchestration and user profiling
- **API**: RESTful endpoints with FastAPI
- **Core**: Configuration and error handling
- **DB**: Database management and retrieval
- **LLM**: Groq client integration
- **Monitoring**: Cost tracking and usage analytics
- **Recommendations**: Product recommendation logic
- **Tools**: Database seeding and utilities
