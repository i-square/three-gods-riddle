"""
Health check endpoints for monitoring and orchestration.
"""

import sys
from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter, status
from pydantic import BaseModel

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str
    timestamp: str
    version: str
    python_version: str


class ReadinessResponse(BaseModel):
    """Readiness check response model."""

    status: str
    timestamp: str
    checks: Dict[str, Any]


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health Check",
    description="Basic health check endpoint for container orchestration",
)
async def health_check():
    """
    Basic health check endpoint.
    Returns 200 if the service is running.
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat() + "Z",
        version="1.0.0",
        python_version=f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
    )


@router.get(
    "/readiness",
    response_model=ReadinessResponse,
    status_code=status.HTTP_200_OK,
    summary="Readiness Check",
    description="Detailed readiness check including dependencies",
)
async def readiness_check():
    """
    Readiness check endpoint.
    Verifies that the service and its dependencies are ready to serve traffic.
    """
    checks = {}

    # Check database
    try:
        from sqlmodel import Session, text

        from app.models import engine

        with Session(engine) as session:
            session.exec(text("SELECT 1"))
        checks["database"] = {"status": "healthy", "message": "Database connection OK"}
    except Exception as e:
        checks["database"] = {"status": "unhealthy", "message": str(e)}

    # Check LLM configuration
    try:
        from app.core.config import settings

        if settings.openai_api_key and settings.openai_api_key != "mock-key":
            checks["llm"] = {
                "status": "healthy",
                "message": "LLM configuration present",
            }
        else:
            checks["llm"] = {
                "status": "warning",
                "message": "LLM API key not configured",
            }
    except Exception as e:
        checks["llm"] = {"status": "unhealthy", "message": str(e)}

    # Determine overall status
    overall_status = "ready"
    if any(check["status"] == "unhealthy" for check in checks.values()):
        overall_status = "not_ready"
    elif any(check["status"] == "warning" for check in checks.values()):
        overall_status = "degraded"

    return ReadinessResponse(
        status=overall_status,
        timestamp=datetime.utcnow().isoformat() + "Z",
        checks=checks,
    )
