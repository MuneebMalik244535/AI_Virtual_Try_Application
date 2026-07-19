"""
Recommendation Agent module for AI Fashion Stylist CLI
Uses LLM to recommend products based on user profile and catalog
"""

import re
from rich.console import Console
from app.core.config import RECOMMENDATION_MODEL, MAX_RECOMMENDATIONS
from app.core.exceptions import AppError
from app.llm.groq_client import call_groq, extract_text
from app.logging.structured_logger import logger, log_recommendation_generation

console = Console()

def get_recommendations(user_profile, product_catalog):
    """
    Generate product recommendations using LLM
    
    Args:
        user_profile (str): User's style profile paragraph
        product_catalog (list): List of product dictionaries
        
    Returns:
        list: List of recommendation dictionaries
    """
    
    console.print("\n🤖 Generating AI recommendations...", style="bold cyan")
    
    # Create the prompt for the LLM
    prompt = f"""
You are an AI fashion stylist recommendation engine.

User Style Profile:
{user_profile}

Product Catalog:
{format_products_for_prompt(product_catalog)}

Instructions:
* Carefully analyze the user profile.
* Compare the profile with the available product catalog.
* Select the most suitable products.

Rules:
* STRICT CATALOG ENFORCEMENT: You must ONLY recommend products that EXACTLY exist in the provided Product Catalog.
* Do NOT create, imagine, or hallucinate new clothing items under any circumstances.
* When recommending a product, output its Name EXACTLY character-for-character as it appears in the catalog.
* Maximum {MAX_RECOMMENDATIONS} recommendations.
* CRITICAL: The TOTAL COMBINED SUM of the prices of all recommended items MUST be strictly less than or equal to the user's budget. 
* Do NOT recommend a combination of items if their total sum exceeds the user's budget. Do the math.
* If you cannot find a complete combination of items under the budget, recommend a PARTIAL outfit. Do not invent cheap items to make it fit.

Output Format:
Recommended Products:
1. Product Name:
   Price:
   Reason:

2. Product Name:
   Price:
   Reason:

Explain briefly why each product matches the user's style, body type, season, and budget.
"""
    
    try:
        response = call_groq(prompt, RECOMMENDATION_MODEL)
        content = extract_text(response)
        recommendations = parse_recommendations_text(content)

        log_recommendation_generation(
            user_id="cli",
            budget=0,
            occasion="unknown",
            count=len(recommendations),
        )

        display_recommendations(recommendations)
        return recommendations

    except AppError:
        raise
    except Exception as exc:
        logger.error(
            "Recommendation generation failed",
            event_type="recommendation_error",
            error=str(exc),
        )
        console.print(f"❌ Error generating recommendations: {exc}", style="bold red")
        return []

def format_products_for_prompt(products):
    """
    Format product catalog for the LLM prompt
    
    Args:
        products (list): List of product dictionaries
        
    Returns:
        str: Formatted product list string
    """
    
    product_list = []
    for product in products:
        product_info = f"""
ID: {product['id']}
Name: {product['name']}
Price: ${product['price']:.2f}
Category: {product['category']}
Description: {product['description']}
Color: {product['color']}
Style: {product['style_tags']}
"""
        product_list.append(product_info)
    
    return "\n".join(product_list)

def parse_recommendations_text(text):
    """
    Parse the recommendations text from LLM response
    
    Args:
        text (str): LLM response text
        
    Returns:
        list: List of recommendation dictionaries
    """
    
    recommendations = []
    
    try:
        # Remove <think> blocks naturally output by models like Qwen
        text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
        
        lines = text.strip().split('\n')
        current_rec = {}
        
        for line in lines:
            line = line.strip()
            
            # Remove Markdown bold/italics
            line_clean = line.replace('**', '').replace('*', '').strip()
            
            # Skip empty lines
            if not line_clean:
                continue
                
            # Look for numbered items (matches "1. ", "2.", etc.)
            if re.match(r'^\d+\.', line_clean):
                # Save previous recommendation if exists
                if current_rec:
                    recommendations.append(current_rec)
                
                # Start new recommendation
                number_part = line_clean.split('.', 1)[0]
                rest_of_line = line_clean.split('.', 1)[1].strip()
                current_rec = {'number': number_part}
                
                # Extract product name if it's on the same line
                if 'Product Name:' in rest_of_line:
                    current_rec['name'] = rest_of_line.split('Product Name:', 1)[1].strip()
                elif rest_of_line:
                    # If the rest of the line isn't empty, assume it's the product name
                    current_rec['name'] = rest_of_line.strip()
            
            # Look for product name on its own line
            elif line_clean.startswith('Product Name:'):
                current_rec['name'] = line_clean.split('Product Name:', 1)[1].strip()
            
            # Look for price
            elif line_clean.startswith('Price:'):
                price_text = line_clean.split('Price:', 1)[1].strip()
                # Remove $ and convert to float
                try:
                    current_rec['price'] = float(price_text.replace('$', '').replace(',', ''))
                except ValueError:
                    current_rec['price'] = price_text
            
            # Look for reason
            elif line_clean.startswith('Reason:'):
                current_rec['reason'] = line_clean.split('Reason:', 1)[1].strip()
        
        # Add the last recommendation
        if current_rec:
            recommendations.append(current_rec)
        
        return recommendations
        
    except Exception as e:
        console.print(f"Error parsing recommendations: {e}", style="bold red")
        return []

def display_recommendations(recommendations):
    """
    Display recommendations in CLI format
    
    Args:
        recommendations (list): List of recommendation dictionaries
    """
    
    console.print("\n" + "="*50)
    console.print("🌟 AI RECOMMENDATIONS")
    console.print("="*50)
    
    if not recommendations:
        console.print("❌ No recommendations available", style="bold red")
        return
    
    emoji_numbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"]
    
    for i, rec in enumerate(recommendations, 1):
        emoji = emoji_numbers[i-1] if i <= 5 else f"{i}."
        
        console.print(f"\n{emoji} {rec.get('name', 'Unknown Product')}")
        
        price = rec.get('price', 'N/A')
        if isinstance(price, (int, float)):
            console.print(f"   Price: ${price:.2f}")
        else:
            console.print(f"   Price: {price}")
        
        console.print(f"   Reason: {rec.get('reason', 'No reason provided')}")
    
    console.print("\n" + "="*50)
