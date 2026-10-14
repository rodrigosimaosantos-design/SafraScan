from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from models import Propriedade
from schemas import PropriedadeCreate, PropriedadeResponse


router = APIRouter(
    prefix="/propriedades",
    tags=["Proproiedade"]
)


@router.get(
    "/",
    response_model=list[PropriedadeResponse]
)
def listar_propriedades(
    db: Session = Depends(get_db)
):
    return db.query(Propriedade).all()


@router.post(
    "/",
    response_model=PropriedadeResponse,
    status_code=status.HTTP_201_CREATED
)
def criar_propriedade(
    dados: PropriedadeCreate,
    db: Session = Depends(get_db)
):
    propriedade = Propriedade(
        nome_propriedade=dados.nome_propriedade,
        endereco_propriedade=dados.endereco_propriedade,
        municipio_propriedade=dados.municipio_propriedade,
        estado_propriedade=dados.estado_propriedade,
        cep_propriedade=dados.cep_propriedade,
        tamanho_ha=dados.tamanho_ha,
        id_usuario=dados.id_usuario
    )

    db.add(propriedade)
    db.commit()
    db.refresh(propriedade)

    return propriedade

