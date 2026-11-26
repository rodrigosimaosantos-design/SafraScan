
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator


class TalhaoEntrada(BaseModel):
    nome_talhao: str = Field(
        min_length=1,
        max_length=100
    )

    area_ha: Decimal = Field(
        gt=0,
        max_digits=10,
        decimal_places=2
    )

    tipo_solo: str = Field(
        min_length=1,
        max_length=100
    )

    id_propriedade: int = Field(gt=0)

    @field_validator("nome_talhao", "tipo_solo")
    @classmethod
    def validar_textos(cls, valor: str) -> str:
        valor = valor.strip()

        if not valor:
            raise ValueError(
                "Este campo não pode ficar vazio."
            )

        return valor


class TalhaoSaida(BaseModel):
    id_talhao: int
    nome_talhao: str | None = None
    area_ha: Decimal
    tipo_solo: str
    id_propriedade: int
