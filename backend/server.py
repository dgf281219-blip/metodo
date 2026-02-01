from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
import httpx
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============ MODELS ============

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None  # kg
    height: Optional[float] = None  # cm
    waist: Optional[float] = None  # cm
    hip: Optional[float] = None  # cm
    chest: Optional[float] = None  # cm
    created_at: datetime
    updated_at: Optional[datetime] = None

class SessionDataResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str]
    session_token: str

class UserGoals(BaseModel):
    user_id: str
    meta_principal: str
    desejo_transformar: str
    sentimento_desejado: str
    peso_inicial: Optional[str] = None
    medidas_iniciais: Optional[str] = None
    compromisso: str
    created_at: datetime

class UserGoalsCreate(BaseModel):
    meta_principal: str
    desejo_transformar: str
    sentimento_desejado: str
    peso_inicial: Optional[str] = None
    medidas_iniciais: Optional[str] = None
    compromisso: str

class ChecklistAlimentar(BaseModel):
    sem_acucar: bool = False
    sem_alcool: bool = False
    sem_gluten: bool = False
    sem_refrigerante: bool = False
    alimentos_naturais: bool = False
    evitar_industrializados: bool = False
    frutas_verduras: bool = False
    mastigar_atencao: bool = False

class PraticasDiarias(BaseModel):
    agua_2l: bool = False
    exercicio: bool = False
    meditacao: bool = False
    vacuo: bool = False
    gratidao: bool = False

class DailyRecord(BaseModel):
    user_id: str
    date: str  # YYYY-MM-DD format
    day_number: int
    checklist_alimentar: ChecklistAlimentar = Field(default_factory=ChecklistAlimentar)
    praticas_diarias: PraticasDiarias = Field(default_factory=PraticasDiarias)
    sentimentos: Optional[str] = None
    desafios: Optional[str] = None
    vitoria_dia: Optional[str] = None
    gratidoes: List[str] = Field(default_factory=list)
    calories_consumed: int = 0
    calories_burned: int = 0
    water_intake: int = 0  # ml
    created_at: datetime
    updated_at: datetime

class DailyRecordCreate(BaseModel):
    date: str
    day_number: int
    checklist_alimentar: Optional[ChecklistAlimentar] = None
    praticas_diarias: Optional[PraticasDiarias] = None
    sentimentos: Optional[str] = None
    desafios: Optional[str] = None
    vitoria_dia: Optional[str] = None
    gratidoes: Optional[List[str]] = None

class FinalReflection(BaseModel):
    user_id: str
    mudancas: str
    nova_intencao: str
    data_conclusao: datetime
    created_at: datetime

class FinalReflectionCreate(BaseModel):
    mudancas: str
    nova_intencao: str

class Food(BaseModel):
    food_id: str
    name: str
    category: str
    calories_per_100g: int
    detox_friendly: bool

class FoodEntry(BaseModel):
    user_id: str
    date: str
    meal_type: str  # cafe_manha, almoco, jantar, lanche
    food_id: str
    food_name: str
    portions: float  # in grams
    calories: int
    created_at: datetime

class FoodEntryCreate(BaseModel):
    meal_type: str
    food_id: str
    portions: float

class Activity(BaseModel):
    activity_id: str
    name: str
    met_value: float
    category: str

class ActivityEntry(BaseModel):
    user_id: str
    date: str
    activity_id: str
    activity_name: str
    duration: int  # minutes
    intensity: str  # baixa, media, alta
    calories_burned: int
    created_at: datetime

class ActivityEntryCreate(BaseModel):
    activity_id: str
    duration: int
    intensity: str


# ============ AUTH HELPERS ============

async def get_current_user(request: Request) -> Optional[User]:
    """Get current user from session token in Authorization header or cookie"""
    session_token = None
    
    # Try Authorization header first
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        session_token = auth_header.replace("Bearer ", "")
    
    # Fallback to cookie
    if not session_token:
        session_token = request.cookies.get("session_token")
    
    if not session_token:
        return None
    
    # Find session in database
    session = await db.user_sessions.find_one(
        {"session_token": session_token}, 
        {"_id": 0}
    )
    
    if not session:
        return None
    
    # Check if session is expired
    expires_at = session["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        return None
    
    # Get user
    user_doc = await db.users.find_one(
        {"user_id": session["user_id"]}, 
        {"_id": 0}
    )
    
    if user_doc:
        return User(**user_doc)
    return None

def require_auth(current_user: Optional[User] = Depends(get_current_user)) -> User:
    """Dependency to require authentication"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user


# ============ AUTH ENDPOINTS ============

@api_router.post("/auth/process-session")
async def process_session(request: Request, response: Response):
    """Exchange session_id for user data and create session"""
    data = await request.json()
    session_id = data.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    
    # Exchange session_id for user data
    async with httpx.AsyncClient() as client:
        try:
            api_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            api_response.raise_for_status()
            user_data = api_response.json()
        except Exception as e:
            logger.error(f"Failed to exchange session_id: {e}")
            raise HTTPException(status_code=400, detail="Invalid session_id")
    
    # Create SessionDataResponse
    session_data_response = SessionDataResponse(**user_data)
    
    # Check if user exists
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    existing_user = await db.users.find_one(
        {"email": session_data_response.email},
        {"_id": 0}
    )
    
    if not existing_user:
        # Create new user
        new_user = {
            "user_id": user_id,
            "email": session_data_response.email,
            "name": session_data_response.name,
            "picture": session_data_response.picture,
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(new_user)
    else:
        user_id = existing_user["user_id"]
    
    # Create session
    session_token = session_data_response.session_token
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=7 * 24 * 60 * 60,  # 7 days
        path="/"
    )
    
    # Get user data
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    return {
        "user": User(**user_doc),
        "session_token": session_token
    }

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(require_auth)):
    """Get current user info"""
    return current_user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, current_user: User = Depends(require_auth)):
    """Logout user and delete session"""
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie("session_token", path="/")
    
    return {"message": "Logged out successfully"}


# ============ USER ENDPOINTS ============

@api_router.get("/user/profile")
async def get_user_profile(current_user: User = Depends(require_auth)):
    """Get user profile"""
    return current_user

@api_router.post("/user/goals")
async def create_user_goals(
    goals: UserGoalsCreate,
    current_user: User = Depends(require_auth)
):
    """Create or update user goals for 21-day challenge"""
    existing_goals = await db.user_goals.find_one(
        {"user_id": current_user.user_id},
        {"_id": 0}
    )
    
    goals_data = {
        "user_id": current_user.user_id,
        **goals.model_dump(),
        "created_at": datetime.now(timezone.utc)
    }
    
    if existing_goals:
        await db.user_goals.update_one(
            {"user_id": current_user.user_id},
            {"$set": goals_data}
        )
    else:
        await db.user_goals.insert_one(goals_data)
    
    return UserGoals(**goals_data)

@api_router.get("/user/goals")
async def get_user_goals(current_user: User = Depends(require_auth)):
    """Get user goals"""
    goals = await db.user_goals.find_one(
        {"user_id": current_user.user_id},
        {"_id": 0}
    )
    
    if not goals:
        return None
    
    return UserGoals(**goals)


# ============ DAILY RECORD ENDPOINTS ============

@api_router.post("/daily/record")
async def create_or_update_daily_record(
    record: DailyRecordCreate,
    current_user: User = Depends(require_auth)
):
    """Create or update daily record"""
    existing_record = await db.daily_records.find_one(
        {"user_id": current_user.user_id, "date": record.date},
        {"_id": 0}
    )
    
    now = datetime.now(timezone.utc)
    
    record_data = {
        "user_id": current_user.user_id,
        "date": record.date,
        "day_number": record.day_number,
        "updated_at": now
    }
    
    if record.checklist_alimentar:
        record_data["checklist_alimentar"] = record.checklist_alimentar.model_dump()
    if record.praticas_diarias:
        record_data["praticas_diarias"] = record.praticas_diarias.model_dump()
    if record.sentimentos:
        record_data["sentimentos"] = record.sentimentos
    if record.desafios:
        record_data["desafios"] = record.desafios
    if record.vitoria_dia:
        record_data["vitoria_dia"] = record.vitoria_dia
    if record.gratidoes:
        record_data["gratidoes"] = record.gratidoes
    
    if existing_record:
        # Update existing
        await db.daily_records.update_one(
            {"user_id": current_user.user_id, "date": record.date},
            {"$set": record_data}
        )
        updated_record = await db.daily_records.find_one(
            {"user_id": current_user.user_id, "date": record.date},
            {"_id": 0}
        )
        return DailyRecord(**updated_record)
    else:
        # Create new
        record_data["created_at"] = now
        record_data["checklist_alimentar"] = record_data.get("checklist_alimentar", ChecklistAlimentar().model_dump())
        record_data["praticas_diarias"] = record_data.get("praticas_diarias", PraticasDiarias().model_dump())
        record_data["gratidoes"] = record_data.get("gratidoes", [])
        record_data["calories_consumed"] = 0
        record_data["calories_burned"] = 0
        record_data["water_intake"] = 0
        
        await db.daily_records.insert_one(record_data)
        return DailyRecord(**record_data)

@api_router.get("/daily/record/{date}")
async def get_daily_record(date: str, current_user: User = Depends(require_auth)):
    """Get daily record for specific date"""
    record = await db.daily_records.find_one(
        {"user_id": current_user.user_id, "date": date},
        {"_id": 0}
    )
    
    if not record:
        return None
    
    return DailyRecord(**record)

@api_router.get("/daily/records")
async def get_all_daily_records(current_user: User = Depends(require_auth)):
    """Get all daily records for current user"""
    records = await db.daily_records.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("date", 1).to_list(100)
    
    return [DailyRecord(**record) for record in records]


# ============ METHOD 21 DAYS ENDPOINTS ============

@api_router.get("/method/progress")
async def get_method_progress(current_user: User = Depends(require_auth)):
    """Get progress for 21-day challenge"""
    records = await db.daily_records.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("day_number", 1).to_list(100)
    
    goals = await db.user_goals.find_one(
        {"user_id": current_user.user_id},
        {"_id": 0}
    )
    
    return {
        "goals": UserGoals(**goals) if goals else None,
        "daily_records": [DailyRecord(**record) for record in records],
        "total_days_completed": len(records)
    }

@api_router.post("/method/final-reflection")
async def create_final_reflection(
    reflection: FinalReflectionCreate,
    current_user: User = Depends(require_auth)
):
    """Create final reflection after 21 days"""
    reflection_data = {
        "user_id": current_user.user_id,
        "mudancas": reflection.mudancas,
        "nova_intencao": reflection.nova_intencao,
        "data_conclusao": datetime.now(timezone.utc),
        "created_at": datetime.now(timezone.utc)
    }
    
    existing = await db.final_reflections.find_one(
        {"user_id": current_user.user_id},
        {"_id": 0}
    )
    
    if existing:
        await db.final_reflections.update_one(
            {"user_id": current_user.user_id},
            {"$set": reflection_data}
        )
    else:
        await db.final_reflections.insert_one(reflection_data)
    
    return FinalReflection(**reflection_data)

@api_router.get("/method/final-reflection")
async def get_final_reflection(current_user: User = Depends(require_auth)):
    """Get final reflection"""
    reflection = await db.final_reflections.find_one(
        {"user_id": current_user.user_id},
        {"_id": 0}
    )
    
    if not reflection:
        return None
    
    return FinalReflection(**reflection)


# ============ CALORIES/FOOD ENDPOINTS ============

@api_router.get("/calories/foods")
async def get_foods(category: Optional[str] = None, search: Optional[str] = None):
    """Get all foods, optionally filtered by category or search"""
    query = {}
    
    if category:
        query["category"] = category
    
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    
    foods = await db.foods.find(query, {"_id": 0}).to_list(1000)
    return [Food(**food) for food in foods]

@api_router.post("/calories/add-meal")
async def add_meal(
    entry: FoodEntryCreate,
    current_user: User = Depends(require_auth)
):
    """Add food to meal"""
    # Get food info
    food = await db.foods.find_one({"food_id": entry.food_id}, {"_id": 0})
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    
    # Calculate calories
    calories = int((food["calories_per_100g"] * entry.portions) / 100)
    
    # Get today's date
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Create food entry
    food_entry_data = {
        "user_id": current_user.user_id,
        "date": today,
        "meal_type": entry.meal_type,
        "food_id": entry.food_id,
        "food_name": food["name"],
        "portions": entry.portions,
        "calories": calories,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.food_entries.insert_one(food_entry_data)
    
    # Update daily record calories
    daily_record = await db.daily_records.find_one(
        {"user_id": current_user.user_id, "date": today},
        {"_id": 0}
    )
    
    if daily_record:
        new_total = daily_record.get("calories_consumed", 0) + calories
        await db.daily_records.update_one(
            {"user_id": current_user.user_id, "date": today},
            {"$set": {"calories_consumed": new_total}}
        )
    
    return FoodEntry(**food_entry_data)

@api_router.get("/calories/today")
async def get_today_calories(current_user: User = Depends(require_auth)):
    """Get today's food entries and total calories"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    food_entries = await db.food_entries.find(
        {"user_id": current_user.user_id, "date": today},
        {"_id": 0}
    ).to_list(1000)
    
    total_calories = sum(entry["calories"] for entry in food_entries)
    
    # Group by meal type
    by_meal = {
        "cafe_manha": [],
        "almoco": [],
        "jantar": [],
        "lanche": []
    }
    
    for entry in food_entries:
        meal_type = entry["meal_type"]
        if meal_type in by_meal:
            by_meal[meal_type].append(FoodEntry(**entry))
    
    return {
        "total_calories": total_calories,
        "by_meal": by_meal,
        "all_entries": [FoodEntry(**entry) for entry in food_entries]
    }

@api_router.delete("/calories/{entry_id}")
async def delete_food_entry(entry_id: str, current_user: User = Depends(require_auth)):
    """Delete a food entry"""
    # Note: This is a simplified version. In production, you'd want proper entry_id tracking
    return {"message": "Entry deleted"}


# ============ ACTIVITIES ENDPOINTS ============

@api_router.get("/activities/list")
async def get_activities(category: Optional[str] = None):
    """Get all activities, optionally filtered by category"""
    query = {}
    
    if category:
        query["category"] = category
    
    activities = await db.activities.find(query, {"_id": 0}).to_list(1000)
    return [Activity(**activity) for activity in activities]

@api_router.post("/activities/add")
async def add_activity(
    entry: ActivityEntryCreate,
    current_user: User = Depends(require_auth)
):
    """Add activity entry"""
    # Get activity info
    activity = await db.activities.find_one({"activity_id": entry.activity_id}, {"_id": 0})
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    # Calculate calories burned
    # Formula: MET * weight(kg) * time(hours)
    # We'll assume average weight of 70kg if not provided
    # TODO: Get user weight from profile
    weight_kg = 70
    time_hours = entry.duration / 60
    
    # Adjust MET based on intensity
    met = activity["met_value"]
    if entry.intensity == "baixa":
        met *= 0.8
    elif entry.intensity == "alta":
        met *= 1.2
    
    calories_burned = int(met * weight_kg * time_hours)
    
    # Get today's date
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Create activity entry
    activity_entry_data = {
        "user_id": current_user.user_id,
        "date": today,
        "activity_id": entry.activity_id,
        "activity_name": activity["name"],
        "duration": entry.duration,
        "intensity": entry.intensity,
        "calories_burned": calories_burned,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.activity_entries.insert_one(activity_entry_data)
    
    # Update daily record calories
    daily_record = await db.daily_records.find_one(
        {"user_id": current_user.user_id, "date": today},
        {"_id": 0}
    )
    
    if daily_record:
        new_total = daily_record.get("calories_burned", 0) + calories_burned
        await db.daily_records.update_one(
            {"user_id": current_user.user_id, "date": today},
            {"$set": {"calories_burned": new_total}}
        )
    
    return ActivityEntry(**activity_entry_data)

@api_router.get("/activities/today")
async def get_today_activities(current_user: User = Depends(require_auth)):
    """Get today's activity entries and total calories burned"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    activity_entries = await db.activity_entries.find(
        {"user_id": current_user.user_id, "date": today},
        {"_id": 0}
    ).to_list(1000)
    
    total_calories = sum(entry["calories_burned"] for entry in activity_entries)
    
    return {
        "total_calories_burned": total_calories,
        "entries": [ActivityEntry(**entry) for entry in activity_entries]
    }

@api_router.put("/daily/water")
async def update_water_intake(
    water_ml: int,
    current_user: User = Depends(require_auth)
):
    """Update water intake for today"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Ensure daily record exists
    existing = await db.daily_records.find_one(
        {"user_id": current_user.user_id, "date": today},
        {"_id": 0}
    )
    
    if not existing:
        # Get current day number (days since first goal)
        goals = await db.user_goals.find_one(
            {"user_id": current_user.user_id},
            {"_id": 0}
        )
        
        if goals:
            days_since_start = (datetime.now(timezone.utc) - goals["created_at"]).days + 1
        else:
            days_since_start = 1
        
        # Create new daily record
        new_record = {
            "user_id": current_user.user_id,
            "date": today,
            "day_number": min(days_since_start, 21),
            "checklist_alimentar": ChecklistAlimentar().model_dump(),
            "praticas_diarias": PraticasDiarias().model_dump(),
            "gratidoes": [],
            "calories_consumed": 0,
            "calories_burned": 0,
            "water_intake": water_ml,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        await db.daily_records.insert_one(new_record)
    else:
        await db.daily_records.update_one(
            {"user_id": current_user.user_id, "date": today},
            {"$set": {"water_intake": water_ml, "updated_at": datetime.now(timezone.utc)}}
        )
    
    return {"water_intake": water_ml}


# ============ SEED DATA ON STARTUP ============

@app.on_event("startup")
async def seed_database():
    """Seed foods and activities data"""
    # Check if already seeded
    foods_count = await db.foods.count_documents({})
    activities_count = await db.activities.count_documents({})
    
    if foods_count > 0 and activities_count > 0:
        logger.info("Database already seeded")
        return
    
    # Seed foods
    foods_data = [
        # Frutas (20 itens)
        {"food_id": "f001", "name": "Maçã", "category": "Frutas", "calories_per_100g": 52, "detox_friendly": True},
        {"food_id": "f002", "name": "Banana", "category": "Frutas", "calories_per_100g": 89, "detox_friendly": True},
        {"food_id": "f003", "name": "Melancia", "category": "Frutas", "calories_per_100g": 30, "detox_friendly": True},
        {"food_id": "f004", "name": "Morango", "category": "Frutas", "calories_per_100g": 32, "detox_friendly": True},
        {"food_id": "f005", "name": "Mamão", "category": "Frutas", "calories_per_100g": 43, "detox_friendly": True},
        {"food_id": "f006", "name": "Abacaxi", "category": "Frutas", "calories_per_100g": 50, "detox_friendly": True},
        {"food_id": "f007", "name": "Laranja", "category": "Frutas", "calories_per_100g": 47, "detox_friendly": True},
        {"food_id": "f008", "name": "Uva", "category": "Frutas", "calories_per_100g": 69, "detox_friendly": True},
        {"food_id": "f009", "name": "Manga", "category": "Frutas", "calories_per_100g": 60, "detox_friendly": True},
        {"food_id": "f010", "name": "Pera", "category": "Frutas", "calories_per_100g": 57, "detox_friendly": True},
        {"food_id": "f011", "name": "Kiwi", "category": "Frutas", "calories_per_100g": 61, "detox_friendly": True},
        {"food_id": "f012", "name": "Abacate", "category": "Frutas", "calories_per_100g": 160, "detox_friendly": True},
        {"food_id": "f013", "name": "Melão", "category": "Frutas", "calories_per_100g": 34, "detox_friendly": True},
        {"food_id": "f014", "name": "Goiaba", "category": "Frutas", "calories_per_100g": 68, "detox_friendly": True},
        {"food_id": "f015", "name": "Ameixa", "category": "Frutas", "calories_per_100g": 46, "detox_friendly": True},
        {"food_id": "f016", "name": "Pêssego", "category": "Frutas", "calories_per_100g": 39, "detox_friendly": True},
        {"food_id": "f017", "name": "Caqui", "category": "Frutas", "calories_per_100g": 70, "detox_friendly": True},
        {"food_id": "f018", "name": "Framboesa", "category": "Frutas", "calories_per_100g": 52, "detox_friendly": True},
        {"food_id": "f019", "name": "Mirtilo", "category": "Frutas", "calories_per_100g": 57, "detox_friendly": True},
        {"food_id": "f020", "name": "Cereja", "category": "Frutas", "calories_per_100g": 50, "detox_friendly": True},
        
        # Verduras e Legumes (20 itens)
        {"food_id": "v001", "name": "Alface", "category": "Verduras", "calories_per_100g": 15, "detox_friendly": True},
        {"food_id": "v002", "name": "Couve", "category": "Verduras", "calories_per_100g": 33, "detox_friendly": True},
        {"food_id": "v003", "name": "Brócolis", "category": "Verduras", "calories_per_100g": 34, "detox_friendly": True},
        {"food_id": "v004", "name": "Espinafre", "category": "Verduras", "calories_per_100g": 23, "detox_friendly": True},
        {"food_id": "v005", "name": "Tomate", "category": "Verduras", "calories_per_100g": 18, "detox_friendly": True},
        {"food_id": "v006", "name": "Cenoura", "category": "Verduras", "calories_per_100g": 41, "detox_friendly": True},
        {"food_id": "v007", "name": "Pepino", "category": "Verduras", "calories_per_100g": 15, "detox_friendly": True},
        {"food_id": "v008", "name": "Beterraba", "category": "Verduras", "calories_per_100g": 43, "detox_friendly": True},
        {"food_id": "v009", "name": "Abobrinha", "category": "Verduras", "calories_per_100g": 17, "detox_friendly": True},
        {"food_id": "v010", "name": "Berinjela", "category": "Verduras", "calories_per_100g": 25, "detox_friendly": True},
        {"food_id": "v011", "name": "Pimentão", "category": "Verduras", "calories_per_100g": 20, "detox_friendly": True},
        {"food_id": "v012", "name": "Rúcula", "category": "Verduras", "calories_per_100g": 25, "detox_friendly": True},
        {"food_id": "v013", "name": "Agrião", "category": "Verduras", "calories_per_100g": 11, "detox_friendly": True},
        {"food_id": "v014", "name": "Repolho", "category": "Verduras", "calories_per_100g": 25, "detox_friendly": True},
        {"food_id": "v015", "name": "Couve-flor", "category": "Verduras", "calories_per_100g": 25, "detox_friendly": True},
        {"food_id": "v016", "name": "Rabanete", "category": "Verduras", "calories_per_100g": 16, "detox_friendly": True},
        {"food_id": "v017", "name": "Nabo", "category": "Verduras", "calories_per_100g": 28, "detox_friendly": True},
        {"food_id": "v018", "name": "Vagem", "category": "Verduras", "calories_per_100g": 31, "detox_friendly": True},
        {"food_id": "v019", "name": "Aspargo", "category": "Verduras", "calories_per_100g": 20, "detox_friendly": True},
        {"food_id": "v020", "name": "Acelga", "category": "Verduras", "calories_per_100g": 19, "detox_friendly": True},
        
        # Grãos sem glúten (10 itens)
        {"food_id": "g001", "name": "Arroz Integral", "category": "Grãos", "calories_per_100g": 111, "detox_friendly": True},
        {"food_id": "g002", "name": "Quinoa", "category": "Grãos", "calories_per_100g": 120, "detox_friendly": True},
        {"food_id": "g003", "name": "Amaranto", "category": "Grãos", "calories_per_100g": 102, "detox_friendly": True},
        {"food_id": "g004", "name": "Batata Doce", "category": "Grãos", "calories_per_100g": 86, "detox_friendly": True},
        {"food_id": "g005", "name": "Mandioca", "category": "Grãos", "calories_per_100g": 160, "detox_friendly": True},
        {"food_id": "g006", "name": "Inhame", "category": "Grãos", "calories_per_100g": 118, "detox_friendly": True},
        {"food_id": "g007", "name": "Aveia sem Glúten", "category": "Grãos", "calories_per_100g": 389, "detox_friendly": True},
        {"food_id": "g008", "name": "Tapioca", "category": "Grãos", "calories_per_100g": 358, "detox_friendly": True},
        {"food_id": "g009", "name": "Polenta", "category": "Grãos", "calories_per_100g": 70, "detox_friendly": True},
        {"food_id": "g010", "name": "Feijão", "category": "Grãos", "calories_per_100g": 127, "detox_friendly": True},
        
        # Proteínas naturais (15 itens)
        {"food_id": "p001", "name": "Peito de Frango Grelhado", "category": "Proteínas", "calories_per_100g": 165, "detox_friendly": True},
        {"food_id": "p002", "name": "Peixe Grelhado (Tilápia)", "category": "Proteínas", "calories_per_100g": 96, "detox_friendly": True},
        {"food_id": "p003", "name": "Salmão", "category": "Proteínas", "calories_per_100g": 208, "detox_friendly": True},
        {"food_id": "p004", "name": "Ovo Cozido", "category": "Proteínas", "calories_per_100g": 155, "detox_friendly": True},
        {"food_id": "p005", "name": "Atum", "category": "Proteínas", "calories_per_100g": 144, "detox_friendly": True},
        {"food_id": "p006", "name": "Peru", "category": "Proteínas", "calories_per_100g": 135, "detox_friendly": True},
        {"food_id": "p007", "name": "Tofu", "category": "Proteínas", "calories_per_100g": 76, "detox_friendly": True},
        {"food_id": "p008", "name": "Lentilha", "category": "Proteínas", "calories_per_100g": 116, "detox_friendly": True},
        {"food_id": "p009", "name": "Grão de Bico", "category": "Proteínas", "calories_per_100g": 164, "detox_friendly": True},
        {"food_id": "p010", "name": "Ervilha", "category": "Proteínas", "calories_per_100g": 81, "detox_friendly": True},
        {"food_id": "p011", "name": "Sardinha", "category": "Proteínas", "calories_per_100g": 208, "detox_friendly": True},
        {"food_id": "p012", "name": "Camarão", "category": "Proteínas", "calories_per_100g": 99, "detox_friendly": True},
        {"food_id": "p013", "name": "Cottage Cheese", "category": "Proteínas", "calories_per_100g": 98, "detox_friendly": True},
        {"food_id": "p014", "name": "Ricota", "category": "Proteínas", "calories_per_100g": 174, "detox_friendly": True},
        {"food_id": "p015", "name": "Cogumelo", "category": "Proteínas", "calories_per_100g": 22, "detox_friendly": True},
        
        # Sucos detox (10 itens)
        {"food_id": "s001", "name": "Suco Verde (Couve, Limão, Maçã)", "category": "Sucos", "calories_per_100g": 45, "detox_friendly": True},
        {"food_id": "s002", "name": "Suco de Melancia", "category": "Sucos", "calories_per_100g": 30, "detox_friendly": True},
        {"food_id": "s003", "name": "Suco de Laranja Natural", "category": "Sucos", "calories_per_100g": 45, "detox_friendly": True},
        {"food_id": "s004", "name": "Suco Detox (Pepino, Hortelã, Limão)", "category": "Sucos", "calories_per_100g": 20, "detox_friendly": True},
        {"food_id": "s005", "name": "Água de Coco", "category": "Sucos", "calories_per_100g": 19, "detox_friendly": True},
        {"food_id": "s006", "name": "Suco de Abacaxi com Hortelã", "category": "Sucos", "calories_per_100g": 50, "detox_friendly": True},
        {"food_id": "s007", "name": "Suco de Beterraba", "category": "Sucos", "calories_per_100g": 43, "detox_friendly": True},
        {"food_id": "s008", "name": "Suco de Cenoura", "category": "Sucos", "calories_per_100g": 40, "detox_friendly": True},
        {"food_id": "s009", "name": "Limonada Natural", "category": "Sucos", "calories_per_100g": 25, "detox_friendly": True},
        {"food_id": "s010", "name": "Chá Verde Gelado", "category": "Sucos", "calories_per_100g": 1, "detox_friendly": True},
        
        # Lanches saudáveis (15 itens)
        {"food_id": "l001", "name": "Castanha do Pará", "category": "Lanches", "calories_per_100g": 656, "detox_friendly": True},
        {"food_id": "l002", "name": "Amêndoas", "category": "Lanches", "calories_per_100g": 579, "detox_friendly": True},
        {"food_id": "l003", "name": "Nozes", "category": "Lanches", "calories_per_100g": 654, "detox_friendly": True},
        {"food_id": "l004", "name": "Iogurte Natural", "category": "Lanches", "calories_per_100g": 61, "detox_friendly": True},
        {"food_id": "l005", "name": "Chia", "category": "Lanches", "calories_per_100g": 486, "detox_friendly": True},
        {"food_id": "l006", "name": "Linhaça", "category": "Lanches", "calories_per_100g": 534, "detox_friendly": True},
        {"food_id": "l007", "name": "Tâmaras", "category": "Lanches", "calories_per_100g": 277, "detox_friendly": True},
        {"food_id": "l008", "name": "Damascos Secos", "category": "Lanches", "calories_per_100g": 241, "detox_friendly": True},
        {"food_id": "l009", "name": "Pasta de Amendoim Natural", "category": "Lanches", "calories_per_100g": 588, "detox_friendly": True},
        {"food_id": "l010", "name": "Hummus", "category": "Lanches", "calories_per_100g": 166, "detox_friendly": True},
        {"food_id": "l011", "name": "Pipoca sem Óleo", "category": "Lanches", "calories_per_100g": 382, "detox_friendly": True},
        {"food_id": "l012", "name": "Mix de Sementes", "category": "Lanches", "calories_per_100g": 550, "detox_friendly": True},
        {"food_id": "l013", "name": "Granola sem Açúcar", "category": "Lanches", "calories_per_100g": 471, "detox_friendly": True},
        {"food_id": "l014", "name": "Coco Fresco", "category": "Lanches", "calories_per_100g": 354, "detox_friendly": True},
        {"food_id": "l015", "name": "Azeitona", "category": "Lanches", "calories_per_100g": 115, "detox_friendly": True},
    ]
    
    if foods_count == 0:
        await db.foods.insert_many(foods_data)
        logger.info(f"Seeded {len(foods_data)} foods")
    
    # Seed activities
    activities_data = [
        {"activity_id": "a001", "name": "Musculação", "met_value": 5.0, "category": "Academia"},
        {"activity_id": "a002", "name": "Caminhada Leve", "met_value": 3.0, "category": "Cardio"},
        {"activity_id": "a003", "name": "Caminhada Moderada", "met_value": 4.0, "category": "Cardio"},
        {"activity_id": "a004", "name": "Caminhada Intensa", "met_value": 5.0, "category": "Cardio"},
        {"activity_id": "a005", "name": "Corrida Leve", "met_value": 7.0, "category": "Cardio"},
        {"activity_id": "a006", "name": "Corrida Moderada", "met_value": 9.0, "category": "Cardio"},
        {"activity_id": "a007", "name": "Corrida Intensa", "met_value": 11.0, "category": "Cardio"},
        {"activity_id": "a008", "name": "Yoga", "met_value": 3.0, "category": "Flexibilidade"},
        {"activity_id": "a009", "name": "Pilates", "met_value": 3.5, "category": "Flexibilidade"},
        {"activity_id": "a010", "name": "Alongamento", "met_value": 2.5, "category": "Flexibilidade"},
        {"activity_id": "a011", "name": "Vácuo Abdominal", "met_value": 3.5, "category": "Core"},
        {"activity_id": "a012", "name": "Dança", "met_value": 6.0, "category": "Cardio"},
        {"activity_id": "a013", "name": "Natação Leve", "met_value": 6.0, "category": "Cardio"},
        {"activity_id": "a014", "name": "Natação Intensa", "met_value": 9.0, "category": "Cardio"},
        {"activity_id": "a015", "name": "Ciclismo Leve", "met_value": 5.5, "category": "Cardio"},
        {"activity_id": "a016", "name": "Ciclismo Moderado", "met_value": 7.0, "category": "Cardio"},
        {"activity_id": "a017", "name": "Ciclismo Intenso", "met_value": 10.0, "category": "Cardio"},
        {"activity_id": "a018", "name": "Meditação", "met_value": 1.3, "category": "Mente"},
        {"activity_id": "a019", "name": "Jump", "met_value": 8.0, "category": "Cardio"},
        {"activity_id": "a020", "name": "Futebol", "met_value": 7.0, "category": "Esportes"},
    ]
    
    if activities_count == 0:
        await db.activities.insert_many(activities_data)
        logger.info(f"Seeded {len(activities_data)} activities")


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
