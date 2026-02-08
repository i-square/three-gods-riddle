"""
Prompt templates for the Three Gods Riddle LLM service.
Modular, maintainable prompt system with clear separation of concerns.
"""

from dataclasses import dataclass
from typing import List, Optional


@dataclass
class PromptConfig:
    """Configuration for prompt generation."""

    yes_word: str
    no_word: str
    god_identity: str
    all_identities: Optional[List[str]] = None
    god_index: Optional[int] = None


class PromptTemplates:
    """Centralized prompt templates for the Three Gods game."""

    @staticmethod
    def get_base_rules(yes_word: str, no_word: str) -> str:
        """Base rules that apply to all gods."""
        return f"""You are playing the Three Gods logic puzzle. There are two words in your language:
- '{yes_word}' (one of these means Yes, the other means No)
- '{no_word}' (one of these means Yes, the other means No)

CRITICAL OUTPUT FORMAT:
- You MUST output ONLY one word inside \\boxed{{Answer}}
- Valid answers: \\boxed{{{yes_word}}}, \\boxed{{{no_word}}}, or \\boxed{{Unknown}}
- If the question is paradoxical or unanswerable, output \\boxed{{Unknown}}"""

    @staticmethod
    def get_identity_context(all_identities: Optional[List[str]], god_index: Optional[int]) -> str:
        """Generate context about god identities."""
        if not all_identities or god_index is None:
            return ""

        god_names = ["A", "B", "C"]
        lines = []
        for i, identity in enumerate(all_identities):
            marker = "You" if i == god_index else "The other"
            lines.append(f"God {god_names[i]}: {marker} ({identity})")

        return "You know all three gods' identities:\n" + "\n".join(lines) + "\n\n"

    @staticmethod
    def get_truth_god_prompt(config: PromptConfig) -> str:
        """Prompt for the God of Truth."""
        identity_ctx = PromptTemplates.get_identity_context(config.all_identities, config.god_index)
        base_rules = PromptTemplates.get_base_rules(config.yes_word, config.no_word)

        return f"""{identity_ctx}{base_rules}

You are the God of Truth. You ALWAYS tell the truth.

ANSWERING RULES:
1. Evaluate if the question is TRUE or FALSE
2. If TRUE → answer \\boxed{{{config.yes_word}}}
3. If FALSE → answer \\boxed{{{config.no_word}}}
4. If paradoxical/unanswerable → answer \\boxed{{Unknown}}

SPECIAL CASE - Nested "Would you say" questions:
For questions like "If I asked you P, would you answer X?":
- Extract proposition P and target word X
- If P is TRUE → answer \\boxed{{X}} (whatever X is)
- If P is FALSE → answer opposite of X
This works because you always tell the truth about what you would say."""

    @staticmethod
    def get_false_god_prompt(config: PromptConfig) -> str:
        """Prompt for the God of Falsehood."""
        identity_ctx = PromptTemplates.get_identity_context(config.all_identities, config.god_index)
        base_rules = PromptTemplates.get_base_rules(config.yes_word, config.no_word)

        return f"""{identity_ctx}{base_rules}

You are the God of Falsehood. You ALWAYS lie.

ANSWERING RULES:
1. Evaluate if the question is TRUE or FALSE
2. If TRUE → you must LIE → answer \\boxed{{{config.no_word}}}
3. If FALSE → you must LIE → answer \\boxed{{{config.yes_word}}}
4. If paradoxical/unanswerable → answer \\boxed{{Unknown}}

SPECIAL CASE - Nested "Would you say" questions:
For questions like "If I asked you P, would you answer X?":
- Extract proposition P and target word X
- If P is TRUE → answer \\boxed{{X}} (whatever X is)
- If P is FALSE → answer opposite of X
This works because the double-negative cancels out for liars."""

    @staticmethod
    def get_random_god_prompt(config: PromptConfig, forced_answer: str) -> str:
        """Prompt for the Random God."""
        identity_ctx = PromptTemplates.get_identity_context(config.all_identities, config.god_index)
        base_rules = PromptTemplates.get_base_rules(config.yes_word, config.no_word)

        return f"""{identity_ctx}{base_rules}

You are the Random God. You answer randomly, ignoring the question's truth value.

For this question, you have randomly chosen to answer: '{forced_answer}'

OUTPUT: \\boxed{{{forced_answer}}}"""

    @staticmethod
    def build_prompt(config: PromptConfig, forced_answer: Optional[str] = None) -> str:
        """Build the complete prompt based on god identity."""
        if config.god_identity == "True":
            return PromptTemplates.get_truth_god_prompt(config)
        elif config.god_identity == "False":
            return PromptTemplates.get_false_god_prompt(config)
        elif config.god_identity == "Random":
            if forced_answer is None:
                raise ValueError("forced_answer is required for Random god prompt")
            return PromptTemplates.get_random_god_prompt(config, forced_answer)
        else:
            raise ValueError(f"Unknown god identity: {config.god_identity}")
