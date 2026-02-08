import json
import logging
import random

from sqlmodel import Session

from app.core.exceptions import LLMAnswerError
from app.models import GameSession
from app.services.llm_service import llm_service


logger = logging.getLogger(__name__)


class GameEngine:
    GOD_TYPES = ["True", "False", "Random"]
    MAX_UNKNOWN_RETRIES = 2

    def start_new_game(self, user_id: str, db: Session) -> GameSession:
        identities = self.GOD_TYPES.copy()
        random.shuffle(identities)

        words = ["Ja", "Da"]
        random.shuffle(words)
        language_map = {"Yes": words[0], "No": words[1]}

        session = GameSession(
            user_id=user_id,
            god_identities=json.dumps(identities),
            language_map=json.dumps(language_map),
            move_history=json.dumps([]),
            current_question_count=0,
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def process_question(
        self, session: GameSession, god_index: int, question: str, db: Session
    ) -> dict[str, object]:
        if session.current_question_count >= 3:
            raise ValueError("Max questions reached")

        identities = json.loads(session.god_identities)
        language_map = json.loads(session.language_map)
        target_god = identities[god_index]

        simulated_delay: float | None = None

        if target_god == "Random":
            simulated_delay = llm_service.get_simulated_delay()

        try:
            answer = "Unknown"
            max_attempts = self.MAX_UNKNOWN_RETRIES + 1
            for attempt in range(max_attempts):
                answer = llm_service.ask_god(
                    target_god,
                    language_map,
                    question,
                    all_identities=identities,
                    god_index=god_index,
                )
                if answer != "Unknown":
                    logger.info(
                        "Resolved answer on attempt %s/%s for god_index=%s",
                        attempt + 1,
                        max_attempts,
                        god_index,
                    )
                    break
                logger.warning(
                    "Received Unknown on attempt %s/%s for god_index=%s; retrying",
                    attempt + 1,
                    max_attempts,
                    god_index,
                )
        except LLMAnswerError:
            raise ValueError(
                "The God seems to be daydreaming and didn't give a clear answer. Please rephrase your question or try again!"
            )

        history = json.loads(session.move_history)
        round_number = len(history) + 1

        if answer == "Unknown":
            logger.warning(
                "Answer remains Unknown after %s attempts for god_index=%s; masking this round without consuming question count",
                self.MAX_UNKNOWN_RETRIES + 1,
                god_index,
            )
            history.append(
                {
                    "round": round_number,
                    "god_index": god_index,
                    "question": question,
                    "answer": answer,
                    "is_masked": True,
                }
            )
            session.move_history = json.dumps(history)
            db.add(session)
            db.commit()
            db.refresh(session)
            return {
                "answer": answer,
                "history": history,
                "simulated_delay": simulated_delay,
            }

        history.append(
            {
                "round": round_number,
                "god_index": god_index,
                "question": question,
                "answer": answer,
                "is_masked": False,
            }
        )

        session.move_history = json.dumps(history)
        session.current_question_count += 1
        db.add(session)
        db.commit()
        db.refresh(session)

        return {
            "answer": answer,
            "history": history,
            "simulated_delay": simulated_delay,
        }

    def submit_guess(self, session: GameSession, user_guess: list[str], db: Session) -> bool:
        actual_identities = json.loads(session.god_identities)

        is_correct = user_guess == actual_identities

        session.is_completed = True
        session.is_win = is_correct
        session.user_guesses = json.dumps(user_guess)
        db.add(session)
        db.commit()

        return is_correct


game_engine = GameEngine()
