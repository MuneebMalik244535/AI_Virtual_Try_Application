from usage_monitor import UsageMonitor

def main():
    monitor = UsageMonitor()
    
    # Test with realistic data from our previous analysis
    input_tokens = 333
    output_tokens = 95
    total_tokens = 428
    model_name = 'llama3-70b-8192'
    
    # Generate report
    report_data = monitor.generate_usage_report(input_tokens, output_tokens, total_tokens, model_name)

if __name__ == "__main__":
    main()
