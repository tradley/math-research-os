from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class AIResponse:
    """Standardized response from any AI provider."""
    text: str
    model: str
    prompt_tokens: int = 0
    completion_tokens: int = 0


class BaseAIProvider(ABC):
    @abstractmethod
    def generate(self, system_prompt: str, user_prompt: str) -> AIResponse:
        raise NotImplementedError
