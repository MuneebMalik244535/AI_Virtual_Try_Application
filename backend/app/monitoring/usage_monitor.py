from rich.console import Console
from rich.panel import Panel

console = Console()

class UsageMonitor:
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
    
    def calculate_cost(self, input_tokens: int, output_tokens: int, model_name: str) -> float:
        """Calculate cost based on model pricing"""
        if model_name not in self.model_pricing:
            model_name = 'llama3-8b-8192'  # Default model
        
        pricing = self.model_pricing[model_name]
        
        input_cost = (input_tokens / 1000) * pricing['input_cost_per_1k']
        output_cost = (output_tokens / 1000) * pricing['output_cost_per_1k']
        
        return input_cost + output_cost
    
    def analyze_efficiency(self, input_tokens: int, output_tokens: int, total_tokens: int, model_name: str) -> str:
        """Analyze whether token usage is efficient or high"""
        
        # Calculate output/input ratio
        if input_tokens > 0:
            ratio = output_tokens / input_tokens
        else:
            ratio = 0
        
        # Determine efficiency based on model and token counts
        efficiency_analysis = []
        
        # Check total token usage
        if total_tokens < 200:
            efficiency_analysis.append("very efficient")
        elif total_tokens < 500:
            efficiency_analysis.append("efficient")
        elif total_tokens < 1000:
            efficiency_analysis.append("moderate")
        elif total_tokens < 2000:
            efficiency_analysis.append("high")
        else:
            efficiency_analysis.append("very high")
        
        # Check output/input ratio
        if ratio < 0.2:
            efficiency_analysis.append("low output generation")
        elif ratio > 0.8:
            efficiency_analysis.append("high output generation")
        
        # Model-specific considerations
        if model_name == 'llama3-70b-8192':
            if total_tokens > 1000:
                efficiency_analysis.append("expensive for this model")
        elif model_name == 'llama3-8b-8192':
            if total_tokens < 100:
                efficiency_analysis.append("economical choice")
        
        # Cost efficiency
        cost = self.calculate_cost(input_tokens, output_tokens, model_name)
        if cost < 0.01:
            efficiency_analysis.append("very cost-effective")
        elif cost < 0.05:
            efficiency_analysis.append("cost-effective")
        elif cost < 0.20:
            efficiency_analysis.append("moderate cost")
        else:
            efficiency_analysis.append("high cost")
        
        # Generate explanation
        if "very efficient" in efficiency_analysis or "efficient" in efficiency_analysis:
            if "cost-effective" in efficiency_analysis:
                return f"Token usage is {efficiency_analysis[0]} and cost-effective. Good balance between input and output tokens."
            else:
                return f"Token usage is {efficiency_analysis[0]}. Consider optimizing output length if cost is a concern."
        
        elif "moderate" in efficiency_analysis:
            return f"Token usage is moderate. Acceptable for complex requests but could be optimized for better cost efficiency."
        
        else:  # high or very high
            if "expensive" in efficiency_analysis:
                return f"Token usage is {efficiency_analysis[0]} and expensive for this model. Consider using a smaller model or reducing input size."
            else:
                return f"Token usage is {efficiency_analysis[0]}. Optimization recommended to reduce costs."
    
    def generate_usage_report(self, input_tokens: int, output_tokens: int, total_tokens: int, model_name: str):
        """Generate usage report after AI request"""
        
        # Calculate cost
        estimated_cost = self.calculate_cost(input_tokens, output_tokens, model_name)
        
        # Get model display name
        model_display = self.model_pricing.get(model_name, {}).get('name', model_name)
        
        # Analyze efficiency
        efficiency_explanation = self.analyze_efficiency(input_tokens, output_tokens, total_tokens, model_name)
        
        # Display report
        console.print("\n" + "="*30)
        console.print("AI USAGE REPORT")
        console.print("="*30)
        console.print()
        
        console.print(f"Model Used: {model_display}")
        console.print(f"Input Tokens: {input_tokens}")
        console.print(f"Output Tokens: {output_tokens}")
        console.print(f"Total Tokens: {total_tokens}")
        console.print(f"Estimated Cost: ${estimated_cost:.4f}")
        console.print()
        
        console.print("Efficiency Analysis:")
        console.print(efficiency_explanation)
        console.print()
        
        console.print("="*30)
        
        return {
            'model_used': model_display,
            'input_tokens': input_tokens,
            'output_tokens': output_tokens,
            'total_tokens': total_tokens,
            'estimated_cost': estimated_cost,
            'efficiency_rating': efficiency_explanation
        }

def main():
    try:
        monitor = UsageMonitor()
        
        console.print("📊 AI Usage Monitoring Assistant")
        console.print("Enter usage statistics:")
        
        # Get inputs
        try:
            input_tokens = int(input("Input tokens: ").strip())
            output_tokens = int(input("Output tokens: ").strip())
            total_tokens = int(input("Total tokens: ").strip())
        except ValueError:
            # Use sample data
            input_tokens = 333
            output_tokens = 95
            total_tokens = 428
            console.print(f"Using sample data: {input_tokens} input, {output_tokens} output, {total_tokens} total")
        
        model_name = input("Model name (llama3-8b-8192, llama3-70b-8192, mixtral-8x7b-32768, gemma-7b-it): ").strip()
        if not model_name:
            model_name = 'llama3-70b-8192'
        
        # Generate report
        report_data = monitor.generate_usage_report(input_tokens, output_tokens, total_tokens, model_name)
        
        console.print(f"\n📈 Usage data recorded: {report_data}")
        
    except KeyboardInterrupt:
        console.print("\n👋 Goodbye!", style="bold yellow")
    except Exception as e:
        console.print(f"\n❌ An error occurred: {e}", style="bold red")

if __name__ == "__main__":
    main()
