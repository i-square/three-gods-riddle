"""
Refactored LLM service with modular prompt system.
Simplified logic, better maintainability, and clear separation of concerns.
"""

import collections
import logging
import random
import time

import openai

from app.core.config import settings
from app.core.exceptions import LLMAnswerError, LLMTimeoutError
from app.services.prompts import PromptConfig, PromptTemplates
from app.services.prompts.validator import PromptValidator

logger = logging.getLogger(__name__)

MAX_LATENCY_SAMPLES = 10


class LLMService:
    """Refactored LLM service with modular prompt system."""

    def __init__(self):
        self.client = openai.OpenAI(
            api_key=settings.openai_api_key, base_url=settings.openai_base_url
        )
        self.model = settings.openai_model
        self.temperature = settings.openai_temperature
        self.max_tokens = settings.openai_max_tokens
        self._latency_window: collections.deque[float] = collections.deque(
            maxlen=MAX_LATENCY_SAMPLES
        )

    @property
    def avg_latency(self) -> float | None:
        if len(self._latency_window) < 3:
            return None
        return sum(self._latency_window) / len(self._latency_window)

    def get_simulated_delay(self) -> float:
        avg = self.avg_latency
        if avg is not None:
            jitter = random.uniform(-avg * 0.3, avg * 0.3)
            return max(0.5, avg + jitter)
        return random.uniform(1.0, 5.0)

    def ask_god(
        self,
        god_identity: str,
        language_map: dict[str, str],
        user_question: str,
        all_identities: list[str] | None = None,
        god_index: int | None = None,
    ) -> str:
        """
        Ask a god a question and get their answer.

        Args:
            god_identity: Type of god ("True", "False", or "Random")
            language_map: Mapping of Yes/No to Ja/Da
            user_question: The question to ask
            all_identities: List of all three gods' identities (optional)
            god_index: Index of this god in the list (optional)

        Returns:
            The god's answer (yes_word, no_word, or "Unknown")

        Raises:
            LLMAnswerError: If LLM fails to provide valid answer
        """
        yes_word = language_map["Yes"]
        no_word = language_map["No"]

        # Build prompt configuration
        config = PromptConfig(
            yes_word=yes_word,
            no_word=no_word,
            god_identity=god_identity,
            all_identities=all_identities,
            god_index=god_index,
        )

        # Handle Random god specially (no LLM needed)
        if god_identity == "Random":
            return random.choice([yes_word, no_word])

        # Test/development fallback to keep local and CI runs deterministic.
        if settings.openai_api_key in {"", "mock-key"}:
            return yes_word

        # Build prompt using template system
        forced_answer = random.choice([yes_word, no_word]) if god_identity == "Random" else None
        system_prompt = PromptTemplates.build_prompt(config, forced_answer)

        try:
            start_time = time.monotonic()
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_question},
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens,
            )
            elapsed = time.monotonic() - start_time
            self._latency_window.append(elapsed)

            content_raw = response.choices[0].message.content
            if not isinstance(content_raw, str):
                raise LLMAnswerError("LLM returned empty content")
            content = content_raw.strip()

            if settings.debug:
                logger.info(f"[DEBUG] God Identity: {god_identity}")
                logger.info(f"[DEBUG] User Question: {user_question}")
                logger.info(f"[DEBUG] System Prompt: {system_prompt}")
                logger.info(f"[DEBUG] LLM Raw Response: {content}")
                logger.info(f"[DEBUG] Language Map: Yes={yes_word}, No={no_word}")

            logger.info(f"Question: {user_question}")
            logger.info(f"LLM response: {content}")

            # Validate response
            is_valid, normalized, error_msg = PromptValidator.validate_response(
                content, yes_word, no_word
            )

            if not is_valid or normalized is None:
                detail = (
                    error_msg
                    if isinstance(error_msg, str) and error_msg
                    else "LLM returned invalid answer"
                )
                logger.error(f"Validation failed: {detail}")
                raise LLMAnswerError(detail)

            assert normalized is not None
            if normalized == "Unknown":
                logger.warning("LLM normalized answer is Unknown")
            return normalized

        except LLMAnswerError:
            raise
        except openai.APITimeoutError as e:
            logger.error(f"LLM timeout: {e}")
            raise LLMTimeoutError()
        except Exception as e:
            logger.error(f"LLM error: {e}")
            raise LLMAnswerError(f"LLM execution failed: {str(e)}")


llm_service = LLMService()
