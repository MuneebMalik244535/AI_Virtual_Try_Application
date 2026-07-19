"""
Stylist recommendation routes
Handles AI-powered fashion recommendations
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from app.agents.profiling.profile_builder import build_style_profile
from app.agents.orchestration.recommendation_agent import get_recommendations
from app.core.errors import USER_MESSAGES, log_exception
from app.core.exceptions import AppError
from app.db.database import DatabaseManager
from app.logging.structured_logger import logger, log_recommendation_generation
from app.schemas.requests import StylistRequest

router = APIRouter()


class StylistResponse(BaseModel):
    recommendations: List[dict]
    success: bool
    message: Optional[str] = None


@router.post("/stylist/recommendations", response_model=StylistResponse)
async def generate_recommendations(request: StylistRequest):
    """Generate AI-powered fashion recommendations based on user preferences."""
    user_id = "anonymous"

    try:
        logger.info(
            "Recommendation request received",
            event_type="recommendation_request",
            user_id=user_id,
            budget=request.budget,
            occasion=request.occasion,
            season=request.season,
            colors=request.colors,
        )

        answers = {
            "budget": f"${request.budget}",
            "occasion": request.occasion,
            "style": request.style_preference,
            "height": f"{request.height} cm",
            "body_type": request.body_type,
            "skin_tone": request.skin_tone,
            "season": request.season,
            "preferred_colors": ", ".join(request.colors),
            "clothing_type": "complete outfit",
        }

        user_profile = build_style_profile(answers)

        db_manager = DatabaseManager()
        try:
            product_catalog = db_manager.get_filtered_products(
                budget=request.budget,
                occasion=request.occasion,
                season=request.season,
                colors=request.colors,
                limit=70,
            )
        finally:
            db_manager.close()

        logger.info(
            "Products retrieved from database",
            event_type="database_query",
            user_id=user_id,
            product_count=len(product_catalog),
        )

        recommended_items = get_recommendations(user_profile, product_catalog)

        enriched_recommendations = []
        for rec in recommended_items:
            matching_db_product = next(
                (
                    p
                    for p in product_catalog
                    if str(p["name"]).strip().lower()
                    == str(rec.get("name", "")).strip().lower()
                ),
                None,
            )
            enriched_recommendations.append(
                {
                    "name": rec.get("name", "Unknown Product"),
                    "price": rec.get("price", 0.0),
                    "reason": rec.get("reason", "No specific reason provided."),
                    "image_url": (
                        matching_db_product["image_url"]
                        if matching_db_product
                        else "https://picsum.photos/400/500?random=999"
                    ),
                }
            )

        log_recommendation_generation(
            user_id=user_id,
            budget=request.budget,
            occasion=request.occasion,
            count=len(enriched_recommendations),
        )

        return StylistResponse(
            recommendations=enriched_recommendations,
            success=True,
            message="Recommendations generated successfully.",
        )

    except AppError as exc:
        message = log_exception(
            logger,
            "recommendation_error",
            exc,
            user_id=user_id,
            budget=request.budget,
            occasion=request.occasion,
        )
        return StylistResponse(recommendations=[], success=False, message=message)

    except Exception as exc:
        message = log_exception(
            logger,
            "recommendation_error",
            exc,
            user_id=user_id,
            budget=request.budget,
            occasion=request.occasion,
        )
        return StylistResponse(
            recommendations=[],
            success=False,
            message=message or USER_MESSAGES["recommendation_failed"],
        )
