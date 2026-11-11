from datetime import date
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator

class CulturaEntrada(BaseModel):
    nome_cultura: str = Field(min_length=1, max_length=150)
    ciclo_medio_dias: Decimal = Field(
        ge=0,
        max_digits=10,
        decimal_places=2,
    )

    @field_validator("nome_cultura")
    @classmethod
    def validar_nome(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError(
                "O nome da cultura não pode ficar vazio."
            )
        return valor

class CulturaSaida(CulturaEntrada):
    id_cultura: int
