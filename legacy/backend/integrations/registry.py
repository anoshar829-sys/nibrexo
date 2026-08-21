from .ai import get_ai_provider
from .analytics import get_analytics_provider
from .crm import get_crm_provider
from .email import get_email_provider
from .newsletter import get_newsletter_provider
from payments import get_payment_provider
from storage import get_storage_provider


def provider_statuses():
    providers = [
        ("payment", get_payment_provider()),
        ("storage", get_storage_provider()),
        ("email", get_email_provider()),
        ("ai", get_ai_provider()),
        ("crm", get_crm_provider()),
        ("newsletter", get_newsletter_provider()),
        ("analytics", get_analytics_provider()),
    ]
    statuses = [{"id": "authentication", "name": "Authentication", "status": "connected", "configured": True}]
    for key, provider in providers:
        if hasattr(provider, "status"):
            status = provider.status()
        else:
            status = {"name": key.title(), "status": "configuration_required", "configured": False}
        status["id"] = key
        statuses.append(status)
    return statuses
