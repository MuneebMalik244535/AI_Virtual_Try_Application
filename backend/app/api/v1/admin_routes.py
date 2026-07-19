"""
Admin routes
Handles admin dashboard endpoints for stats, products, and metrics
"""

import json
from datetime import date

from fastapi import APIRouter, Query

from app.core.errors import USER_MESSAGES, log_exception, parse_ai_json
from app.core.exceptions import AppError, MalformedAIResponseError
from app.db.database import DatabaseManager
from app.llm.groq_client import call_groq, extract_text
from app.logging.structured_logger import logger

router = APIRouter()


@router.get("/admin/stats")
async def get_admin_stats():
    """Returns live business KPIs from the Neon PostgreSQL database."""
    try:
        logger.info("Admin stats request received", event_type="admin_stats_request")

        db = DatabaseManager()
        try:
            with db.connection.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM products")
                total_products = cursor.fetchone()[0]

                cursor.execute("SELECT AVG(price) FROM products")
                avg_price_row = cursor.fetchone()[0]
                avg_price = float(avg_price_row) if avg_price_row else 0.0

                cursor.execute("SELECT MAX(price) FROM products")
                max_price_row = cursor.fetchone()[0]
                max_price = float(max_price_row) if max_price_row else 0.0

                cursor.execute("""
                    SELECT category, COUNT(*) as count, ROUND(AVG(price)::numeric, 2) as avg_price
                    FROM products
                    GROUP BY category
                    ORDER BY count DESC
                """)
                categories = [
                    {"category": row[0], "count": row[1], "avg_price": float(row[2])}
                    for row in cursor.fetchall()
                ]

                cursor.execute(
                    "SELECT COUNT(DISTINCT brand) FROM products WHERE brand IS NOT NULL"
                )
                total_brands = cursor.fetchone()[0]
        finally:
            db.close()

        logger.info(
            "Admin stats generated",
            event_type="admin_stats_response",
            total_products=total_products,
            total_brands=total_brands,
        )

        return {
            "success": True,
            "total_products": total_products,
            "avg_price": round(avg_price, 2),
            "max_price": round(max_price, 2),
            "total_brands": total_brands,
            "categories": categories,
        }

    except AppError as exc:
        message = log_exception(logger, "admin_stats_error", exc)
        return {"success": False, "message": message}

    except Exception as exc:
        message = log_exception(logger, "admin_stats_error", exc)
        return {
            "success": False,
            "message": message or USER_MESSAGES["admin_unavailable"],
        }


@router.get("/admin/products")
async def get_admin_products(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    search: str = Query(default="", max_length=200),
):
    """Returns paginated, searchable product list from the database."""
    try:
        db = DatabaseManager()
        try:
            with db.connection.cursor() as cursor:
                offset = (page - 1) * limit

                if search:
                    like = f"%{search}%"
                    cursor.execute(
                        """
                        SELECT id, name, price, category, color, brand, image_url
                        FROM products
                        WHERE name ILIKE %s OR category ILIKE %s OR brand ILIKE %s
                        ORDER BY id DESC
                        LIMIT %s OFFSET %s
                    """,
                        (like, like, like, limit, offset),
                    )

                    cursor2 = db.connection.cursor()
                    cursor2.execute(
                        """
                        SELECT COUNT(*) FROM products
                        WHERE name ILIKE %s OR category ILIKE %s OR brand ILIKE %s
                    """,
                        (like, like, like),
                    )
                else:
                    cursor.execute(
                        """
                        SELECT id, name, price, category, color, brand, image_url
                        FROM products
                        ORDER BY id DESC
                        LIMIT %s OFFSET %s
                    """,
                        (limit, offset),
                    )

                    cursor2 = db.connection.cursor()
                    cursor2.execute("SELECT COUNT(*) FROM products")

                total = cursor2.fetchone()[0]
                cols = ["id", "name", "price", "category", "color", "brand", "image_url"]
                products_list = [dict(zip(cols, row)) for row in cursor.fetchall()]
                for p in products_list:
                    p["price"] = float(p["price"])
        finally:
            db.close()

        return {
            "success": True,
            "products": products_list,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    except AppError as exc:
        message = log_exception(logger, "admin_products_error", exc)
        return {"success": False, "message": message, "products": []}

    except Exception as exc:
        message = log_exception(logger, "admin_products_error", exc)
        return {
            "success": False,
            "message": message or USER_MESSAGES["admin_unavailable"],
            "products": [],
        }


@router.get("/admin/metrics")
async def get_admin_metrics():
    """Returns AI usage metrics by querying the live Neon DB ai_logs table."""
    try:
        metrics = {
            "total_ai_calls": 0,
            "total_cost_usd": 0.0,
            "total_tokens": 0,
            "active_free_trials": 0,
            "users_acquired": 0,
            "total_products": 0,
        }

        db = DatabaseManager()
        try:
            with db.connection.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM products")
                metrics["total_products"] = cursor.fetchone()[0]

                cursor.execute(
                    "SELECT COUNT(*), COALESCE(SUM(cost), 0.0), COALESCE(SUM(tokens), 0), "
                    "COUNT(DISTINCT user_id) FROM ai_logs"
                )
                logs_count, total_cost, total_tokens, unique_users = cursor.fetchone()
                metrics["total_ai_calls"] = logs_count
                metrics["total_cost_usd"] = float(total_cost)
                metrics["total_tokens"] = int(total_tokens)
                metrics["users_acquired"] = unique_users

                cursor.execute("SELECT COUNT(*) FROM free_trials WHERE active = TRUE")
                metrics["active_free_trials"] = cursor.fetchone()[0]
        finally:
            db.close()

        return {"success": True, "metrics": metrics}

    except AppError as exc:
        message = log_exception(logger, "admin_metrics_error", exc)
        return {"success": False, "message": message, "metrics": {}}

    except Exception as exc:
        message = log_exception(logger, "admin_metrics_error", exc)
        return {
            "success": False,
            "message": message or USER_MESSAGES["admin_unavailable"],
            "metrics": {},
        }


@router.get("/admin/trends")
async def get_trend_predictions():
    """
    AI Trend Prediction: analyses the current catalog to predict hot categories
    for the upcoming week based on price elasticity and category diversity.
    """
    try:
        logger.info("Admin trends request received", event_type="admin_trends_request")

        db = DatabaseManager()
        try:
            with db.connection.cursor() as cursor:
                cursor.execute("""
                    SELECT category,
                           COUNT(*) as count,
                           ROUND(AVG(price)::numeric, 2) as avg_price,
                           ROUND(MIN(price)::numeric, 2) as min_price,
                           ROUND(MAX(price)::numeric, 2) as max_price
                    FROM products
                    GROUP BY category
                    ORDER BY count DESC
                """)
                rows = cursor.fetchall()
                category_data = [
                    {
                        "category": r[0],
                        "count": r[1],
                        "avg_price": float(r[2]),
                        "min_price": float(r[3]),
                        "max_price": float(r[4]),
                    }
                    for r in rows
                ]
        finally:
            db.close()

        catalog_summary = "\n".join(
            f"- {c['category']}: {c['count']} products | avg ${c['avg_price']} | "
            f"range ${c['min_price']}-${c['max_price']}"
            for c in category_data
        )

        system_message = (
            "You are a fashion trend analyst and inventory strategist for a premium e-commerce store. "
            "Based on the provided catalog snapshot, predict which 3 categories will trend highest "
            "next week and explain why. Return ONLY a JSON array (no markdown):\n"
            '[{"category": str, "trend_score": int (1-100), "reason": str, "action": str}]\n'
            "trend_score is your confidence this category will spike in demand. "
            "action should be a 1-sentence business recommendation."
        )
        user_prompt = (
            f"Current catalog snapshot:\n{catalog_summary}\n\nToday's date: {date.today()}"
        )

        completion = call_groq(
            prompt=user_prompt,
            model="llama-3.3-70b-versatile",
            system_message=system_message,
            temperature=0.4,
            max_tokens=600,
            log_cost=False,
        )

        raw = extract_text(completion)
        predictions = parse_ai_json(raw)

        if not isinstance(predictions, list):
            raise MalformedAIResponseError(
                "Trend prediction returned non-array JSON",
                user_message=USER_MESSAGES["malformed_ai_response"],
            )

        logger.info(
            "Admin trends generated",
            event_type="admin_trends_response",
            prediction_count=len(predictions),
        )

        return {
            "success": True,
            "predictions": predictions,
            "catalog_summary": category_data,
        }

    except AppError as exc:
        message = log_exception(logger, "admin_trends_error", exc)
        return {"success": False, "predictions": [], "message": message}

    except Exception as exc:
        message = log_exception(logger, "admin_trends_error", exc)
        return {
            "success": False,
            "predictions": [],
            "message": message or USER_MESSAGES["admin_unavailable"],
        }
