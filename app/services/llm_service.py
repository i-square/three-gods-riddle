import openai
from app.core.config import settings
import random


class LLMService:
    def __init__(self):
        self.client = openai.OpenAI(
            api_key=settings.openai_api_key, base_url=settings.openai_base_url
        )
        self.model = settings.openai_model
        self.temperature = settings.openai_temperature

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
            f"You must strictly output ONLY the word '{yes_word}' or '{no_word}'."
        )

        universal_shortcut = (
            f"CRITICAL OVERRIDE for Nested 'Would You Say' Questions:\n"
            f"If the user asks a question like 'If I asked you P, would you answer X?':\n"
            f"1. Identify the inner proposition P.\n"
            f"2. Identify the target word X (which is either '{yes_word}' or '{no_word}').\n"
            f"3. Determine if P is factually TRUE.\n"
            f"   - If P is factually TRUE -> You MUST output X.\n"
            f"   - If P is factually FALSE -> You MUST output the other word (not X).\n"
            f"Apply this logic REGARDLESS of whether you are the God of Truth or Falsehood. It is a logical universal constant."
        )

        if god_identity == "True":
            system_prompt = (
                f"{identity_context}"
                f"{base_rule} You are the God of Truth. You ALWAYS speak the truth.\n\n"
                f"{universal_shortcut}\n\n"
                f"For simple (non-nested) questions:\n"
                f"1. Evaluate the truth of the question.\n"
                f"2. If True, output the word for 'Yes'.\n"
                f"3. If False, output the word for 'No'."
            )
        elif god_identity == "False":
            system_prompt = (
                f"{identity_context}"
                f"{base_rule} You are the God of Falsehood. You ALWAYS lie.\n\n"
                f"{universal_shortcut}\n\n"
                f"For simple (non-nested) questions:\n"
                f"1. Evaluate the truth of the question.\n"
                f"2. If True, you MUST lie: Output the word for 'No'.\n"
                f"3. If False, you MUST lie: Output the word for 'Yes'."
            )
        elif god_identity == "Random":
            # Pre-decide the answer to ensure true randomness, but use LLM to simulate latency/style
            forced_answer = random.choice([yes_word, no_word])
            system_prompt = (
                f"{identity_context}"
                f"{base_rule} You are the Random God. "
                f"You have chosen to answer '{forced_answer}' this time. "
                f"Output ONLY '{forced_answer}'."
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
                max_tokens=10,
            )
            content = response.choices[0].message.content.strip()

            # Post-processing cleanup to ensure only Ja/Da
            valid_words = [yes_word.lower(), no_word.lower()]
            if content.lower() not in valid_words:
                # If LLM hallucinates, fallback to strict logic logic if possible or error
                # For robustness, we might just return random or retry.
                # Here we try to find the word in the string.
                if yes_word.lower() in content.lower():
                    return yes_word
                if no_word.lower() in content.lower():
                    return no_word
                return random.choice([yes_word, no_word])  # Last resort

            return content
        except Exception as e:
            print(f"LLM Error: {e}")
            return random.choice([yes_word, no_word])  # Graceful degradation


llm_service = LLMService()
