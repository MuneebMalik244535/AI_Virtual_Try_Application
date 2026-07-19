"""
Global FastAPI exception handlers.

Ensures clients always receive safe JSON error bodies — never stack traces
or internal exception details.
"""

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.errors import USER_MESSAGES, get_user_message, log_exception
from app.core.exceptions import AppError
from app.logging.structured_logger import logger


async def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
    log_exception(logger, "app_error", exc)
    return JSONResponse(
        status_code=400,
        content={"success": False, "message": get_user_message(exc)},
    )


async def validation_error_handler(
    _request: Request, exc: RequestValidationError
) -> JSONResponse:
    logger.warning(
        "Request validation failed",
        event_type="validation_error",
        errors=exc.errors(),
    )
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": USER_MESSAGES["invalid_input"],
        },
    )


async def http_exception_handler(
    _request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    logger.warning(
        "HTTP exception",
        event_type="http_error",
        status_code=exc.status_code,
        detail=str(exc.detail),
    )
    detail = exc.detail
    if isinstance(detail, dict):
        message = detail.get("message", USER_MESSAGES["generic"])
    elif isinstance(detail, str):
        message = detail
    else:
        message = USER_MESSAGES["generic"]

    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": message},
    )


async def unhandled_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
    log_exception(logger, "unhandled_error", exc)
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": USER_MESSAGES["generic"]},
    )
