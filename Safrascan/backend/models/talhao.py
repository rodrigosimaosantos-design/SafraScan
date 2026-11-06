from decimal import Decimal
from pydantic import BaseModel, Field, field_validator


class TalhaoEntrada(BaseModel):
    area_ha: Decimal = Field(
        gt=0,
        max_digits=10,
        decimal_places=2,
    )
    tipo_solo: str = Field(min_length=1)
    id_propriedade: int = Field(gt=0)

    @field_validator("tipo_solo")
    @classmethod
    def validar_tipo_solo(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError(
                "O tipo de solo não pode ficar vazio."
            )
        return valor


class TalhaoSaida(TalhaoEntrada):
    id_talhao: int