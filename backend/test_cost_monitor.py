from cost_monitor import CostMonitor

def main():
    monitor = CostMonitor()
    
    # Test with realistic data from our token analysis
    total_tokens = 523  # From previous token analysis
    model_name = 'llama3-8b-8192'  # Default model
    
    # Analyze costs
    monitor.analyze_costs(total_tokens, model_name)

if __name__ == "__main__":
    main()
