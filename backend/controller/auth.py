import base64
import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, HTTPException, status

from database import supabase
from models.auth import CadastroEntrada, LoginEntrada, LoginSaida, UsuarioAutenticado

router = APIRouter(prefix="/auth", tags=["Autenticação"])

JWT_SECRET = os.getenv("JWT_SECRET_KEY") or secrets.token_urlsafe(48)
JWT_ALGORITHM = "HS256"


def gerar_hash(senha: str) -> str:
    salt = secrets.token_bytes(16)
    derivada = hashlib.scrypt(senha.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
    return "scrypt${}${}${}".format(
        base64.urlsafe_b64encode(salt).decode(),
        base64.urlsafe_b64encode(derivada).decode(),
        "16384"
    )


def verificar_senha(senha: str, senha_hash: str) -> bool:
    try:
        algoritmo, salt_b64, hash_b64, _n = senha_hash.split("$")
        if algoritmo != "scrypt":
            return False
        salt = base64.urlsafe_b64decode(salt_b64.encode())
        esperado = base64.urlsafe_b64decode(hash_b64.encode())
        calculado = hashlib.scrypt(senha.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
        return hmac.compare_digest(calculado, esperado)
    except (ValueError, TypeError):
        return False


@router.post("/cadastro", status_code=status.HTTP_201_CREATED)
def cadastrar(dados: CadastroEntrada):
    email = dados.email_usuario.strip().lower()
    existente = (
        supabase.table("usuario").select("id_usuario")
        .eq("email_usuario", email).execute()
    )
    if existente.data:
        raise HTTPException(status_code=409, detail="Este e-mail já está cadastrado.")

    registro = {
        "nome_usuario": dados.nome_usuario.strip(),
        "email_usuario": email,
        "telefone_usuario": dados.telefone_usuario.strip(),
        "senha_hash": gerar_hash(dados.senha),
        "tipo_usuario": dados.tipo_usuario.strip(),
        "ativo_usuario": True,
        "data_cadastro": datetime.now(timezone.utc).isoformat(),
    }
    resposta = supabase.table("usuario").insert(registro).select(
        "id_usuario,nome_usuario,email_usuario,telefone_usuario,tipo_usuario,data_cadastro,ativo_usuario"
    ).execute()
    if not resposta.data:
        raise HTTPException(status_code=502, detail="O banco não retornou o usuário cadastrado.")
    return {"mensagem": "Cadastro realizado com sucesso.", "usuario": resposta.data[0]}


@router.post("/login", response_model=LoginSaida)
def entrar(dados: LoginEntrada):
    email = dados.email_usuario.strip().lower()
    resposta = (
        supabase.table("usuario")
        .select("id_usuario,nome_usuario,email_usuario,tipo_usuario,ativo_usuario,senha_hash")
        .eq("email_usuario", email)
        .limit(1)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

    registro = resposta.data[0]
    if not registro.get("ativo_usuario", True) or not verificar_senha(
        dados.senha, registro.get("senha_hash", "")
    ):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

    agora = datetime.now(timezone.utc)
    token = jwt.encode({
        "sub": str(registro["id_usuario"]),
        "iat": agora,
        "exp": agora + timedelta(hours=8),
    }, JWT_SECRET, algorithm=JWT_ALGORITHM)

    usuario = UsuarioAutenticado(
        id_usuario=registro["id_usuario"],
        nome_usuario=registro["nome_usuario"],
        email_usuario=registro["email_usuario"],
        tipo_usuario=registro["tipo_usuario"],
    )
    return {"access_token": token, "token_type": "bearer", "usuario": usuario}
