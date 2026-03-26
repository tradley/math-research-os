import anthropic

from app.services.ai.providers.base import BaseAIProvider, AIResponse


class AnthropicProvider(BaseAIProvider):
    def __init__(self, client: anthropic.Anthropic, model: str, temperature: float = 0.2, max_tokens: int = 4096):
        self.client = client
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens

    def generate(self, system_prompt: str, user_prompt: str) -> AIResponse:
        response = self.client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            temperature=self.temperature,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
        text = "".join(
            block.text for block in response.content if getattr(block, "text", None)
        )
        usage = response.usage
        return AIResponse(
            text=text,
            model=response.model,
            prompt_tokens=usage.input_tokens if usage else 0,
            completion_tokens=usage.output_tokens if usage else 0,
        )
