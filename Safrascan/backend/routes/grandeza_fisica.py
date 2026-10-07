from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from models import GrandezaFisica
from schemas import GrandezaFisicaCreate, GrandezaFisicaResponse


router = APIRouter(
    prefix="/grandezas",
    tags=["GrandezaFisica"]
)

@router.get(
    "/",
    response_model=list[GrandezaFisicaResponse]
)
def listar_grandezas(
    db: Session = Depends(get_db)
):
    return db.query(GrandezaFisica).all()


@router.post(
    "/",
    response_model=GrandezaFisicaResponse,
    status_code=status.HTTP_201_CREATED
)
def criar_grandeza(
    dados: GrandezaFisicaCreate,
    db: Session = Depends(get_db)
):
    grandeza = GrandezaFisica(
        nome_grandeza=dados.nome_grandeza,
        unidade_medida=dados.unidade_medida,
        descricao_grandeza=dados.descricao_grandeza
    )

    db.add(grandeza)
    db.commit()
    db.refresh(grandeza)

    return grandeza

