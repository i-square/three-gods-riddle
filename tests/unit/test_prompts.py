"""
Unit tests for prompt templates and validation.
"""

from app.services.prompts import PromptTemplates, PromptConfig
from app.services.prompts.validator import PromptValidator


class TestPromptValidator:
    """Test prompt validation logic."""

    def test_extract_boxed_answer(self):
        """Test extracting answer from boxed format."""
        response = "Some text \\boxed{Ja} more text"
        result = PromptValidator.extract_boxed_answer(response)
        assert result == "Ja"

    def test_extract_last_boxed_answer(self):
        """Test extracting last answer when multiple boxes."""
        response = "First \\boxed{Ja} second \\boxed{Da}"
        result = PromptValidator.extract_boxed_answer(response)
        assert result == "Da"

    def test_no_boxed_answer(self):
        """Test handling response without boxed answer."""
        response = "No boxed answer here"
        result = PromptValidator.extract_boxed_answer(response)
        assert result is None

    def test_validate_answer_yes(self):
        """Test validating yes answer."""
        is_valid, normalized = PromptValidator.validate_answer("Ja", "Ja", "Da")
        assert is_valid is True
        assert normalized == "Ja"

    def test_validate_answer_no(self):
        """Test validating no answer."""
        is_valid, normalized = PromptValidator.validate_answer("Da", "Ja", "Da")
        assert is_valid is True
        assert normalized == "Da"

    def test_validate_answer_unknown(self):
        """Test validating unknown answer."""
        is_valid, normalized = PromptValidator.validate_answer("Unknown", "Ja", "Da")
        assert is_valid is True
        assert normalized == "Unknown"

    def test_validate_answer_invalid(self):
        """Test validating invalid answer."""
        is_valid, normalized = PromptValidator.validate_answer("Invalid", "Ja", "Da")
        assert is_valid is False
        assert normalized is None


class TestPromptTemplates:
    """Test prompt template generation."""

    def test_build_truth_god_prompt(self):
        """Test building prompt for Truth god."""
        config = PromptConfig(
            yes_word="Ja", no_word="Da", god_identity="True"
        )
        prompt = PromptTemplates.build_prompt(config)
        assert "God of Truth" in prompt
        assert "Ja" in prompt
        assert "Da" in prompt

    def test_build_false_god_prompt(self):
        """Test building prompt for False god."""
        config = PromptConfig(
            yes_word="Ja", no_word="Da", god_identity="False"
        )
        prompt = PromptTemplates.build_prompt(config)
        assert "God of Falsehood" in prompt
        assert "ALWAYS lie" in prompt

    def test_build_random_god_prompt(self):
        """Test building prompt for Random god."""
        config = PromptConfig(
            yes_word="Ja", no_word="Da", god_identity="Random"
        )
        prompt = PromptTemplates.build_prompt(config, forced_answer="Ja")
        assert "Random God" in prompt
        assert "Ja" in prompt
