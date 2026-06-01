"""Custom exceptions for ALT-AI."""


class AffectLogError(Exception):
    """Base exception for ALT-AI."""


class SchemaValidationError(AffectLogError):
    """Input data does not match the expected schema."""


class RecipeNotFoundError(AffectLogError):
    """Named recipe cannot be located."""


class RecipeConfigError(AffectLogError):
    """Recipe YAML is malformed or missing required fields."""


class ModelAdapterError(AffectLogError):
    """Model adapter cannot load or run the given model."""


class PrivacyConfigError(AffectLogError):
    """Privacy configuration is invalid or insecure."""


class IngestError(AffectLogError):
    """File cannot be ingested (missing, corrupt, wrong format)."""


class TransformError(AffectLogError):
    """Transformation step failed."""


class ComplianceExportError(AffectLogError):
    """Compliance export step failed."""


class PDCError(AffectLogError):
    """PDC / Prometheus-X connector error."""


class RunNotFoundError(AffectLogError):
    """Run directory or manifest cannot be found."""
