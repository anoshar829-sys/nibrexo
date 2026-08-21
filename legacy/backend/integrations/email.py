from .base import ProviderConfiguration, ProviderUnavailable


class EmailProvider(ProviderConfiguration):
    def __init__(self):
        super().__init__("Email", ("EMAIL_PROVIDER", "EMAIL_API_KEY", "EMAIL_FROM"))

    def send_email(self, event_type, recipient, template, context):
        self.require_configured()
        # Provider-specific delivery belongs in a configured adapter.
        # No provider is selected in the current implementation.
        raise ProviderUnavailable("Email provider adapter is not connected.")


def get_email_provider():
    return EmailProvider()
