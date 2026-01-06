import random
import json
from sqlmodel import Session
from app.models import GameSession
from app.services.llm_service import llm_service

class GameEngine:
    GOD_TYPES = ["True", "False", "Random"]

    def start_new_game(self, user_id: str, db: Session) -> GameSession:
        # 1. Shuffle Identities
        identities = self.GOD_TYPES.copy()
        random.shuffle(identities)
        
        # 2. Randomize Language
        # Randomly assign Ja/Da to Yes/No
        words = ["Ja", "Da"]
        random.shuffle(words)
        language_map = {"Yes": words[0], "No": words[1]}
        
        session = GameSession(
            user_id=user_id,
            god_identities=json.dumps(identities),
            language_map=json.dumps(language_map),
            move_history=json.dumps([]),
            current_question_count=0
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def process_question(self, session: GameSession, god_index: int, question: str, db: Session) -> str:
        if session.current_question_count >= 3:
            raise ValueError("Max questions reached")
            
        identities = json.loads(session.god_identities)
        language_map = json.loads(session.language_map)
        target_god = identities[god_index] # 0, 1, or 2
        
        answer = ""
        
        # Random God Logic: Pure randomness, no LLM cost
        if target_god == "Random":
            answer = random.choice(["Ja", "Da"])
        else:
            # True / False God Logic: Use LLM
            answer = llm_service.ask_god(target_god, language_map, question)
        
        # Update History
        history = json.loads(session.move_history)
        history.append({
            "round": session.current_question_count + 1,
            "god_index": god_index,
            "question": question,
            "answer": answer
        })
        
        session.move_history = json.dumps(history)
        session.current_question_count += 1
        db.add(session)
        db.commit()
        db.refresh(session)
        
        return answer

    def submit_guess(self, session: GameSession, user_guess: list[str], db: Session) -> bool:
        """
        user_guess: ["True", "Random", "False"] (order corresponding to God 0, 1, 2)
        """
        actual_identities = json.loads(session.god_identities)
        
        is_correct = (user_guess == actual_identities)
        
        session.is_completed = True
        session.is_win = is_correct
        db.add(session)
        db.commit()
        
        return is_correct

game_engine = GameEngine()
