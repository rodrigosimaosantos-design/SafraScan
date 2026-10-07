from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CulturaCreate(BaseModel):
    nome_cultura: str
    ciclo_medio_dias: int | None = None


class CulturaResponse(CulturaCreate):
    id_cultura: int

    model_config = ConfigDict(
        from_attributes=True
    )


class UsuarioCreate(BaseModel):
    nome_usuario: str
    email_usuario: str
    telefone_usuario: str
    senha_hash: str
    tipo_usuario: str
    ativo_usuario: bool = True


class UsuarioResponse(UsuarioCreate):
    id_usuario: int
    data_cadastro: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class GrandezaFisicaCreate(BaseModel):
    nome_grandeza: str
    unidade_medida: str
    descricao_grandeza: str


class GrandezaFisicaResponse(GrandezaFisicaCreate):
    id_grandeza: int

    model_config = ConfigDict(
        from_attributes=True
    )