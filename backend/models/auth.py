from pydantic import BaseModel, EmailStr, Field

class CadastroEntrada(BaseModel):
    nome_usuario: str = Field(min_length=1, max_length=150)
    email_usuario: str = Field(min_length=5, max_length=150)
    telefone_usuario: str = Field(min_length=10, max_length=15)
    senha: str = Field(min_length=8, max_length=128)
    tipo_usuario: str = Field(min_length=1, max_length=50)

class LoginEntrada(BaseModel):
    email_usuario: str = Field(min_length=5, max_length=150)
    senha: str = Field(min_length=1, max_length=128)

class UsuarioAutenticado(BaseModel):
    id_usuario: int
    nome_usuario: str
    email_usuario: str
    tipo_usuario: str

class LoginSaida(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioAutenticado
