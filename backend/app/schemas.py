from pydantic import BaseModel
from datetime import date
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    user: dict


class RequestCreate(BaseModel):
    client: str
    subject: str
    priority: str = "moyenne"
    status: str = "nouveau"


class RequestOut(BaseModel):
    id: int
    client: str
    subject: str
    priority: str
    status: str
    date: date

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    title: str
    desc: str = ""
    priority: str = "moyenne"


class TaskOut(BaseModel):
    id: int
    title: str
    desc: str
    priority: str
    done: bool

    class Config:
        from_attributes = True


class TaskToggle(BaseModel):
    done: bool


class StatsOut(BaseModel):
    requests_month: int
    tasks_completed: int
    pending: int
    rating: float
    resolved_week: int
    avg_time: str
    satisfaction: str
    weekly_resolved: list[int]
    weekly_new: list[int]
    weekly_labels: list[str]
