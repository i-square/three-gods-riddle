from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select
import bcrypt
import jwt
from datetime import timedelta, datetime
import json

from app.models import User, GameSession, create_db_and_tables, engine
from app.services.game_service import game_engine
from app.core.config import settings
from pydantic import BaseModel

# --- Setup ---
app = FastAPI(title="Three Gods Riddle")

# Auth Utils (Native bcrypt)
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Templates & Static
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# --- Dependencies ---
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
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = db.get(User, user_id)
    if user is None:
        raise credentials_exception
    return user

# --- Pydantic Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    username: str
    password: str

class AskQuestionRequest(BaseModel):
    session_id: int
    god_index: int # 0, 1, 2
    question: str

class GuessRequest(BaseModel):
    session_id: int
    guesses: list[str] # ["True", "False", "Random"]

# --- Routes ---

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Auth Routes
@app.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    user = db.get(User, user_data.username)
    if user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_pw = hash_password(user_data.password)
    new_user = User(id=user_data.username, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    
    # Auto login
    access_token = create_access_token(data={"sub": new_user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.get(User, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

# Game Routes

@app.post("/game/start")
async def start_game(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if there's an unfinished game? For simplicity, we allow new games always.
    session = game_engine.start_new_game(current_user.id, db)
    return {"session_id": session.session_id, "message": "Game started. Identify the gods!"}

@app.post("/game/ask")
async def ask_god(req: AskQuestionRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.get(GameSession, req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your game session")
    if session.is_completed:
        raise HTTPException(status_code=400, detail="Game already completed")
    
    try:
        answer = game_engine.process_question(session, req.god_index, req.question, db)
        return {
            "answer": answer,
            "questions_left": 3 - session.current_question_count,
            "history": json.loads(session.move_history)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/game/submit")
async def submit_guess(req: GuessRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.get(GameSession, req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your game session")
    
    result = game_engine.submit_guess(session, req.guesses, db)
    
    # Reveal secrets
    identities = json.loads(session.god_identities)
    language = json.loads(session.language_map)
    
    return {
        "win": result,
        "identities": identities,
        "language_map": language
    }

@app.get("/history")
async def get_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    statement = select(GameSession).where(GameSession.user_id == current_user.id).order_by(GameSession.created_at.desc())
    results = db.exec(statement).all()
    
    history_data = []
    for game in results:
        history_data.append({
            "id": game.session_id,
            "date": game.created_at.isoformat(),
            "win": game.is_win,
            "completed": game.is_completed
        })
    return history_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
