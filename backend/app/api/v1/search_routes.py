"""
Search routes
Handles natural language product search
"""

import time
from fastapi import APIRouter

from app.core.errors import USER_MESSAGES, log_exception, parse_ai_json
from app.core.exceptions import AppError, MalformedAIResponseError
from app.db.database import DatabaseManager
from app.llm.groq_client import call_groq, extract_text
from app.logging.structured_logger import logger, log_recommendation_generation
from app.schemas.requests import NLSearchRequest

router = APIRouter()


def log_ai_usage(action: str, cost: float, tokens: int, user_id: str = "anonymous"):
    """Log AI usage to database."""
    try:
        db = DatabaseManager()
        with db.connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO ai_logs (user_id, action, cost, tokens) VALUES (%s, %s, %s, %s)",
                (user_id, action, cost, tokens),
            )
        db.close()
    except Exception as exc:
        logger.error(
            "Failed to log AI usage to DB",
            event_type="database_error",
            error=str(exc),
        )


@router.post("/search")
async def nl_search(body: NLSearchRequest):
    """
    Natural Language Product Search.
    Groq parses the user's free-text query into structured filters,
    then we query the Neon PostgreSQL database.
    """
    user_id = "anonymous"
    start_time = time.time()

    try:
        logger.log_request(
            method="POST",
            path="/search",
            client_ip="unknown",
            user_id=user_id,
            query_length=len(body.query),
        )

        system_message = (
            "Parse the user's fashion search query into structured JSON. "
            "Return ONLY valid JSON (no markdown) with these optional fields:\n"
            '{"category": str|null, "color": str|null, "max_price": number|null, "keywords": [str]}\n'
            "category must be one of: shirts, pants, jackets, shoes, dresses, "
            "accessories, coats, sweaters, or null if not specified."
        )

        parse_result = call_groq(
            prompt=body.query,
            model="llama-3.3-70b-versatile",
            system_message=system_message,
            temperature=0.1,
            max_tokens=150,
            log_cost=False,
        )
        raw = extract_text(parse_result)
        filters = parse_ai_json(raw)

        if not isinstance(filters, dict):
            raise MalformedAIResponseError(
                "Search parser returned non-object JSON",
                user_message=USER_MESSAGES["malformed_ai_response"],
            )

        db = DatabaseManager()
        try:
            with db.connection.cursor() as cursor:
                conditions = []
                params: list = []

                if filters.get("category"):
                    conditions.append("category ILIKE %s")
                    params.append(f"%{filters['category']}%")

                if filters.get("color"):
                    conditions.append("color ILIKE %s")
                    params.append(f"%{filters['color']}%")

                if filters.get("max_price"):
                    conditions.append("price <= %s")
                    params.append(filters["max_price"])

                if filters.get("keywords"):
                    kw_conditions = []
                    for kw in filters["keywords"][:3]:
                        kw_conditions.append("(name ILIKE %s OR style_tags ILIKE %s)")
                        params.extend([f"%{kw}%", f"%{kw}%"])
                    if kw_conditions:
                        conditions.append(f"({' OR '.join(kw_conditions)})")

                where_clause = ("WHERE " + " AND ".join(conditions)) if conditions else ""
                cursor.execute(
                    f"""
                    SELECT id, name, price, category, color, brand, image_url
                    FROM products
                    {where_clause}
                    ORDER BY price ASC
                    LIMIT 20
                """,
                    params,
                )

                cols = ["id", "name", "price", "category", "color", "brand", "image_url"]
                results = [dict(zip(cols, row)) for row in cursor.fetchall()]
                for p in results:
                    p["price"] = float(p["price"])
        finally:
            db.close()

        log_ai_usage("NL Search", 0.0005, 500, user_id)
        log_recommendation_generation(
            user_id=user_id,
            budget=0,
            occasion="search",
            count=len(results),
        )
        logger.log_response(
            method="POST",
            path="/search",
            status_code=200,
            response_time_ms=(time.time() - start_time) * 1000,
            result_count=len(results),
        )
        return {
            "success": True,
            "query": body.query,
            "filters_used": filters,
            "results": results,
            "count": len(results),
        }

    except AppError as exc:
        message = log_exception(
            logger, "search_error", exc, user_id=user_id
        )
        return {"success": False, "results": [], "message": message}

    except Exception as exc:
        message = log_exception(
            logger, "search_error", exc, user_id=user_id
        )
        return {
            "success": False,
            "results": [],
            "message": message or USER_MESSAGES["search_failed"],
        }
