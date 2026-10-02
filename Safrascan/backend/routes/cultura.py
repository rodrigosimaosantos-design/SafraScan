from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Cultura
from schemas import CulturaResponse


router = APIRouter(
    prefix="/culturas",
    tags=["Culturas"]
)


@router.get("/", response_model=list[CulturaResponse])
def listar_culturas(db: Session = Depends(get_db)):
    return db.query(Cultura).all()