from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator

class UsuarioEntrada(BaseModel):
    nome_usuario: str = Field(min_length=1, max_length=150)
    email_usuario: str = Field(
        min_length=5, max_length=150
    )
    telefone_usuario: str = Field(
        min_length=10, max_length=15
    )
    senha_hash: str = Field(min_length=8, max_length=150)
    tipo_usuario: str = Field(min_length=1, max_length=50)
    data_cadastro: datetime = Field(default_factory=datetime.today)
    ativo_usuario: bool = Field(default=True)

    @field_validator("nome_usuario")
    @classmethod
    def validar_nome(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError(
                "O nome do usuário não pode ficar vazio."
            )
        return valor

class UsuarioSaida(UsuarioEntrada):
    id_usuario: int

