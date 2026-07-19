"""
Pydantic response schemas for all API endpoints.

Previously embedded inline in the monolithic api.py file.
"""

from pydantic import BaseModel
from typing import List, Optional


class RecommendationItem(BaseModel):
    name: str
    price: float
    reason: str
    # Image sourced from our database
    image_url: Optional[str] = None


class StylistResponse(BaseModel):
    recommendations: List[dict]
    success: bool
    message: Optional[str] = None
