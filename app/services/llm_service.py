import openai
from app.core.config import settings
import random

class LLMService:
    def __init__(self):
        self.client = openai.OpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url
        )
        self.model = settings.openai_model
        self.temperature = settings.openai_temperature

    def ask_god(self, god_identity: str, language_map: dict, user_question: str) -> str:
        """
        Interacts with the LLM to get an answer ('Ja' or 'Da') based on the god's identity.
        Only 'True' and 'False' gods use this. 'Random' is handled separately.
        """
        
        # language_map example: {'Yes': 'Ja', 'No': 'Da'}
        yes_word = language_map.get('Yes')
        no_word = language_map.get('No')
        
        system_prompt = ""
        
        base_rule = (
            f"You are playing a logic puzzle. There are two words in your language: '{yes_word}' and '{no_word}'. "
            f"One means 'Yes' and the other means 'No', but the user does not know which is which. "
            f"You must strictly output ONLY the word '{yes_word}' or '{no_word}'."
        )

        if god_identity == "True":
            system_prompt = (
                f"{base_rule} You are the God of Truth. You ALWAYS speak the truth. "
                f"Analyze the user's question logically. Determine if the truthful answer is Yes or No, "
                f"then map it to your language ('{yes_word}' or '{no_word}') and output it."
            )
        elif god_identity == "False":
            system_prompt = (
                f"{base_rule} You are the God of Falsehood. You ALWAYS lie. "
                f"Analyze the user's question logically. Determine the truthful answer, "
                f"then flip it to the false answer. Finally, map the false answer to your language ('{yes_word}' or '{no_word}') and output it."
            )
        else:
            # Fallback, though Random shouldn't hit this function ideally
            return random.choice([yes_word, no_word])

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_question}
                ],
                temperature=self.temperature,
                max_tokens=10
            )
            content = response.choices[0].message.content.strip()
            
            # Post-processing cleanup to ensure only Ja/Da
            valid_words = [yes_word.lower(), no_word.lower()]
            if content.lower() not in valid_words:
                 # If LLM hallucinates, fallback to strict logic logic if possible or error
                 # For robustness, we might just return random or retry. 
                 # Here we try to find the word in the string.
                 if yes_word.lower() in content.lower(): return yes_word
                 if no_word.lower() in content.lower(): return no_word
                 return random.choice([yes_word, no_word]) # Last resort
            
            return content
        except Exception as e:
            print(f"LLM Error: {e}")
            return random.choice([yes_word, no_word]) # Graceful degradation

llm_service = LLMService()
