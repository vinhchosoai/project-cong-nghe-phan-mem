from typing import Optional, Any


class ApplicationException(Exception):
    """Base exception for application"""
    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_code: str = "INTERNAL_ERROR",
        details: Optional[Any] = None
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationException(ApplicationException):
    """Validation error"""
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            status_code=422,
            error_code="VALIDATION_ERROR",
            details=details
        )


class BusinessLogicException(ApplicationException):
    """Business logic error"""
    def __init__(self, message: str, status_code: int = 400, details: Optional[Any] = None):
        super().__init__(
            message=message,
            status_code=status_code,
            error_code="BUSINESS_LOGIC_ERROR",
            details=details
        )


class ResourceNotFoundException(ApplicationException):
    """Resource not found"""
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            status_code=404,
            error_code="NOT_FOUND",
            details=details
        )


class UnauthorizedException(ApplicationException):
    """Unauthorized access"""
    def __init__(self, message: str = "Unauthorized", details: Optional[Any] = None):
        super().__init__(
            message=message,
            status_code=401,
            error_code="UNAUTHORIZED",
            details=details
        )


class ForbiddenException(ApplicationException):
    """Forbidden access"""
    def __init__(self, message: str = "Forbidden", details: Optional[Any] = None):
        super().__init__(
            message=message,
            status_code=403,
            error_code="FORBIDDEN",
            details=details
        )


class TenantException(ApplicationException):
    """Tenant-related error"""
    def __init__(self, message: str, status_code: int = 400, details: Optional[Any] = None):
        super().__init__(
            message=message,
            status_code=status_code,
            error_code="TENANT_ERROR",
            details=details
        )
