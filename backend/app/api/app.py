"""
Main FastAPI application for AI Fashion Stylist
Brings together all route modules
"""

import os
import time

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1 import stylist_routes, admin_routes, chat_routes, search_routes
from app.api.error_handlers import (
    app_error_handler,
    http_exception_handler,
    unhandled_exception_handler,
    validation_error_handler,
)
from app.core.config import ALLOWED_ORIGINS, validate_environment
from app.core.errors import log_exception
from app.core.exceptions import AppError, ConfigurationError
from app.logging.structured_logger import logger

app = FastAPI(title="AI Fashion Stylist API")

app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(RequestValidationError, validation_error_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_validation():
    """Validate required environment variables; log but don't crash in dev."""
    try:
        validate_environment()
        logger.info("Environment validation passed", event_type="startup")
    except ConfigurationError as exc:
        logger.error(
            "Environment validation failed",
            event_type="configuration_error",
            error=str(exc),
            detail=exc.detail,
        )


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware to log all HTTP requests and responses."""
    start_time = time.time()
    client_ip = request.client.host if request.client else "unknown"

    logger.log_request(
        method=request.method,
        path=request.url.path,
        client_ip=client_ip,
        user_id=request.headers.get("X-User-ID", "anonymous"),
    )

    try:
        response = await call_next(request)

        response_time_ms = (time.time() - start_time) * 1000
        logger.log_response(
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            response_time_ms=response_time_ms,
        )
        return response

    except Exception as exc:
        response_time_ms = (time.time() - start_time) * 1000
        log_exception(
            logger,
            "request_middleware_error",
            exc,
            method=request.method,
            path=request.url.path,
            client_ip=client_ip,
            response_time_ms=response_time_ms,
        )
        raise


app.include_router(stylist_routes.router, prefix="/api", tags=["stylist"])
app.include_router(admin_routes.router, prefix="/api", tags=["admin"])
app.include_router(chat_routes.router, prefix="/api", tags=["chat"])
app.include_router(search_routes.router, prefix="/api", tags=["search"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
