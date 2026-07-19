"""
Cost Logger module for AI Fashion Stylist CLI
Tracks token usage and calculates costs for API calls
"""

from rich.console import Console
from rich.panel import Panel
from app.core.config import MODEL_PRICING

console = Console()

def log_api_call(response, model_name, prompt):
    """
    Extract token usage from Groq response and display cost report
    
    Args:
        response (dict): API response from Groq
        model_name (str): Name of the model used
        prompt (str): The original prompt sent
    """
    
    try:
        # Extract token usage from response
        usage = response.get('usage', {})
        input_tokens = usage.get('prompt_tokens', 0)
        output_tokens = usage.get('completion_tokens', 0)
        total_tokens = usage.get('total_tokens', input_tokens + output_tokens)
        
        # Calculate estimated cost
        estimated_cost = calculate_cost(total_tokens, model_name)
        
        # Display cost report
        display_cost_report(model_name, input_tokens, output_tokens, total_tokens, estimated_cost)
        
    except Exception as e:
        console.print(f"⚠️ Error logging API call: {e}", style="bold yellow")

def calculate_cost(total_tokens, model_name):
    """
    Calculate estimated cost based on token usage and model pricing
    
    Args:
        total_tokens (int): Total number of tokens used
        model_name (str): Name of the model used
        
    Returns:
        float: Estimated cost in dollars
    """
    
    # Get price per million tokens for the model
    price_per_million = MODEL_PRICING.get(model_name, MODEL_PRICING["llama3-8b-8192"])
    
    # Calculate cost: (tokens / 1,000,000) * price_per_million
    estimated_cost = (total_tokens / 1_000_000) * price_per_million
    
    return estimated_cost

def display_cost_report(model_name, input_tokens, output_tokens, total_tokens, estimated_cost):
    """
    Display cost report in CLI format
    
    Args:
        model_name (str): Name of the model used
        input_tokens (int): Number of input tokens
        output_tokens (int): Number of output tokens
        total_tokens (int): Total number of tokens
        estimated_cost (float): Estimated cost in dollars
    """
    
    console.print("\n" + "="*30)
    console.print("💰 AI COST REPORT")
    console.print("="*30)
    console.print(f"Model Used: {model_name}")
    console.print(f"Input Tokens: {input_tokens}")
    console.print(f"Output Tokens: {output_tokens}")
    console.print(f"Total Tokens: {total_tokens}")
    console.print(f"Estimated Cost: ${estimated_cost:.6f}")
    console.print("="*30)

def estimate_prompt_tokens(prompt):
    """
    Estimate token count for a prompt (rough approximation)
    
    Args:
        prompt (str): The prompt text
        
    Returns:
        int: Estimated token count
    """
    
    # Rough estimation: ~4 characters per token for English text
    clean_text = ' '.join(prompt.split())
    estimated_tokens = len(clean_text) // 4
    
    return estimated_tokens

def log_session_costs(session_data):
    """
    Log costs for an entire session
    
    Args:
        session_data (dict): Dictionary containing session information
    """
    
    console.print("\n" + "="*40)
    console.print("📊 SESSION COST SUMMARY")
    console.print("="*40)
    
    total_cost = 0
    total_tokens = 0
    
    for call_name, call_data in session_data.items():
        if isinstance(call_data, dict) and 'cost' in call_data:
            cost = call_data['cost']
            tokens = call_data.get('tokens', 0)
            model = call_data.get('model', 'unknown')
            
            console.print(f"{call_name}:")
            console.print(f"  Model: {model}")
            console.print(f"  Tokens: {tokens}")
            console.print(f"  Cost: ${cost:.6f}")
            console.print()
            
            total_cost += cost
            total_tokens += tokens
    
    console.print(f"TOTAL SESSION COST: ${total_cost:.6f}")
    console.print(f"TOTAL TOKENS USED: {total_tokens}")
    console.print("="*40)

def get_cost_efficiency_rating(total_tokens, total_cost):
    """
    Get a rating for cost efficiency
    
    Args:
        total_tokens (int): Total tokens used
        total_cost (float): Total cost incurred
        
    Returns:
        str: Efficiency rating
    """
    
    cost_per_token = total_cost / total_tokens if total_tokens > 0 else 0
    
    if cost_per_token < 0.0000001:  # Less than $0.10 per million tokens
        return "Excellent"
    elif cost_per_token < 0.0000002:  # Less than $0.20 per million tokens
        return "Good"
    elif cost_per_token < 0.0000005:  # Less than $0.50 per million tokens
        return "Fair"
    else:
        return "High"
