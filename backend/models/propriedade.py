from datetime import date
from pydantic import BaseModel, ConfigDict, Field
from decimal import Decimal

class PropriedadeEntrada(BaseModel):
    # O cadastro recebe apenas data e ID do cliente escolhido.
    model_config = ConfigDict(extra="forbid")

    id_usuario: int = Field(gt=0)
    nome_propriedade: str
    endereco_propriedade: str
    municipio_propriedade: str
    estado_propriedade: str
    cep_propriedade: int
    tamanho_ha: Decimal


class PropriedadeSaida(PropriedadeEntrada):
    id_propriedade: int
    nome_usuario: str
