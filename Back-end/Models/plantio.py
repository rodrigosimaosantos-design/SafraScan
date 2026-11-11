
from datetime import date
from pydantic import BaseModel, Field, field_validator


class PlantioEntrada(BaseModel):
    data_plantio: date
    id_talhao: int = Field(gt=0)
    id_cultura: int = Field(gt=0)
    data_colheita_prevista: date
    status_sensor: str = Field(min_length=1)

    @field_validator("status_sensor")
    @classmethod
    def validar_status_sensor(cls, valor: str) -> str:
        valor = valor.strip()

        if not valor:
            raise ValueError(
                "O status do sensor não pode ficar vazio."
            )

        return valor


class PlantioSaida(PlantioEntrada):
    id_plantio: int
