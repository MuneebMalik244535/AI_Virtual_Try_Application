"""
Pydantic request schemas for all API endpoints.
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Optional


class StylistRequest(BaseModel):
    budget: float = Field(..., gt=0, description="Budget must be greater than zero")
    occasion: str = Field(..., min_length=1, max_length=100)
    season: str = Field(..., min_length=1, max_length=50)
    colors: List[str] = Field(..., min_length=1, max_length=10)
    height: float = Field(..., gt=0, le=300)
    body_type: str = Field(..., min_length=1, max_length=50)
    skin_tone: str = Field(..., min_length=1, max_length=50)
    style_preference: str = Field(..., min_length=1, max_length=100)
    gender: str = Field(..., min_length=1, max_length=30)
    user_image: Optional[str] = Field(default=None, max_length=2048)

    @field_validator("colors")
    @classmethod
    def validate_colors(cls, colors: List[str]) -> List[str]:
        cleaned = [c.strip() for c in colors if c and c.strip()]
        if not cleaned:
            raise ValueError("At least one color is required")
        return cleaned


class CompleteOutfitRequest(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=200)
    product_category: str = Field(..., min_length=1, max_length=100)
    product_price: float = Field(..., ge=0)
    occasion: Optional[str] = Field(default="casual", max_length=50)
    gender: Optional[str] = Field(default="unisex", max_length=30)


class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: Optional[List[dict]] = Field(default_factory=list)
    user_id: Optional[str] = Field(default="anonymous", max_length=100)


class NLSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
