from app.services.ai.providers.base import BaseAIProvider, AIResponse


class StubProvider(BaseAIProvider):
    """Returns structured stub responses when no API keys are configured."""

    def generate(self, system_prompt: str, user_prompt: str) -> AIResponse:
        return AIResponse(
            text=(
                '{"claim": "stub", "justification": "No API key configured. '
                'Set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env to get real reasoning.", '
                '"confidence": 0, "gaps": ["API key not set"]}'
            ),
            model="stub",
            prompt_tokens=0,
            completion_tokens=0,
        )
