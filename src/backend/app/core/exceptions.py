from fastapi import HTTPException, status
class AppException(Exception):
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)
class TenantException(AppException):
    def __init__(self, message: str = "Tenant not found"):
        super().__init__(message, status.HTTP_404_NOT_FOUND)
class UnauthorizedException(AppException):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)
class ForbiddenException(AppException):
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, status.HTTP_403_FORBIDDEN)
class ValidationException(AppException):
    def __init__(self, message: str = "Validation error"):
        super().__init__(message, status.HTTP_422_UNPROCESSABLE_ENTITY)
class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status.HTTP_404_NOT_FOUND)
class ConflictException(AppException):
    def __init__(self, message: str = "Conflict"):
        super().__init__(message, status.HTTP_409_CONFLICT)
class InternalServerException(AppException):
    def __init__(self, message: str = "Internal server error"):
        super().__init__(message, status.HTTP_500_INTERNAL_SERVER_ERROR)