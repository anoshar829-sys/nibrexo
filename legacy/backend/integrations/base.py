import os


class ProviderUnavailable(Exception):
    pass


class ProviderConfiguration:
    def __init__(self, name, required_env):
        self.name = name
        self.required_env = tuple(required_env)

    @property
    def configured(self):
        return all(os.environ.get(key) for key in self.required_env)

    def status(self):
        return {
            "name": self.name,
            "status": "not_configured" if not self.configured else "configuration_required",
            "configured": self.configured,
        }

    def require_configured(self):
        if not self.configured:
            raise ProviderUnavailable(f"{self.name} provider is not configured.")
