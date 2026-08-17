"""Refactored LLM service with modular prompt system.

Simplified logic, better maintainability, and clear separation of concerns.
"""

import collections
import logging
import random
import threading
import time
from typing import Any

import openai

from app.core.config import settings
from app.core.exceptions import LLMAnswerError, LLMTimeoutError
from app.services.prompts import PromptConfig, PromptTemplates
from app.services.prompts.validator import PromptValidator

logger = logging.getLogger(__name__)

MAX_LATENCY_SAMPLES = 10

_RUNTIME_LOCK = threading.Lock()
_RUNTIME_OVERRIDES: dict[str, Any] = {}

_RUNTIME_KEYS = {
    "mock_llm",
    "openai_api_key",
    "openai_base_url",
    "openai_model",
    "openai_temperature",
    "openai_max_tokens",
}


def _mask_secret(value: str) -> str:
    if not value:
        return ""
    if len(value) <= 8:
        return "*" * len(value)
    return f"{value[:3]}...{value[-3:]}"


def _build_runtime_config() -> tuple[dict[str, Any], dict[str, str]]:
    config: dict[str, Any] = {}
    source: dict[str, str] = {}

    with _RUNTIME_LOCK:
        for key in _RUNTIME_KEYS:
            if key in _RUNTIME_OVERRIDES:
                value = _RUNTIME_OVERRIDES[key]
                source[key] = "runtime"
            else:
                value = {
                    "mock_llm": settings.mock_llm,
                    "openai_api_key": settings.openai_api_key,
                    "openai_base_url": settings.openai_base_url,
                    "openai_model": settings.openai_model,
                    "openai_temperature": settings.openai_temperature,
                    "openai_max_tokens": settings.openai_max_tokens,
                }[key]
                source[key] = "env"

            config[key] = value

    return config, source


def get_llm_config(mask_secret: bool = True) -> dict[str, Any]:
    config, _ = _build_runtime_config()

    if mask_secret:
        config["openai_api_key"] = _mask_secret(config["openai_api_key"])

    return config


def get_llm_config_sources() -> dict[str, str]:
    _, source = _build_runtime_config()
    return source


def get_llm_config_with_source(mask_secret: bool = True) -> dict[str, Any]:
    return {
        "config": get_llm_config(mask_secret=mask_secret),
        "sources": get_llm_config_sources(),
    }


def set_llm_runtime_config(overrides: dict[str, Any]) -> None:
    """Set temporary runtime LLM config.

    Empty values are allowed to pass through (for example empty API key).
    Explicit `None` clears the override and falls back to environment values.
    """
    normalized: dict[str, Any] = {}

    for key in _RUNTIME_KEYS:
        if key not in overrides:
            continue

        value = overrides[key]
        if value is None:
            continue

        if key == "mock_llm":
            normalized[key] = bool(value)
            continue
        if key == "openai_temperature":
            normalized[key] = float(value)
            continue
        if key == "openai_max_tokens":
            normalized[key] = int(value)
            continue

        normalized[key] = str(value)

    with _RUNTIME_LOCK:
        for key in _RUNTIME_KEYS:
            if key not in overrides:
                continue

            if overrides[key] is None:
                _RUNTIME_OVERRIDES.pop(key, None)
            else:
                _RUNTIME_OVERRIDES[key] = normalized[key]


def clear_llm_runtime_config() -> None:
    with _RUNTIME_LOCK:
        _RUNTIME_OVERRIDES.clear()


class LLMService:
    """Refactored LLM service with modular prompt system."""

    def __init__(self):
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

    def _get_config(self) -> dict[str, Any]:
        config, _ = _build_runtime_config()
        return config

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

        config = self._get_config()

        # Build prompt configuration
        prompt_config = PromptConfig(
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
        if config["mock_llm"]:
            logger.warning("LLM mock mode enabled (MOCK_LLM=true).")
            return random.choice([yes_word, no_word])

        if config["openai_api_key"] in {"", "mock-key"}:
            return yes_word

        # Build prompt using template system
        forced_answer = random.choice([yes_word, no_word]) if god_identity == "Random" else None
        system_prompt = PromptTemplates.build_prompt(prompt_config, forced_answer)

        try:
            client = openai.OpenAI(
                api_key=config["openai_api_key"],
                base_url=config["openai_base_url"],
            )

            start_time = time.monotonic()
            response = client.chat.completions.create(
                model=config["openai_model"],
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_question},
                ],
                temperature=float(config["openai_temperature"]),
                max_tokens=int(config["openai_max_tokens"]),
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
        except openai.APIStatusError as e:
            message = str(e)
            if getattr(e, "status_code", None) == 404:
                message = (
                    f"LLM request failed (404): endpoint not found. "
                    f"Check OPENAI_BASE_URL={config['openai_base_url']}"
                )
            logger.error(f"LLM API error: {message}")
            raise LLMAnswerError(f"LLM execution failed: {message}")
        except Exception as e:
            logger.error(f"LLM error: {e}")
            raise LLMAnswerError(f"LLM execution failed: {str(e)}")


llm_service = LLMService()
