from .base import ProviderConfiguration, ProviderUnavailable


class NewsletterProvider(ProviderConfiguration):
    def __init__(self):
        super().__init__("Newsletter", ("NEWSLETTER_PROVIDER", "NEWSLETTER_API_KEY"))

    def subscribe(self, email, consent):
        self.require_configured()
        if not consent:
            raise ValueError("Marketing consent is required for newsletter subscription.")
        raise ProviderUnavailable("Newsletter provider adapter is not connected.")

    def unsubscribe(self, provider_reference):
        self.require_configured()
        raise ProviderUnavailable("Newsletter provider adapter is not connected.")

    def subscription_status(self, email):
        self.require_configured()
        raise ProviderUnavailable("Newsletter provider adapter is not connected.")


def get_newsletter_provider():
    return NewsletterProvider()
