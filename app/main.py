import asyncio
import json
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlmodel import Session, col, select

from app.core.config import settings
from app.core.health import router as health_router
from app.core.logging import setup_logging
from app.models import GameSession, User, create_db_and_tables, engine
from app.services.game_service import game_engine

setup_logging(
    level=settings.log_level,
    log_format=settings.log_format,
    log_file=settings.log_file,
)

app = FastAPI(title="Three Gods Riddle")
app.include_router(health_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_db():
    with Session(engine) as session:
        yield session


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id = payload.get("sub")
        if not isinstance(user_id, str):
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    user = db.get(User, user_id)
    if user is None:
        raise credentials_exception
    if user.is_disabled:
        raise HTTPException(status_code=403, detail="User account is disabled")
    return user


def get_current_user_ready(current_user: User = Depends(get_current_user)):
    if current_user.must_change_password:
        raise HTTPException(status_code=403, detail="Password change required")
    return current_user


def get_admin_user(current_user: User = Depends(get_current_user_ready)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    must_change_password: bool
    is_admin: bool


class UserCreate(BaseModel):
    username: str
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class TutorialUpdateRequest(BaseModel):
    completed: bool


class AskQuestionRequest(BaseModel):
    session_id: int
    god_index: int
    question: str


class GuessRequest(BaseModel):
    session_id: int
    guesses: list[str]


class UserResponse(BaseModel):
    id: str
    is_admin: bool
    must_change_password: bool
    tutorial_completed: bool
    created_at: datetime


class GameHistoryItem(BaseModel):
    id: Optional[int]
    date: str
    win: bool
    completed: bool
    questions_asked: int


class GameDetailResponse(BaseModel):
    id: Optional[int]
    date: str
    win: bool
    completed: bool
    god_identities: list[str]
    language_map: dict[str, str]
    move_history: list[dict[str, object]]
    user_guesses: Optional[list[str]] = None


def init_root_user(db: Session):
    root_user = db.get(User, "root")
    if root_user is None:
        hashed_pw = hash_password(settings.root_password)
        root_user = User(
            id="root",
            hashed_password=hashed_pw,
            is_admin=True,
            must_change_password=True,
        )
        db.add(root_user)
        db.commit()


@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    with Session(engine) as db:
        init_root_user(db)


@app.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if user_data.username.lower() == "root":
        raise HTTPException(status_code=400, detail="Cannot register with reserved username")

    user = db.get(User, user_data.username)
    if user:
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_pw = hash_password(user_data.password)
    new_user = User(id=user_data.username, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()

    access_token = create_access_token(data={"sub": new_user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "must_change_password": False,
        "is_admin": False,
    }


@app.post("/token", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.get(User, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    if user.is_disabled:
        raise HTTPException(status_code=403, detail="User account is disabled")

    access_token = create_access_token(data={"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "must_change_password": user.must_change_password,
        "is_admin": user.is_admin,
    }


def create_access_token(data: dict[str, object]):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


@app.get("/users/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        is_admin=current_user.is_admin,
        must_change_password=current_user.must_change_password,
        tutorial_completed=current_user.tutorial_completed,
        created_at=current_user.created_at,
    )


@app.post("/auth/change-password")
async def change_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if req.current_password == req.new_password:
        raise HTTPException(
            status_code=400,
            detail="New password must be different from current password",
        )

    current_user.hashed_password = hash_password(req.new_password)
    current_user.must_change_password = False
    db.add(current_user)
    db.commit()

    return {"message": "Password changed successfully"}


@app.patch("/users/me/tutorial")
async def update_tutorial_status(
    req: TutorialUpdateRequest,
    current_user: User = Depends(get_current_user_ready),
    db: Session = Depends(get_db),
):
    current_user.tutorial_completed = req.completed
    db.add(current_user)
    db.commit()
    return {"tutorial_completed": current_user.tutorial_completed}


@app.post("/game/start")
async def start_game(
    current_user: User = Depends(get_current_user_ready), db: Session = Depends(get_db)
):
    session = game_engine.start_new_game(current_user.id, db)
    return {
        "session_id": session.session_id,
        "message": "Game started. Identify the gods!",
    }


@app.post("/game/ask")
async def ask_god(
    req: AskQuestionRequest,
    current_user: User = Depends(get_current_user_ready),
    db: Session = Depends(get_db),
):
    session = db.get(GameSession, req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your game session")
    if session.is_completed:
        raise HTTPException(status_code=400, detail="Game already completed")

    try:
        result = game_engine.process_question(session, req.god_index, req.question, db)
        delay = result.get("simulated_delay")
        if isinstance(delay, (int, float)):
            await asyncio.sleep(delay)
        return {
            "answer": result["answer"],
            "questions_left": 3 - session.current_question_count,
            "history": result["history"],
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/game/submit")
async def submit_guess(
    req: GuessRequest,
    current_user: User = Depends(get_current_user_ready),
    db: Session = Depends(get_db),
):
    session = db.get(GameSession, req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your game session")

    result = game_engine.submit_guess(session, req.guesses, db)

    identities = json.loads(session.god_identities)
    language = json.loads(session.language_map)

    return {"win": result, "identities": identities, "language_map": language}


@app.get("/history", response_model=list[GameHistoryItem])
async def get_history(
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user_ready),
    db: Session = Depends(get_db),
):
    statement = (
        select(GameSession)
        .where(GameSession.user_id == current_user.id)
        .order_by(col(GameSession.session_id).desc())
        .offset(offset)
        .limit(limit)
    )
    results = db.exec(statement).all()

    history_data = []
    for game in results:
        move_history = json.loads(game.move_history) if game.move_history else []
        if len(move_history) > 0:
            history_data.append(
                {
                    "id": game.session_id,
                    "date": game.created_at.isoformat(),
                    "win": game.is_win,
                    "completed": game.is_completed,
                    "questions_asked": game.current_question_count,
                }
            )
    return history_data


@app.get("/history/{session_id}", response_model=GameDetailResponse)
async def get_game_detail(
    session_id: int,
    current_user: User = Depends(get_current_user_ready),
    db: Session = Depends(get_db),
):
    session = db.get(GameSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Game session not found")

    if session.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to view this game")

    if not session.is_completed:
        raise HTTPException(status_code=400, detail="Cannot view details of incomplete game")

    return GameDetailResponse(
        id=session.session_id,
        date=session.created_at.isoformat(),
        win=session.is_win,
        completed=session.is_completed,
        god_identities=json.loads(session.god_identities),
        language_map=json.loads(session.language_map),
        move_history=json.loads(session.move_history) if session.move_history else [],
        user_guesses=(
            json.loads(session.user_guesses)
            if hasattr(session, "user_guesses") and session.user_guesses
            else None
        ),
    )


@app.get("/admin/users")
async def admin_get_users(
    limit: int = 50,
    offset: int = 0,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    statement = select(User).offset(offset).limit(limit)
    users = db.exec(statement).all()

    user_stats = []
    for user in users:
        games = db.exec(select(GameSession).where(GameSession.user_id == user.id)).all()
        # Only count games where at least one question was asked
        active_games = [g for g in games if g.current_question_count > 0]
        completed_games = [g for g in active_games if g.is_completed]
        total_games = len(active_games)
        wins = sum(1 for g in completed_games if g.is_win)

        user_stats.append(
            {
                "id": user.id,
                "is_admin": user.is_admin,
                "is_disabled": user.is_disabled,
                "created_at": user.created_at.isoformat(),
                "total_games": total_games,
                "wins": wins,
                "win_rate": (wins / len(completed_games) * 100) if completed_games else 0,
            }
        )

    return user_stats


@app.get("/admin/stats")
async def admin_get_stats(
    admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)
):
    total_users = len(db.exec(select(User)).all())
    all_games = db.exec(select(GameSession)).all()
    active_games = [g for g in all_games if g.current_question_count > 0]
    total_games = len(active_games)
    completed_games = [g for g in active_games if g.is_completed]
    total_wins = sum(1 for g in completed_games if g.is_win)

    return {
        "total_users": total_users,
        "total_games": total_games,
        "completed_games": len(completed_games),
        "total_wins": total_wins,
        "overall_win_rate": ((total_wins / len(completed_games) * 100) if completed_games else 0),
    }


@app.patch("/admin/users/{user_id}/disable")
async def admin_toggle_user(
    user_id: str,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    if user_id == "root":
        raise HTTPException(status_code=400, detail="Cannot disable root user")

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_disabled = not user.is_disabled
    db.add(user)
    db.commit()

    return {"id": user.id, "is_disabled": user.is_disabled}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
