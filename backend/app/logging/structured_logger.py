"""
Structured Logging Module for AI Fashion Stylist
Provides comprehensive logging for requests, AI operations, errors, and metrics
"""

import json
import time
from datetime import datetime
from typing import Any, Dict, Optional
from functools import wraps
import sys

class StructuredLogger:
    """
    Structured logger that outputs JSON-formatted logs to console.
    Designed for development with console output, production-ready for log aggregation.
    """
    
    def __init__(self, service_name: str = "ai-fashion-stylist", log_level: str = "INFO"):
        self.service_name = service_name
        self.log_level = log_level
        self.log_levels = {"DEBUG": 0, "INFO": 1, "WARNING": 2, "ERROR": 3, "CRITICAL": 4}
        self.current_level = self.log_levels.get(log_level, 1)
    
    def _should_log(self, level: str) -> bool:
        """Check if message should be logged based on log level"""
        return self.log_levels.get(level, 1) >= self.current_level
    
    def _log(self, level: str, message: str, **kwargs) -> None:
        """Internal logging method that outputs structured JSON"""
        if not self._should_log(level):
            return
            
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level,
            "service": self.service_name,
            "message": message,
            **kwargs
        }
        
        # Output to console (development)
        print(json.dumps(log_entry, indent=2))
    
    def debug(self, message: str, **kwargs) -> None:
        """Log debug message"""
        self._log("DEBUG", message, **kwargs)
    
    def info(self, message: str, **kwargs) -> None:
        """Log info message"""
        self._log("INFO", message, **kwargs)
    
    def warning(self, message: str, **kwargs) -> None:
        """Log warning message"""
        self._log("WARNING", message, **kwargs)
    
    def error(self, message: str, **kwargs) -> None:
        """Log error message"""
        self._log("ERROR", message, **kwargs)
    
    def critical(self, message: str, **kwargs) -> None:
        """Log critical message"""
        self._log("CRITICAL", message, **kwargs)
    
    def log_request(self, method: str, path: str, client_ip: str, user_id: Optional[str] = None, **kwargs) -> None:
        """Log incoming HTTP request"""
        self.info(
            "Incoming request",
            event_type="http_request",
            method=method,
            path=path,
            client_ip=client_ip,
            user_id=user_id or "anonymous",
            **kwargs
        )
    
    def log_response(self, method: str, path: str, status_code: int, response_time_ms: float, **kwargs) -> None:
        """Log HTTP response"""
        self.info(
            "Request completed",
            event_type="http_response",
            method=method,
            path=path,
            status_code=status_code,
            response_time_ms=response_time_ms,
            **kwargs
        )
    
    def log_ai_prompt(self, model: str, prompt: str, prompt_tokens: int, **kwargs) -> None:
        """Log AI prompt sent to LLM"""
        self.info(
            "AI prompt sent",
            event_type="ai_prompt",
            model=model,
            prompt_length=len(prompt),
            prompt_tokens=prompt_tokens,
            prompt_preview=prompt[:200] + "..." if len(prompt) > 200 else prompt,
            **kwargs
        )
    
    def log_ai_response(self, model: str, response: str, response_tokens: int, response_time_ms: float, **kwargs) -> None:
        """Log AI response from LLM"""
        self.info(
            "AI response received",
            event_type="ai_response",
            model=model,
            response_length=len(response),
            response_tokens=response_tokens,
            response_time_ms=response_time_ms,
            response_preview=response[:200] + "..." if len(response) > 200 else response,
            **kwargs
        )
    
    def log_recommendation_count(self, user_id: str, count: int, budget: float, **kwargs) -> None:
        """Log recommendation generation metrics"""
        self.info(
            "Recommendations generated",
            event_type="recommendation",
            user_id=user_id,
            recommendation_count=count,
            budget=budget,
            **kwargs
        )
    
    def log_api_failure(self, api_name: str, error: str, status_code: Optional[int] = None, **kwargs) -> None:
        """Log external API failure"""
        self.error(
            "External API failure",
            event_type="api_failure",
            api_name=api_name,
            error=str(error),
            status_code=status_code,
            **kwargs
        )
    
    def log_database_query(self, query_type: str, table: str, execution_time_ms: float, **kwargs) -> None:
        """Log database query"""
        self.debug(
            "Database query executed",
            event_type="database_query",
            query_type=query_type,
            table=table,
            execution_time_ms=execution_time_ms,
            **kwargs
        )
    
    def log_database_error(self, operation: str, error: str, **kwargs) -> None:
        """Log database error"""
        self.error(
            "Database operation failed",
            event_type="database_error",
            operation=operation,
            error=str(error),
            **kwargs
        )
    
    def log_validation_error(self, field: str, value: Any, constraint: str, **kwargs) -> None:
        """Log validation error"""
        self.warning(
            "Validation failed",
            event_type="validation_error",
            field=field,
            value=str(value),
            constraint=constraint,
            **kwargs
        )


# Global logger instance
logger = StructuredLogger()


def log_execution_time(func):
    """Decorator to log function execution time"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            execution_time_ms = (time.time() - start_time) * 1000
            logger.debug(
                f"Function executed: {func.__name__}",
                function=func.__name__,
                execution_time_ms=execution_time_ms,
                status="success"
            )
            return result
        except Exception as e:
            execution_time_ms = (time.time() - start_time) * 1000
            logger.error(
                f"Function failed: {func.__name__}",
                function=func.__name__,
                execution_time_ms=execution_time_ms,
                status="error",
                error=str(e)
            )
            raise
    return wrapper


def log_ai_call(model: str):
    """Decorator to log AI/LLM API calls"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Extract prompt from arguments
            prompt = kwargs.get('prompt') or (args[0] if args else None)
            
            start_time = time.time()
            
            try:
                # Log prompt
                prompt_tokens = len(str(prompt)) // 4 if prompt else 0  # Rough estimate
                logger.log_ai_prompt(
                    model=model,
                    prompt=str(prompt) if prompt else "",
                    prompt_tokens=prompt_tokens
                )
                
                # Execute function
                result = func(*args, **kwargs)
                
                execution_time_ms = (time.time() - start_time) * 1000
                
                # Log response
                response_text = str(result) if result else ""
                response_tokens = len(response_text) // 4
                logger.log_ai_response(
                    model=model,
                    response=response_text,
                    response_tokens=response_tokens,
                    response_time_ms=execution_time_ms
                )
                
                return result
                
            except Exception as e:
                execution_time_ms = (time.time() - start_time) * 1000
                logger.log_api_failure(
                    api_name="groq",
                    error=str(e),
                    model=model,
                    response_time_ms=execution_time_ms
                )
                raise
        return wrapper
    return decorator


class RequestLogger:
    """Middleware for logging HTTP requests"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        # Extract request info
        method = scope["method"]
        path = scope["path"]
        client_ip = scope.get("client", ["unknown"])[0]
        
        # Log request
        logger.log_request(
            method=method,
            path=path,
            client_ip=client_ip
        )
        
        start_time = time.time()
        status_code = 500
        
        async def send_wrapper(message):
            nonlocal status_code
            if message["type"] == "http.response.start":
                status_code = message["status"]
            await send(message)
        
        try:
            await self.app(scope, receive, send_wrapper)
            
            # Log response
            response_time_ms = (time.time() - start_time) * 1000
            logger.log_response(
                method=method,
                path=path,
                status_code=status_code,
                response_time_ms=response_time_ms
            )
            
        except Exception as e:
            response_time_ms = (time.time() - start_time) * 1000
            logger.error(
                "Request failed with exception",
                method=method,
                path=path,
                client_ip=client_ip,
                response_time_ms=response_time_ms,
                error=str(e)
            )
            raise


# Convenience functions for common logging patterns
def log_recommendation_generation(user_id: str, budget: float, occasion: str, count: int):
    """Log recommendation generation event"""
    logger.log_recommendation_count(
        user_id=user_id,
        count=count,
        budget=budget,
        occasion=occasion
    )


def log_profile_generation(user_id: str, success: bool, method: str = "llm"):
    """Log profile generation event"""
    if success:
        logger.info(
            "Profile generated successfully",
            event_type="profile_generation",
            user_id=user_id,
            method=method,
            status="success"
        )
    else:
        logger.warning(
            "Profile generation failed",
            event_type="profile_generation",
            user_id=user_id,
            method=method,
            status="failed"
        )


def log_free_trial_usage(user_id: str, remaining: int, limit: int):
    """Log free trial usage"""
    logger.info(
        "Free trial usage",
        event_type="free_trial",
        user_id=user_id,
        remaining_requests=remaining,
        daily_limit=limit
    )


def log_gamified_unlock(user_id: str, action: str, success: bool):
    """Log gamified unlock events"""
    logger.info(
        "Gamified unlock action",
        event_type="gamified_unlock",
        user_id=user_id,
        action=action,
        success=success
    )
