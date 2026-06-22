from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Request, Task
from app.schemas import StatsOut
from app.routers.auth import tokens
from fastapi import Header, HTTPException
from datetime import date, timedelta

router = APIRouter(tags=["stats"])


def get_current_user(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    email = tokens.get(token)
    if not email:
        raise HTTPException(status_code=401, detail="Non authentifié")
    return email


@router.get("/api/stats", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db), _=Depends(get_current_user)):
    today = date.today()
    month_start = today.replace(day=1)

    requests_month = db.query(func.count(Request.id)).filter(Request.date >= month_start).scalar() or 0
    tasks_completed = db.query(func.count(Task.id)).filter(Task.done == True).scalar() or 0
    pending = db.query(func.count(Request.id)).filter(Request.status != "résolu").scalar() or 0
    rating = 4.8

    week_start = today - timedelta(days=6)
    resolved_week = db.query(func.count(Request.id)).filter(
        Request.status == "résolu", Request.date >= week_start
    ).scalar() or 0

    weekly_labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
    weekly_resolved = []
    weekly_new = []

    for i in range(7):
        day = week_start + timedelta(days=i)
        day_after = day + timedelta(days=1)
        resolved = db.query(func.count(Request.id)).filter(
            Request.status == "résolu", Request.date >= day, Request.date < day_after
        ).scalar() or 0
        new_req = db.query(func.count(Request.id)).filter(
            Request.date >= day, Request.date < day_after
        ).scalar() or 0
        weekly_resolved.append(resolved)
        weekly_new.append(new_req)

    return StatsOut(
        requests_month=requests_month,
        tasks_completed=tasks_completed,
        pending=pending,
        rating=rating,
        resolved_week=resolved_week,
        avg_time="2.4h",
        satisfaction=f"{min(96 + resolved_week, 100)}%",
        weekly_resolved=weekly_resolved,
        weekly_new=weekly_new,
        weekly_labels=weekly_labels,
    )
