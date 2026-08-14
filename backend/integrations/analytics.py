from .base import ProviderConfiguration, ProviderUnavailable


class AnalyticsProvider(ProviderConfiguration):
    def __init__(self):
        super().__init__("Analytics", ("ANALYTICS_PROVIDER", "ANALYTICS_KEY"))

    def track(self, event_type, payload):
        self.require_configured()
        raise ProviderUnavailable("Analytics provider adapter is not connected.")


def get_analytics_provider():
    return AnalyticsProvider()
