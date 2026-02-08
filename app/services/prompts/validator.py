"""
Prompt validator for testing and verification.
"""

import re
from typing import Optional, Tuple


class PromptValidator:
    """Validates LLM responses for the Three Gods game."""

    @staticmethod
    def extract_boxed_answer(response: str) -> Optional[str]:
        """
        Extract answer from \\boxed{...} format.
        Returns the last boxed answer found (in case of multiple).
        """
        matches = re.findall(r"\\boxed\{(.*?)\}", response)
        if not matches:
            return None
        return matches[-1].strip()

    @staticmethod
    def validate_answer(answer: str, yes_word: str, no_word: str) -> Tuple[bool, Optional[str]]:
        """
        Validate if answer is one of the valid words.

        Returns:
            (is_valid, normalized_answer)
        """
        if not answer:
            return False, None

        answer_lower = answer.lower()
        valid_words = {
            yes_word.lower(): yes_word,
            no_word.lower(): no_word,
            "unknown": "Unknown",
        }

        if answer_lower in valid_words:
            return True, valid_words[answer_lower]

        return False, None

    @staticmethod
    def validate_response(
        response: str, yes_word: str, no_word: str
    ) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Complete validation of LLM response.

        Returns:
            (is_valid, normalized_answer, error_message)
        """
        # Extract answer
        extracted = PromptValidator.extract_boxed_answer(response)
        if extracted is None:
            return False, None, "No \\boxed{} answer found in response"

        # Validate answer
        is_valid, normalized = PromptValidator.validate_answer(extracted, yes_word, no_word)
        if not is_valid:
            return (
                False,
                None,
                f"Invalid answer '{extracted}'. Expected {yes_word}, {no_word}, or Unknown",
            )

        return True, normalized, None
