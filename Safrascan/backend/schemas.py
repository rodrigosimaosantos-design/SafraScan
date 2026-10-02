from pydantic import BaseModel, ConfigDict


# =========================
# USUARIO
# =========================

class UsuarioCreate(BaseModel):
    nome_usuario: str
    email_usuario: str
    telefone_usuario: str
    senha_hash: str
    tipo_usuario: str
    ativo_usuario: bool = True


class UsuarioResponse(BaseModel):
    id_usuario: int
    nome_usuario: str
    email_usuario: str
    telefone_usuario: str
    tipo_usuario: str
    data_cadastro: str
    ativo_usuario: bool

    model_config = ConfigDict(from_attributes=True)


# =========================
# CULTURA
# =========================

class CulturaCreate(BaseModel):
    nome_cultura: str
    ciclo_medio_dias: int


class CulturaResponse(CulturaCreate):
    id_cultura: int

    model_config = ConfigDict(from_attributes=True)