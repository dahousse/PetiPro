from sqlalchemy import Boolean, Column, Integer, String, Date, func
from app.database import Base


class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    client = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    priority = Column(String, default="moyenne")
    status = Column(String, default="nouveau")
    date = Column(Date, default=func.current_date)


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    desc = Column(String, default="")
    priority = Column(String, default="moyenne")
    done = Column(Boolean, default=False)
