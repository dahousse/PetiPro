from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Task
from app.schemas import TaskCreate, TaskOut, TaskToggle
from app.routers.auth import tokens
from fastapi import Header

router = APIRouter(tags=["tasks"])


def get_current_user(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    email = tokens.get(token)
    if not email:
        raise HTTPException(status_code=401, detail="Non authentifié")
    return email


@router.get("/api/tasks", response_model=list[TaskOut])
def list_tasks(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Task).order_by(Task.id.desc()).all()


@router.post("/api/tasks", response_model=TaskOut)
def create_task(body: TaskCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    task = Task(title=body.title, desc=body.desc, priority=body.priority)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/api/tasks/{task_id}/toggle", response_model=TaskOut)
def toggle_task(task_id: int, body: TaskToggle, db: Session = Depends(get_db), _=Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    task.done = body.done
    db.commit()
    db.refresh(task)
    return task


@router.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    db.delete(task)
    db.commit()
    return {"ok": True}
