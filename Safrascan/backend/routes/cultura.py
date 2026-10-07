from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from models import Cultura
from schemas import CulturaCreate, CulturaResponse


router = APIRouter(
    prefix="/culturas",
    tags=["Culturas"]
)


@router.get(
    "/",
    response_model=list[CulturaResponse]
)
def listar_culturas(
    db: Session = Depends(get_db)
):
    return db.query(Cultura).all()


@router.post(
    "/",
    response_model=CulturaResponse,
    status_code=status.HTTP_201_CREATED
)
def criar_cultura(
    dados: CulturaCreate,
    db: Session = Depends(get_db)
):
    cultura = Cultura(
        nome_cultura=dados.nome_cultura,
        ciclo_medio_dias=dados.ciclo_medio_dias
    )

    db.add(cultura)
    db.commit()
    db.refresh(cultura)

    return cultura

