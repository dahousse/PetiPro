from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, requests, tasks, stats

Base.metadata.create_all(bind=engine)

app = FastAPI(title="PetiPro API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(requests.router)
app.include_router(tasks.router)
app.include_router(stats.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
