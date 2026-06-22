from fastapi import APIRouter, HTTPException
from app.schemas import LoginRequest, LoginResponse
import secrets

router = APIRouter(tags=["auth"])

USERS = {
    "admin@petipro.fr": {
        "password": "demo1234",
        "name": "Jean Dupont",
    }
}

tokens = {}


@router.post("/api/auth/login", response_model=LoginResponse)
def login(body: LoginRequest):
    user = USERS.get(body.email)
    if not user or user["password"] != body.password:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    token = secrets.token_hex(32)
    tokens[token] = body.email
    return LoginResponse(
        token=token,
        user={"name": user["name"], "email": body.email},
    )
