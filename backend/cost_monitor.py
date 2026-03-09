from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()

class CostMonitor:
    def __init__(self):
        # Groq pricing (approximate as of 2024)
        self.model_pricing = {
            'llama3-8b-8192': {
                'input_cost_per_1k': 0.05,
                'output_cost_per_1k': 0.15,
                'name': 'Llama 3 8B'
            },
            'llama3-70b-8192': {
                'input_cost_per_1k': 0.59,
                'output_cost_per_1k': 0.79,
                'name': 'Llama 3 70B'
            },
            'mixtral-8x7b-32768': {
                'input_cost_per_1k': 0.27,
                'output_cost_per_1k': 0.27,
                'name': 'Mixtral 8x7B'
            },
            'gemma-7b-it': {
                'input_cost_per_1k': 0.07,
                'output_cost_per_1k': 0.07,
                'name': 'Gemma 7B'
            }
        }
    
    def estimate_request_cost(self, total_tokens: int, model_name: str) -> float:
        """Estimate cost for a single request assuming 70% input, 30% output tokens"""
        if model_name not in self.model_pricing:
            model_name = 'llama3-8b-8192'  # Default model
        
        pricing = self.model_pricing[model_name]
        
        # Assume 70% input tokens, 30% output tokens (typical for recommendations)
        input_tokens = int(total_tokens * 0.7)
        output_tokens = int(total_tokens * 0.3)
        
        input_cost = (input_tokens / 1000) * pricing['input_cost_per_1k']
        output_cost = (output_tokens / 1000) * pricing['output_cost_per_1k']
        
        return input_cost + output_cost
    
    def calculate_scaled_costs(self, cost_per_request: float) -> dict:
        """Calculate costs for different user scales"""
        return {
            '100_users': cost_per_request * 100,
            '1000_users': cost_per_request * 1000,
            '10000_users': cost_per_request * 10000
        }
    
    def analyze_costs(self, total_tokens: int, model_name: str):
        """Perform complete cost analysis"""
        console.print(Panel.fit(
            "💰 AI Cost Monitoring Assistant 💰\n\n"
            "Analyzing costs for AI recommendation requests...",
            title="Cost Monitor",
            style="bold magenta"
        ))
        
        # Get model info
        if model_name not in self.model_pricing:
            console.print(f"⚠️  Unknown model '{model_name}', using default Llama 3 8B")
            model_name = 'llama3-8b-8192'
        
        model_info = self.model_pricing[model_name]
        
        # Calculate cost per request
        cost_per_request = self.estimate_request_cost(total_tokens, model_name)
        
        # Calculate scaled costs
        scaled_costs = self.calculate_scaled_costs(cost_per_request)
        
        # Display results
        console.print("\n" + "="*40)
        console.print("COST ANALYSIS")
        console.print("="*40)
        
        console.print(f"\nCost Per Request: ${cost_per_request:.6f}")
        console.print(f"Estimated Cost for 100 users: ${scaled_costs['100_users']:.4f}")
        console.print(f"Estimated Cost for 1000 users: ${scaled_costs['1000_users']:.2f}")
        console.print(f"Estimated Cost for 10000 users: ${scaled_costs['10000_users']:.0f}")
        
        # Additional details
        console.print("\n" + "="*40)
        console.print("COST DETAILS")
        console.print("="*40)
        
        table = Table(title="Cost Breakdown")
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="yellow", justify="right")
        
        table.add_row("Model", model_info['name'])
        table.add_row("Total Tokens", f"{total_tokens:,}")
        table.add_row("Input Tokens (70%)", f"{int(total_tokens * 0.7):,}")
        table.add_row("Output Tokens (30%)", f"{int(total_tokens * 0.3):,}")
        table.add_row("Input Cost/1K", f"${model_info['input_cost_per_1k']}")
        table.add_row("Output Cost/1K", f"${model_info['output_cost_per_1k']}")
        
        console.print(table)
        
        # Cost insights
        console.print("\n" + "="*40)
        console.print("COST INSIGHTS")
        console.print("="*40)
        
        daily_cost_1000 = scaled_costs['1000_users'] * 30  # Assuming daily requests
        monthly_cost_1000 = scaled_costs['1000_users'] * 30
        
        console.print(f"💡 For 1000 users:")
        console.print(f"   • Daily cost: ${daily_cost_1000:.2f}")
        console.print(f"   • Monthly cost: ${monthly_cost_1000:.2f}")
        
        if cost_per_request < 0.01:
            console.print(f"✅ Cost per request is very economical")
        elif cost_per_request < 0.05:
            console.print(f"✅ Cost per request is reasonable")
        else:
            console.print(f"⚠️  Consider optimizing to reduce cost per request")
        
        # Model comparison
        console.print(f"\n🔄 Model Comparison (for {total_tokens:,} tokens):")
        for model_key, model_data in self.model_pricing.items():
            if model_key != model_name:
                alt_cost = self.estimate_request_cost(total_tokens, model_key)
                savings = cost_per_request - alt_cost
                console.print(f"   • {model_data['name']}: ${alt_cost:.6f} (save ${savings:.6f} per request)")

def main():
    try:
        monitor = CostMonitor()
        
        console.print("💰 AI Cost Monitoring Assistant")
        console.print("Enter the following information:")
        
        # Get inputs
        try:
            total_tokens = int(input("Total tokens: ").strip())
        except ValueError:
            total_tokens = 523  # Default from previous analysis
        
        model_name = input("Model name (llama3-8b-8192, llama3-70b-8192, mixtral-8x7b-32768, gemma-7b-it): ").strip()
        if not model_name:
            model_name = 'llama3-8b-8192'
        
        # Analyze costs
        monitor.analyze_costs(total_tokens, model_name)
        
    except KeyboardInterrupt:
        console.print("\n👋 Goodbye!", style="bold yellow")
    except Exception as e:
        console.print(f"\n❌ An error occurred: {e}", style="bold red")

if __name__ == "__main__":
    main()
