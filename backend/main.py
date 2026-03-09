"""
AI Fashion Stylist CLI - Main Application
Controls the entire application flow and connects all modules
"""

from rich.console import Console
from rich.panel import Panel

# Import all modules
from questions import ask_fashion_questions, display_answers_summary
from profile_builder import build_style_profile
from db_agent import fetch_products, display_product_summary
from recommendation_agent import get_recommendations
from cost_logger import log_session_costs

console = Console()

def main():
    """
    Main application function - controls the entire workflow
    """
    
    # Display welcome message
    console.print(Panel.fit(
        "👗 AI Fashion Stylist - Your Personal Fashion Assistant 👗\n\n"
        "I'll help you find the perfect outfit based on your style preferences "
        "using AI-powered recommendations.",
        title="Welcome to AI Fashion Stylist",
        style="bold magenta"
    ))
    
    # Step 1: Ask user questions
    console.print("\n" + "="*50)
    console.print("📝 Step 1: Style Assessment")
    console.print("="*50)
    
    answers = ask_fashion_questions()
    display_answers_summary(answers)
    
    # Step 2: Generate style profile
    console.print("\n" + "="*50)
    console.print("� Step 2: Profile Generation")
    console.print("="*50)
    
    user_profile = build_style_profile(answers)
    
    # Step 3: Fetch products from database
    console.print("\n" + "="*50)
    console.print("🗄️ Step 3: Product Catalog")
    console.print("="*50)
    
    products = fetch_products()
    display_product_summary(products)
    
    # Step 4: Generate recommendations
    console.print("\n" + "="*50)
    console.print("🤖 Step 4: AI Recommendations")
    console.print("="*50)
    
    recommendations = get_recommendations(user_profile, products)
    
    # Step 5: Session summary
    console.print("\n" + "="*50)
    console.print("✨ Session Complete")
    console.print("="*50)
    
    console.print(Panel.fit(
        "Thank you for using AI Fashion Stylist! 👋\n\n"
        "I hope these recommendations help you find the perfect outfit. "
        "Feel free to run the program again for different occasions or style preferences!",
        style="bold green"
    ))

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        console.print("\n👋 Goodbye!", style="bold yellow")
    except Exception as e:
        console.print(f"\n❌ An error occurred: {e}", style="bold red")
        console.print("Please check your configuration and try again.", style="bold yellow")
