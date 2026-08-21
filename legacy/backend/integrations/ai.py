from .base import ProviderConfiguration, ProviderUnavailable


class AIProvider(ProviderConfiguration):
    def __init__(self):
        super().__init__("AI", ("AI_PROVIDER", "AI_API_KEY", "AI_MODEL"))

    def respond(self, instructions, prompt, *, max_input_chars=12000):
        self.require_configured()
        if len(prompt or "") > max_input_chars:
            raise ValueError("AI request exceeds the configured input limit.")
        # No provider implementation or secret is present in this foundation.
        raise ProviderUnavailable("AI provider adapter is not connected.")


def get_ai_provider():
    return AIProvider()
