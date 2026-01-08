import openai
from app.core.config import settings
import random
import logging
import re


class LLMAnswerError(Exception):
    pass


class LLMService:
    def __init__(self):
        self.client = openai.OpenAI(
            api_key=settings.openai_api_key, base_url=settings.openai_base_url
        )
        self.model = settings.openai_model
        self.temperature = settings.openai_temperature
        self.max_tokens = settings.openai_max_tokens

    def ask_god(
        self,
        god_identity: str,
        language_map: dict,
        user_question: str,
        all_identities: list[str] | None = None,
        god_index: int | None = None,
    ) -> str:
        yes_word = language_map["Yes"]
        no_word = language_map["No"]

        identity_context = ""
        if all_identities and god_index is not None:
            god_names = ["A", "B", "C"]
            identity_lines = []
            for i, identity in enumerate(all_identities):
                if i == god_index:
                    identity_lines.append(
                        f"God {god_names[i]}: You (the {identity} god)"
                    )
                else:
                    identity_lines.append(f"God {god_names[i]}: The {identity} god")
            identity_context = (
                "You know the true identities of all three gods:\n"
                + "\n".join(identity_lines)
                + "\n\n"
            )

        system_prompt = ""

        base_rule = (
            f"You are playing a logic puzzle. There are two words in your language: '{yes_word}' and '{no_word}'. "
            f"One means 'Yes' and the other means 'No'.\n"
            f"You must strictly output ONLY the word '{yes_word}' or '{no_word}' inside a LaTeX box like \\boxed{{Answer}}.\n"
            f"If the question leads to a contradiction, paradox, or cannot be answered with '{yes_word}' or '{no_word}' "
            f"consistent with your identity (e.g. asking the God of Truth to lie), you MUST output \\boxed{{Unknown}}."
        )

        universal_shortcut = (
            f"CRITICAL: Nested 'Would You Say X' Questions - MANDATORY SHORTCUT:\n"
            f"For questions like 'If I asked you P, would you answer X?' or 'Would you say X to the question P?':\n\n"
            f"THIS IS A MATHEMATICAL IDENTITY - DO NOT REASON ABOUT WHAT X MEANS:\n"
            f"1. Extract the inner proposition P (the hypothetical question being asked).\n"
            f"2. Extract the target word X ('{yes_word}' or '{no_word}').\n"
            f"3. Evaluate ONLY whether P is factually TRUE or FALSE.\n"
            f"4. OUTPUT RULE (applies to BOTH Truth and Falsehood gods):\n"
            f"   - If P is TRUE → Output \\boxed{{{yes_word}}} if X='{yes_word}', or \\boxed{{{no_word}}} if X='{no_word}'\n"
            f"   - Simply put: P is TRUE → Output X directly. P is FALSE → Output the opposite of X.\n\n"
            f"IMPORTANT: Do NOT think about what '{yes_word}' or '{no_word}' means (Yes/No). "
            f"Do NOT consider whether answering X would be 'lying' or 'truthful'. "
            f"This shortcut exists because the double-negation in nested questions cancels out for liars. "
            f"Just apply the rule mechanically: TRUE P → answer X, FALSE P → answer opposite of X."
        )

        if god_identity == "True":
            system_prompt = (
                f"{identity_context}"
                f"{base_rule} You are the God of Truth. You ALWAYS speak the truth.\n\n"
                f"{universal_shortcut}\n\n"
                f"For simple (non-nested) questions:\n"
                f"1. Evaluate the truth of the question.\n"
                f"2. If True, output \\boxed{{{language_map['Yes']}}}.\n"
                f"3. If False, output \\boxed{{{language_map['No']}}}.\n"
                f"4. If unanswerable/paradox, output \\boxed{{Unknown}}."
            )
        elif god_identity == "False":
            system_prompt = (
                f"{identity_context}"
                f"{base_rule} You are the God of Falsehood. You ALWAYS lie.\n\n"
                f"{universal_shortcut}\n\n"
                f"For simple (non-nested) questions:\n"
                f"1. Evaluate the truth of the question.\n"
                f"2. If True, you MUST lie: Output \\boxed{{{language_map['No']}}}.\n"
                f"3. If False, you MUST lie: Output \\boxed{{{language_map['Yes']}}}.\n"
                f"4. If unanswerable/paradox, output \\boxed{{Unknown}}."
            )
        elif god_identity == "Random":
            # Pre-decide the answer to ensure true randomness, but use LLM to simulate latency/style
            # Random God also can say Unknown if strictly forced by the prompt logic, but usually just random Yes/No.
            # However, for consistency with 'boxed' requirement:
            forced_answer = random.choice([yes_word, no_word])
            system_prompt = (
                f"{identity_context}"
                f"{base_rule} You are the Random God. "
                f"You have chosen to answer '{forced_answer}' this time. "
                f"Output ONLY \\boxed{{{forced_answer}}}."
            )
        else:
            # Fallback
            return random.choice([yes_word, no_word])

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_question},
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens,
            )
            content = response.choices[0].message.content.strip()

            logging.info(f"user_question: {user_question} LLM response:\n{content}")

            # Extract answer from \boxed{...} searching from right to left
            matches = re.findall(r"\\boxed\{(.*?)\}", content)
            if not matches:
                logging.error("No \\boxed{} answer found in LLM response.")
                raise LLMAnswerError("No answer found")

            # Get the last match
            extracted_answer = matches[-1].strip()

            # Validation
            valid_words = [yes_word.lower(), no_word.lower(), "unknown"]
            if extracted_answer.lower() not in valid_words:
                logging.error(f"Invalid answer extracted: {extracted_answer}")
                # Try to recover if it's close? Or just fail.
                # Strict requirement says "if no, ... error".
                raise LLMAnswerError(f"Invalid answer: {extracted_answer}")

            # Return with correct casing if it's Yes/No
            if extracted_answer.lower() == yes_word.lower():
                return yes_word
            elif extracted_answer.lower() == no_word.lower():
                return no_word
            else:
                return "Unknown"

        except LLMAnswerError:
            raise
        except Exception as e:
            logging.error(f"LLM Error: {e}")
            raise LLMAnswerError(f"LLM execution failed: {str(e)}")


llm_service = LLMService()
