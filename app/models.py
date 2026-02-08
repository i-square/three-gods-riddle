import os
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel, create_engine

# Database Models


class User(SQLModel, table=True):
    id: str = Field(primary_key=True, index=True)
    hashed_password: str
    is_admin: bool = Field(default=False)
    must_change_password: bool = Field(default=False)
    tutorial_completed: bool = Field(default=False)
    is_disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class GameSession(SQLModel, table=True):
    session_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="user.id")

    god_identities: str = Field(default="[]")
    language_map: str = Field(default="{}")

    current_question_count: int = Field(default=0)
    move_history: str = Field(default="[]")
    user_guesses: Optional[str] = Field(default=None)

    is_completed: bool = Field(default=False)
    is_win: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Database Connection
database_url = os.getenv("DATABASE_URL", "sqlite:///database.db")
connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
engine = create_engine(database_url, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
