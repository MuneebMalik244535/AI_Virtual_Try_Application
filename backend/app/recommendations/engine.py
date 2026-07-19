"""
FashionRecommendationEngine – rule-based (non-LLM) product scoring.

Used as a lightweight fallback or pre-ranking layer.
Migrated from the flat recommendation_engine.py with no functional changes.
"""

import json
import re
from typing import Dict, List, Any
from rich.console import Console
from rich.panel import Panel

console = Console()


class FashionRecommendationEngine:
    def __init__(self):
        self.style_keywords = {
            "casual": ["casual", "relaxed", "comfortable", "everyday", "weekend"],
            "formal": ["formal", "business", "professional", "work", "office", "dressy"],
            "sport": ["sport", "athletic", "active", "gym", "running", "workout"],
            "classic": ["classic", "timeless", "traditional", "elegant"],
            "modern": ["modern", "contemporary", "trendy", "fashionable"],
            "summer": ["summer", "warm", "hot", "beach", "vacation"],
            "winter": ["winter", "cold", "warm", "cozy", "snow"],
            "versatile": ["versatile", "flexible", "all-occasion", "multi-purpose"],
            "minimal": ["minimal", "simple", "clean", "basic"],
            "streetwear": ["streetwear", "urban", "trendy", "casual"],
            "party": ["party", "evening", "night", "celebration"],
        }

    def parse_user_profile(self, profile_text: str) -> Dict[str, Any]:
        """Parse user profile text into structured preference dict."""
        profile_lower = profile_text.lower()

        preferences: Dict[str, Any] = {
            "budget": 1000,
            "occasion": "casual",
            "style": "casual",
            "height": "average",
            "body_type": "average",
            "skin_tone": "medium",
            "season": "all",
            "colors": "neutral",
            "clothing_type": "any",
        }

        budget_match = re.search(r"\$(\d+)", profile_text)
        if budget_match:
            preferences["budget"] = int(budget_match.group(1))

        for occasion in ["casual", "party", "office", "wedding"]:
            if occasion in profile_lower:
                preferences["occasion"] = occasion
                break

        for style in ["minimal", "streetwear", "formal", "sporty", "classic", "modern"]:
            if style in profile_lower:
                preferences["style"] = style
                break

        for body_type in ["slim", "average", "athletic", "heavy"]:
            if body_type in profile_lower:
                preferences["body_type"] = body_type
                break

        for season in ["summer", "winter", "spring"]:
            if season in profile_lower:
                preferences["season"] = season
                break

        colors_match = re.search(r"prefers? ([^.]*) colors?", profile_lower)
        if colors_match:
            preferences["colors"] = colors_match.group(1).strip()

        clothing_match = re.search(
            r"looking for ([^.]*?) (suitable|perfect|appropriate)", profile_lower
        )
        if clothing_match:
            preferences["clothing_type"] = clothing_match.group(1).strip()

        return preferences

    def calculate_match_score(
        self, product: Dict[str, Any], preferences: Dict[str, Any]
    ) -> float:
        """Calculate how well a product matches user preferences (0–9 scale)."""
        score = 0.0

        # Budget match (0–2)
        if product["product_price"] <= preferences["budget"]:
            score += 2.0
        elif product["product_price"] <= preferences["budget"] * 1.2:
            score += 1.0

        # Occasion match (0–2)
        product_style = product["product_style"].lower()
        if preferences["occasion"] == "formal" and "formal" in product_style:
            score += 2.0
        elif preferences["occasion"] == "casual" and "casual" in product_style:
            score += 2.0
        elif preferences["occasion"] == "party" and (
            "evening" in product_style or "formal" in product_style
        ):
            score += 2.0

        # Style match (0–2)
        if preferences["style"] in product_style:
            score += 2.0
        elif preferences["style"] == "sporty" and "sport" in product_style:
            score += 2.0
        elif preferences["style"] == "minimal" and "classic" in product_style:
            score += 1.0

        # Season match (0–1)
        if preferences["season"] in product_style:
            score += 1.0
        elif preferences["season"] == "all":
            score += 0.5

        # Color preference (0–1)
        product_color = product["product_color"].lower()
        user_colors = preferences["colors"].lower()
        if any(color in product_color for color in user_colors.split(" and ")):
            score += 1.0

        # Category match (0–1)
        if preferences["clothing_type"] != "any":
            clothing_type = preferences["clothing_type"].lower()
            product_category = product["product_category"].lower()
            product_name = product["product_name"].lower()
            if clothing_type in product_category or clothing_type in product_name:
                score += 1.0

        return score

    def generate_recommendation_reason(
        self, product: Dict[str, Any], preferences: Dict[str, Any]
    ) -> str:
        """Generate a personalised reason string for a product recommendation."""
        reasons = []

        if product["product_price"] <= preferences["budget"]:
            reasons.append(f"Fits your ${preferences['budget']} budget")

        product_style = product["product_style"].lower()
        if preferences["style"] in product_style:
            reasons.append(f"Matches your {preferences['style']} style preference")

        if preferences["occasion"] == "formal" and "formal" in product_style:
            reasons.append("Perfect for formal occasions")
        elif preferences["occasion"] == "casual" and "casual" in product_style:
            reasons.append("Great for casual wear")
        elif preferences["occasion"] == "party" and (
            "evening" in product_style or "formal" in product_style
        ):
            reasons.append("Ideal for party events")

        if preferences["season"] in product_style:
            reasons.append(f"Perfect for {preferences['season']}")

        product_color = product["product_color"].lower()
        user_colors = preferences["colors"].lower()
        if any(color in product_color for color in user_colors.split(" and ")):
            reasons.append(f"Matches your {preferences['colors']} color preference")

        if preferences["body_type"] == "athletic":
            reasons.append("Suitable for athletic body type")
        elif preferences["body_type"] == "slim" and "slim" in product["product_name"].lower():
            reasons.append("Designed for slim body types")

        if preferences["clothing_type"] != "any":
            reasons.append(f"Matches your need for {preferences['clothing_type']}")

        return ". ".join(reasons[:3]) if reasons else "Matches your general preferences"

    def generate_recommendations(
        self, user_profile: str, product_catalog: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Score and rank products against the user profile, returning the top 5."""
        console.print(
            Panel.fit("🤖 Analyzing User Profile & Product Catalog...", style="bold blue")
        )

        preferences = self.parse_user_profile(user_profile)
        console.print(f"📝 Parsed preferences: {preferences}")

        scored_products = []
        for product in product_catalog:
            score = self.calculate_match_score(product, preferences)
            if score > 0:
                product["match_score"] = score
                product["recommendation_reason"] = self.generate_recommendation_reason(
                    product, preferences
                )
                scored_products.append(product)

        scored_products.sort(key=lambda x: x["match_score"], reverse=True)
        return scored_products[:5]

    def display_recommendations(self, recommendations: List[Dict[str, Any]]) -> None:
        """Print a formatted CLI summary of recommendations."""
        if not recommendations:
            console.print("❌ No suitable products found in the catalog.", style="bold red")
            return

        console.print("\n" + "=" * 32)
        console.print("AI STYLIST RECOMMENDATIONS")
        console.print("=" * 32)
        console.print()

        emoji_numbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"]

        for i, product in enumerate(recommendations, 1):
            emoji = emoji_numbers[i - 1] if i <= 5 else f"{i}."
            console.print(f"{emoji} {product['product_name']}")
            console.print(f"Price: ${product['product_price']:.2f}")
            console.print(f"Reason: {product['recommendation_reason']}")
            console.print()

        console.print("=" * 32)

    def format_as_json(self, recommendations: List[Dict[str, Any]]) -> str:
        """Serialise recommendations to JSON."""
        formatted = [
            {
                "product_name": p["product_name"],
                "price": p["product_price"],
                "reason": p["recommendation_reason"],
                "match_score": p["match_score"],
            }
            for p in recommendations
        ]
        return json.dumps(formatted, indent=2)
