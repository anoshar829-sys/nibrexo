from .base import ProviderConfiguration, ProviderUnavailable


class CRMProvider(ProviderConfiguration):
    def __init__(self):
        super().__init__("CRM", ("CRM_PROVIDER", "CRM_API_KEY"))

    def create_or_update_contact(self, contact):
        self.require_configured()
        raise ProviderUnavailable("CRM provider adapter is not connected.")

    def add_tag(self, contact_reference, tag):
        self.require_configured()
        raise ProviderUnavailable("CRM provider adapter is not connected.")

    def record_event(self, contact_reference, event_type):
        self.require_configured()
        raise ProviderUnavailable("CRM provider adapter is not connected.")


def get_crm_provider():
    return CRMProvider()
