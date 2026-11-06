from datetime import date
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator

class GrandezaEntrada(BaseModel):
    nome_grandeza: str = Field(min_length=1, max_length=150)
    unidade_medida: str = Field(min_length=1, max_length=150)
    descricao_grandeza: str = Field(min_length=1, max_length=300)

    @field_validator("nome_grandeza")
    @classmethod
    def validar_nome(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError(
                "O nome da grandeza física não pode ficar vazio."
            )
        return valor

class GrandezaSaida(GrandezaEntrada):
    id_grandeza: int

