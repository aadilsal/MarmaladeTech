class DomainError(Exception):
    pass


class NotFoundError(DomainError):
    pass


class PermissionError(DomainError):
    pass


class ConflictError(DomainError):
    pass


class ValidationError(DomainError):
    pass
