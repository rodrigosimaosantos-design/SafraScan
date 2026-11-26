
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class LeituraSensorEntrada(BaseModel):
    timestamp_leitura: datetime | None = None
    id_sensor: int = Field(gt=0)
    id_grandeza: int = Field(gt=0)
    valor_leitura: Decimal = Field(
        max_digits=10,
        decimal_places=2
    )
    outros_dados: str | None = None


class LeituraSensorSaida(LeituraSensorEntrada):
    id_leitura: int
    timestamp_leitura: datetime
