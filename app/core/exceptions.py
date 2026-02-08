"""
Custom exceptions for the Three Gods Riddle application.
Provides structured error handling with proper HTTP status codes.
"""

from typing import Any, Dict, Optional

from fastapi import HTTPException, status


class AppException(HTTPException):
    """Base exception for application-specific errors."""

    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: Optional[str] = None,
        headers: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code or self.__class__.__name__


# Authentication & Authorization Errors
class AuthenticationError(AppException):
    """Raised when authentication fails."""

    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class InvalidCredentialsError(AuthenticationError):
    """Raised when credentials are invalid."""

    def __init__(self):
        super().__init__(detail="Incorrect username or password")


class TokenExpiredError(AuthenticationError):
    """Raised when JWT token has expired."""

    def __init__(self):
        super().__init__(detail="Token has expired")


class AuthorizationError(AppException):
    """Raised when user lacks required permissions."""

    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class AdminRequiredError(AuthorizationError):
    """Raised when admin access is required."""

    def __init__(self):
        super().__init__(detail="Admin access required")


class AccountDisabledError(AuthorizationError):
    """Raised when user account is disabled."""

    def __init__(self):
        super().__init__(detail="User account is disabled")


class PasswordChangeRequiredError(AuthorizationError):
    """Raised when password must be changed before proceeding."""

    def __init__(self):
        super().__init__(detail="Must change password before continuing")


# Resource Errors
class ResourceNotFoundError(AppException):
    """Raised when a requested resource doesn't exist."""

    def __init__(self, resource: str, identifier: Any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} with id '{identifier}' not found",
        )


class ResourceAlreadyExistsError(AppException):
    """Raised when trying to create a resource that already exists."""

    def __init__(self, resource: str, identifier: Any):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{resource} with id '{identifier}' already exists",
        )


# Validation Errors
class ValidationError(AppException):
    """Raised when input validation fails."""

    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class InvalidPasswordError(ValidationError):
    """Raised when password doesn't meet requirements."""

    def __init__(self, detail: str = "Password does not meet requirements"):
        super().__init__(detail=detail)


class SamePasswordError(ValidationError):
    """Raised when new password is same as current."""

    def __init__(self):
        super().__init__(detail="New password must be different from current password")


# Game Logic Errors
class GameError(AppException):
    """Base exception for game-related errors."""

    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)


class GameSessionNotFoundError(ResourceNotFoundError):
    """Raised when game session doesn't exist."""

    def __init__(self, session_id: int):
        super().__init__(resource="Game session", identifier=session_id)


class GameAlreadyCompletedError(GameError):
    """Raised when trying to modify a completed game."""

    def __init__(self):
        super().__init__(detail="Game already completed")


class MaxQuestionsReachedError(GameError):
    """Raised when maximum questions limit is reached."""

    def __init__(self):
        super().__init__(detail="Maximum questions reached")


class UnauthorizedGameAccessError(AuthorizationError):
    """Raised when user tries to access another user's game."""

    def __init__(self):
        super().__init__(detail="Not authorized to access this game session")


class IncompleteGameError(GameError):
    """Raised when trying to view details of incomplete game."""

    def __init__(self):
        super().__init__(detail="Cannot view details of incomplete game")


# LLM Service Errors
class LLMError(AppException):
    """Base exception for LLM-related errors."""

    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail)


class LLMAnswerError(LLMError):
    """Raised when LLM fails to provide valid answer."""

    def __init__(self, detail: str = "LLM failed to provide a valid answer"):
        super().__init__(detail=detail)


class LLMTimeoutError(LLMError):
    """Raised when LLM request times out."""

    def __init__(self):
        super().__init__(detail="LLM request timed out")


class LLMConfigurationError(LLMError):
    """Raised when LLM is misconfigured."""

    def __init__(self, detail: str = "LLM service is not properly configured"):
        super().__init__(detail=detail)


# System Errors
class ConfigurationError(AppException):
    """Raised when system configuration is invalid."""

    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)


class DatabaseError(AppException):
    """Raised when database operation fails."""

    def __init__(self, detail: str = "Database operation failed"):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)
