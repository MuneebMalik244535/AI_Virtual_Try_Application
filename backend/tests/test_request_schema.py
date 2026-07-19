import pytest
from pydantic import ValidationError

from app.schemas.requests import StylistRequest, NLSearchRequest, ChatMessage, CompleteOutfitRequest


def test_stylist_request_validates_and_cleans_colors():
    payload = {
        "budget": 120.0,
        "occasion": "casual",
        "season": "summer",
        "colors": [" blue ", "black", ""],
        "height": 175.0,
        "body_type": "athletic",
        "skin_tone": "medium",
        "style_preference": "modern",
        "gender": "female",
        "user_image": None,
    }

    request = StylistRequest(**payload)

    assert request.budget == 120.0
    assert request.colors == ["blue", "black"]
    assert request.occasion == "casual"
    assert request.height == 175.0


def test_stylist_request_rejects_invalid_budget():
    payload = {
        "budget": -10.0,
        "occasion": "casual",
        "season": "summer",
        "colors": ["blue"],
        "height": 170.0,
        "body_type": "athletic",
        "skin_tone": "medium",
        "style_preference": "modern",
        "gender": "female",
    }

    with pytest.raises(ValidationError):
        StylistRequest(**payload)


def test_nl_search_request_requires_query():
    with pytest.raises(ValidationError):
        NLSearchRequest(query="")


def test_chat_message_allows_optional_history_and_user_id():
    message = ChatMessage(message="Hello stylist")
    assert message.history == []
    assert message.user_id == "anonymous"


def test_complete_outfit_request_accepts_defaults():
    outfit_request = CompleteOutfitRequest(
        product_name="Classic Jeans",
        product_category="pants",
        product_price=79.99,
    )
    assert outfit_request.occasion == "casual"
    assert outfit_request.gender == "unisex"
