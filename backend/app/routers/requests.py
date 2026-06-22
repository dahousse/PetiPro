from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Request
from app.schemas import RequestCreate, RequestOut
from app.routers.auth import tokens
from fastapi import Header
from datetime import date

router = APIRouter(tags=["requests"])


def get_current_user(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    email = tokens.get(token)
    if not email:
        raise HTTPException(status_code=401, detail="Non authentifié")
    return email


@router.get("/api/requests", response_model=list[RequestOut])
def list_requests(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Request).order_by(Request.id.desc()).all()


@router.post("/api/requests", response_model=RequestOut)
def create_request(body: RequestCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    req = Request(client=body.client, subject=body.subject,
                  priority=body.priority, status=body.status, date=date.today())
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.delete("/api/requests/{req_id}")
def delete_request(req_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    req = db.query(Request).filter(Request.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Demande introuvable")
    db.delete(req)
    db.commit()
    return {"ok": True}
