"""
Chat and voice interaction routes
Handles AI chat, voice shopping, and outfit completion
"""

import json
import os
import re
from fastapi import APIRouter, File, UploadFile
from groq import Groq

from app.core.config import GROQ_API_KEY
from app.core.errors import USER_MESSAGES, log_exception, parse_ai_json
from app.core.exceptions import AppError, ConfigurationError, MalformedAIResponseError, ValidationError
from app.db.database import DatabaseManager
from app.llm.groq_client import call_groq, extract_text
from app.logging.structured_logger import logger
from app.schemas.requests import ChatMessage, CompleteOutfitRequest

router = APIRouter()

ALLOWED_AUDIO_EXTENSIONS = {".wav", ".mp3", ".m4a", ".webm", ".ogg", ".flac"}


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


def _require_groq_key() -> str:
    if not GROQ_API_KEY or GROQ_API_KEY == "gsk_your_api_key_here":
        raise ConfigurationError(
            "GROQ_API_KEY is not configured",
            user_message=USER_MESSAGES["configuration_error"],
        )
    return GROQ_API_KEY


@router.post("/chat")
async def ai_chat_stylist(body: ChatMessage):
    """
    AI Live Chat Stylist: takes a user message, fetches relevant products
    from DB, and returns a conversational style recommendation.
    """
    user_id = body.user_id or "anonymous"

    try:
        logger.info(
            "Chat request received",
            event_type="chat_request",
            user_id=user_id,
            message_length=len(body.message),
            history_length=len(body.history or []),
        )

        db = DatabaseManager()
        try:
            with db.connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, price, category, color, brand, style_tags, image_url
                    FROM products
                    ORDER BY RANDOM()
                    LIMIT 40
                """)
                cols = [
                    "id", "name", "price", "category", "color",
                    "brand", "style_tags", "image_url",
                ]
                raw_products = [dict(zip(cols, row)) for row in cursor.fetchall()]
                for p in raw_products:
                    p["price"] = float(p["price"])
        finally:
            db.close()

        catalog_text = "\n".join(
            f"- [{p['name']}] | ${p['price']} | {p['category']} | {p['color']} | Brand: {p['brand']}"
            for p in raw_products
        )

        groq_messages = [
            {
                "role": "system",
                "content": (
                    "You are LUXE, a friendly and expert AI fashion stylist for a premium e-commerce store. "
                    "Your job is to help users find the perfect outfit from our store catalog. "
                    "CRITICAL RULES:\n"
                    "1. ONLY recommend products that exist in the catalog below.\n"
                    "2. Always mention specific product names, prices, and why they match.\n"
                    "3. Keep replies concise, warm, and conversational (max 3-4 sentences + product list).\n"
                    "4. Format product recommendations as a JSON block at the end like:\n"
                    '   PRODUCTS: [{"name": "Product Name", "price": 99.99}]\n'
                    "5. If the user's request is unclear, ask one clarifying question.\n\n"
                    f"OUR CURRENT CATALOG:\n{catalog_text}"
                ),
            }
        ]

        for msg in (body.history or [])[-6:]:
            if msg.get("role") in ("user", "assistant"):
                groq_messages.append({"role": msg["role"], "content": msg["content"]})

        groq_messages.append({"role": "user", "content": body.message})

        completion = call_groq(
            prompt="",
            model="llama-3.3-70b-versatile",
            messages=groq_messages,
            temperature=0.7,
            max_tokens=600,
            log_cost=False,
        )
        reply = extract_text(completion).strip()

        recommended_products = []
        text_reply = reply

        if "PRODUCTS:" in reply:
            parts = reply.split("PRODUCTS:", 1)
            text_reply = parts[0].strip()
            try:
                json_match = re.search(r"\[.*?\]", parts[1], re.DOTALL)
                if json_match:
                    product_names = json.loads(json_match.group())
                    if not isinstance(product_names, list):
                        raise MalformedAIResponseError(
                            "Chat product block is not a JSON array",
                            user_message=USER_MESSAGES["malformed_ai_response"],
                        )
                    for pn in product_names:
                        if not isinstance(pn, dict):
                            continue
                        match = next(
                            (
                                p
                                for p in raw_products
                                if p["name"].strip().lower()
                                == pn.get("name", "").strip().lower()
                            ),
                            None,
                        )
                        if match:
                            recommended_products.append(
                                {
                                    "id": match["id"],
                                    "name": match["name"],
                                    "price": match["price"],
                                    "image_url": match["image_url"]
                                    or f"https://picsum.photos/seed/{match['id']}/300/400",
                                    "category": match["category"],
                                }
                            )
            except json.JSONDecodeError as exc:
                logger.warning(
                    "Failed to parse product JSON from chat response",
                    event_type="json_parse_error",
                    user_id=user_id,
                    error=str(exc),
                )

        logger.info(
            "Chat response generated",
            event_type="chat_response",
            user_id=user_id,
            product_count=len(recommended_products),
            recommendation_count=len(recommended_products),
            reply_length=len(text_reply),
        )

        log_ai_usage("AI Chat", 0.0010, 1000, body.user_id)
        return {
            "success": True,
            "reply": text_reply,
            "products": recommended_products,
        }

    except AppError as exc:
        log_exception(logger, "chat_error", exc, user_id=user_id)
        return {
            "success": False,
            "reply": exc.user_message or USER_MESSAGES["chat_unavailable"],
            "products": [],
        }

    except Exception as exc:
        log_exception(logger, "chat_error", exc, user_id=user_id)
        return {
            "success": False,
            "reply": USER_MESSAGES["chat_unavailable"],
            "products": [],
        }


@router.post("/voice-shop")
async def voice_shop(audio: UploadFile = File(...)):
    """Process voice shopping commands using Whisper transcription and LLM parsing."""
    user_id = "anonymous"
    temp_file_path = None

    try:
        if not audio.filename:
            raise ValidationError(
                "Audio filename is required",
                user_message=USER_MESSAGES["invalid_input"],
            )

        ext = os.path.splitext(audio.filename)[1].lower()
        if ext and ext not in ALLOWED_AUDIO_EXTENSIONS:
            raise ValidationError(
                f"Unsupported audio format: {ext}",
                user_message=USER_MESSAGES["invalid_input"],
            )

        logger.info(
            "Voice shop request received",
            event_type="voice_shop_request",
            user_id=user_id,
            filename=audio.filename,
        )

        temp_file_path = f"temp_{audio.filename}"
        with open(temp_file_path, "wb") as buffer:
            buffer.write(await audio.read())

        client = Groq(api_key=_require_groq_key())
        with open(temp_file_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(temp_file_path, file.read()),
                model="whisper-large-v3-turbo",
            )
        text = transcription.text.strip()

        if not text:
            raise MalformedAIResponseError(
                "Whisper returned empty transcription",
                user_message=USER_MESSAGES["voice_processing_failed"],
            )

        logger.info(
            "Voice transcription completed",
            event_type="voice_transcription",
            user_id=user_id,
            transcription_length=len(text),
        )

        response = call_groq(
            prompt=text,
            model="llama-3.3-70b-versatile",
            system_message="""You are an AI shopping assistant for a Pakistani/Indian audience.
Extract search parameters from the user's voice command. The user may speak in English, Roman Urdu, or Hindi.
You must translate their intent into our strict English database filters.

Return ONLY a valid JSON object. No markdown formatting, no explanation.

Valid keys:
"category": string. MUST be EXACTLY one of: "men", "women", "tshirts", "hoodies", "jeans", "sneakers", "jackets", "shirts".
TRANSLATION RULES:
- "shoes", "jootay", "boot" -> "sneakers"
- "pants", "pant", "jeans" -> "jeans"
- "shirts", "kameez", "kurta" -> "shirts"
- "jackets", "jacket", "coat" -> "jackets"
- "tshirts", "t-shirt" -> "tshirts"

"color": string. (Translate "lal"->red, "kala"->black, "neela"->blue, "safed"->white, etc).
"maxPrice": number. (If they say "under 5000" or "5000 ke andar", extract 5000).
"q": text string. (A general search query if applicable).""",
            temperature=0,
            max_tokens=400,
            log_cost=False,
        )

        content = extract_text(response)
        filters = parse_ai_json(content)

        if not isinstance(filters, dict):
            raise MalformedAIResponseError(
                "Voice filter parser returned non-object JSON",
                user_message=USER_MESSAGES["malformed_ai_response"],
            )

        logger.info(
            "Voice filters extracted",
            event_type="voice_filters",
            user_id=user_id,
            filters=filters,
        )

        log_ai_usage("Voice Shop", 0.0010, 1000, user_id)
        return {"success": True, "text": text, "filters": filters}

    except AppError as exc:
        message = log_exception(logger, "voice_shop_error", exc, user_id=user_id)
        return {"success": False, "message": message}

    except Exception as exc:
        message = log_exception(logger, "voice_shop_error", exc, user_id=user_id)
        return {
            "success": False,
            "message": message or USER_MESSAGES["voice_processing_failed"],
        }

    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)


@router.post("/complete-outfit")
async def complete_the_outfit(body: CompleteOutfitRequest):
    """
    Given a single product, AI picks matching pieces from our real DB catalog
    to complete a full, cohesive outfit.
    """
    user_id = "anonymous"

    try:
        logger.info(
            "Complete outfit request received",
            event_type="complete_outfit_request",
            user_id=user_id,
            product_name=body.product_name,
            product_category=body.product_category,
            occasion=body.occasion,
        )

        db = DatabaseManager()
        try:
            with db.connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, price, category, color, brand, style_tags, image_url
                    FROM products
                    ORDER BY RANDOM() LIMIT 50
                """)
                cols = [
                    "id", "name", "price", "category", "color",
                    "brand", "style_tags", "image_url",
                ]
                catalog = [dict(zip(cols, row)) for row in cursor.fetchall()]
                for p in catalog:
                    p["price"] = float(p["price"])
        finally:
            db.close()

        catalog_text = "\n".join(
            f"- [{p['name']}] | ${p['price']} | {p['category']} | {p['color']}"
            for p in catalog
        )

        completion = call_groq(
            prompt=(
                f"Anchor product: {body.product_name} ({body.product_category}, ${body.product_price})\n"
                f"Occasion: {body.occasion} | Gender: {body.gender}\n\n"
                f"Available catalog:\n{catalog_text}"
            ),
            model="llama-3.3-70b-versatile",
            system_message=(
                "You are an expert fashion stylist. Given one anchor product, "
                "select complementary items from the provided catalog to build "
                "a complete, cohesive outfit. Return ONLY a JSON array (no markdown) like:\n"
                '[{"name": "Product Name", "reason": "Why it matches"}]\n'
                "Select 2-4 complementary items. Do NOT include the anchor product itself."
            ),
            temperature=0.5,
            max_tokens=500,
            log_cost=False,
        )

        raw = extract_text(completion)
        outfit_picks = parse_ai_json(raw)

        if not isinstance(outfit_picks, list):
            raise MalformedAIResponseError(
                "Outfit completion returned non-array JSON",
                user_message=USER_MESSAGES["malformed_ai_response"],
            )

        enriched = []
        for pick in outfit_picks:
            if not isinstance(pick, dict):
                continue
            match = next(
                (
                    p
                    for p in catalog
                    if p["name"].strip().lower() == pick.get("name", "").strip().lower()
                ),
                None,
            )
            if match:
                enriched.append(
                    {
                        "id": match["id"],
                        "name": match["name"],
                        "price": match["price"],
                        "category": match["category"],
                        "image_url": match["image_url"]
                        or f"https://picsum.photos/seed/{match['id']}/300/400",
                        "reason": pick.get("reason", ""),
                    }
                )

        logger.info(
            "Outfit completion generated",
            event_type="complete_outfit_response",
            user_id=user_id,
            outfit_count=len(enriched),
            recommendation_count=len(enriched),
        )

        log_ai_usage("Outfit Completion", 0.0020, 2000, user_id)
        return {"success": True, "outfit": enriched}

    except AppError as exc:
        message = log_exception(logger, "complete_outfit_error", exc, user_id=user_id)
        return {"success": False, "outfit": [], "message": message}

    except Exception as exc:
        message = log_exception(logger, "complete_outfit_error", exc, user_id=user_id)
        return {
            "success": False,
            "outfit": [],
            "message": message or USER_MESSAGES["outfit_failed"],
        }
