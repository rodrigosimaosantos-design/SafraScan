from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from models import Talhao
from schemas import TalhaoCreate, TalhaoResponse


router = APIRouter(
    prefix="/talhao",
    tags=["Talhao"]
)


@router.get(
    "/",
    response_model=list[TalhaoResponse]
)
def listar_talhoes(
    db: Session = Depends(get_db)
):
    return db.query(Talhao).all()


@router.post(
    "/",
    response_model=TalhaoResponse,
    status_code=status.HTTP_201_CREATED
)
def criar_talhao(
    dados: TalhaoCreate,
    db: Session = Depends(get_db)
):
    talhao = Talhao(
        area_ha=dados.area_ha,
        tipo_solo=dados.tipo_solo,
        id_propriedade=dados.id_propriedade
    )

    db.add(talhao)
    db.commit()
    db.refresh(talhao)

    return talhao
