from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# Import existing logic safely
from profile_builder import build_style_profile
from database import DatabaseManager
from recommendation_agent import get_recommendations

app = FastAPI(title="AI Fashion Stylist API")

# Configure CORS so the React frontend can communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Pydantic Schemas for Request
class StylistRequest(BaseModel):
    budget: float
    occasion: str
    season: str
    colors: List[str]
    height: float
    body_type: str
    skin_tone: str
    style_preference: str
    gender: str
    user_image: Optional[str] = None

# Pydantic Schemas for Response
class RecommendationItem(BaseModel):
    name: str
    price: float
    reason: str
    # Image generated in our DB 
    image_url: Optional[str] = None

class StylistResponse(BaseModel):
    recommendations: List[dict]
    success: bool
    message: Optional[str] = None

@app.post("/api/stylist/recommendations", response_model=StylistResponse)
async def generate_recommendations(request: StylistRequest):
    try:
        # 1. Format the incoming request to match profile_builder expectations
        answers = {
            "budget": f"${request.budget}",
            "occasion": request.occasion,
            "style": request.style_preference,
            "height": f"{request.height} cm",
            "body_type": request.body_type,
            "skin_tone": request.skin_tone,
            "season": request.season,
            "preferred_colors": ", ".join(request.colors),
            "clothing_type": "complete outfit" # general instruction to AI
        }
        
        # 2. Build the descriptive AI profile
        user_profile = build_style_profile(answers)
        
        # 3. Retrieve available products from the Neon database (Optimized Subset)
        db_manager = DatabaseManager()
        # Pre-filter: only pass max 70 items to the LLM to prevent crash/high cost.
        # It also automatically eliminates items that cost more than the total budget.
        product_catalog = db_manager.get_filtered_products(
            budget=request.budget,
            occasion=request.occasion,
            season=request.season,
            colors=request.colors,
            limit=70
        )
        db_manager.close()
        
        # 4. Ask the LLM engine to select items from catalog that fit the profile constraints
        print(f"DEBUG: Profile generated: {user_profile}")
        recommended_items = get_recommendations(user_profile, product_catalog)
        
        # 5. Enrich the LLM's recommended items with database fields (like image_url)
        # LLM output gives us 'name', 'price', and 'reason'. Let's find the matching image from the DB.
        enriched_recommendations = []
        for rec in recommended_items:
            # Find the matching product in the database to extract its image_url
            matching_db_product = next((p for p in product_catalog if str(p['name']).strip().lower() == str(rec.get('name', '')).strip().lower()), None)
            
            enrich_data = {
                "name": rec.get('name', 'Unknown Product'),
                "price": rec.get('price', 0.0),
                "reason": rec.get('reason', 'No specific reason provided.'),
                "image_url": matching_db_product['image_url'] if matching_db_product else "https://picsum.photos/400/500?random=999"
            }
            enriched_recommendations.append(enrich_data)
        
        # Return success with recommendations
        return StylistResponse(
            recommendations=enriched_recommendations,
            success=True,
            message="Recommendations generated successfully."
        )
        
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        return StylistResponse(
            recommendations=[],
            success=False,
            message=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    # The frontend is expecting the API at port 3000
    uvicorn.run(app, host="0.0.0.0", port=3000)
