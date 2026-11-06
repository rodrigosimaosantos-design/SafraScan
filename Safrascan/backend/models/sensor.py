from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class SensorEntrada(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id_talhao: int = Field(gt=0)

    tipo_sensor: str = Field(min_length=1, max_length=50)

    identificador_dispositivo: str = Field(
        min_length=1,
        max_length=100
    )

    status_sensor: str = Field(min_length=1, max_length=30)


class SensorSaida(SensorEntrada):
    id_sensor: int
    data_instalacao_sensor: datetime
    data_ultima_comunicacao: datetime | None = None
