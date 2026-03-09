"""
Recommendation Agent module for AI Fashion Stylist CLI
Uses LLM to recommend products based on user profile and catalog
"""

import json
import re
from rich.console import Console
from rich.panel import Panel
from config import RECOMMENDATION_MODEL, MAX_RECOMMENDATIONS
from cost_logger import log_api_call

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
* Only recommend products that exist in the provided catalog.
* Do NOT create new clothing items.
* Maximum {MAX_RECOMMENDATIONS} recommendations.
* CRITICAL: The TOTAL COMBINED SUM of the prices of all recommended items MUST be strictly less than or equal to the user's budget. 
* Do NOT recommend a combination of items if their total sum exceeds the user's budget! You must do the math.
* If you cannot find a complete combination of the requested items that stays strictly under the budget, you MUST recommend a PARTIAL outfit (fewer items) as long as its total combined price stays strictly under the user's budget. Do not get stuck trying to find an impossible combination.

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
        # Call Groq API
        response = call_groq_api(prompt, RECOMMENDATION_MODEL)
        
        if response:
            # Extract recommendations from response
            recommendations = extract_recommendations_from_response(response)
            
            display_recommendations(recommendations)
            return recommendations
        else:
            console.print("❌ Failed to get recommendations", style="bold red")
            return []
            
    except Exception as e:
        console.print(f"❌ Error generating recommendations: {e}", style="bold red")
        return []

def call_groq_api(prompt, model):
    """
    Make API call to Groq for recommendations
    
    Args:
        prompt (str): The prompt to send
        model (str): Model name to use
        
    Returns:
        dict: API response
    """
    
    try:
        import requests
        
        from config import GROQ_API_KEY, GROQ_BASE_URL
        
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 4000
        }
        
        response = requests.post(
            f"{GROQ_BASE_URL}/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            # Log the API call for cost tracking
            log_api_call(result, model, prompt)
            
            return result
        else:
            console.print(f"❌ API Error: {response.status_code}", style="bold red")
            return None
            
    except Exception as e:
        console.print(f"❌ API call failed: {e}", style="bold red")
        return None

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

def extract_recommendations_from_response(response):
    """
    Extract recommendations from API response
    
    Args:
        response (dict): API response
        
    Returns:
        list: List of recommendation dictionaries
    """
    
    try:
        content = response['choices'][0]['message']['content']
        
        # Parse the response to extract recommendations
        recommendations = parse_recommendations_text(content)
        
        return recommendations
        
    except (KeyError, IndexError) as e:
        console.print(f"Error parsing response: {e}", style="bold red")
        return []

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
