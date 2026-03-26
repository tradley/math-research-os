import logging
import time

from app.core.config import settings
from app.services.ai.providers.base import BaseAIProvider, AIResponse

logger = logging.getLogger(__name__)


def get_ai_provider(provider_name: str | None = None) -> BaseAIProvider:
    """
    Instantiate the requested AI provider.
    Falls back to stub if the requested provider has no API key.
    """
    name = provider_name or settings.ai_provider

    if name == "openai" and settings.openai_api_key:
        from openai import OpenAI
        from app.services.ai.providers.openai_provider import OpenAIProvider
        client = OpenAI(api_key=settings.openai_api_key)
        return OpenAIProvider(client, settings.openai_model, settings.ai_temperature, settings.ai_max_tokens)

    elif name == "anthropic" and settings.anthropic_api_key:
        import anthropic
        from app.services.ai.providers.anthropic_provider import AnthropicProvider
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        return AnthropicProvider(client, settings.anthropic_model, settings.ai_temperature, settings.ai_max_tokens)

    else:
        from app.services.ai.providers.stub_provider import StubProvider
        logger.warning("No valid API key for provider '%s', using stub", name)
        return StubProvider()


def safe_generate(
    provider: BaseAIProvider,
    system_prompt: str,
    user_prompt: str,
    retries: int = 2,
) -> dict:
    """
    Call provider with retry + error capture.
    Returns {"ok": True, "response": AIResponse} or {"ok": False, "error": str}.
    """
    last_error = ""
    for attempt in range(retries + 1):
        try:
            start = time.time()
            result = provider.generate(system_prompt, user_prompt)
            latency_ms = int((time.time() - start) * 1000)
            return {"ok": True, "response": result, "latency_ms": latency_ms}
        except Exception as e:
            last_error = str(e)
            logger.warning("AI provider attempt %d failed: %s", attempt + 1, last_error)
            if attempt < retries:
                time.sleep(2 ** attempt)  # exponential backoff

    return {"ok": False, "error": last_error, "latency_ms": 0}
