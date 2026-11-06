from fastapi import APIRouter, HTTPException, Response, status
from database import supabase
from models.grandeza_fisica import GrandezaEntrada, GrandezaSaida

router = APIRouter(prefix="/grandeza_fisica", tags=["Grandeza Fisica"])

# Cadastrar: o banco gera o ID.
@router.post("", response_model=GrandezaSaida,
             status_code=status.HTTP_201_CREATED)
def cadastrar_grandeza(dados: GrandezaEntrada):
    conteudo = dados.model_dump(mode="json")
    resposta = (
        supabase.table("grandeza_fisica")
        .insert(conteudo)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=502,
            detail="O Supabase não retornou a grandeza cadastrada.",
        )
    return resposta.data[0]

# Listar os registros acessíveis, ordenados pelo ID.
@router.get("", response_model=list[GrandezaSaida])
def listar_grandezas():
    resposta = (
        supabase.table("grandeza_fisica")
        .select("*")
        .order("id_grandeza")
        .execute()
    )
    return resposta.data

@router.get("/{id_grandeza}", response_model=GrandezaSaida)
def consultar_grandeza(id_grandeza: int):
    resposta = (
        supabase.table("grandeza_fisica")
        .select("*")
        .eq("id_grandeza", id_grandeza)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "Grandeza Física não encontrada.")
    return resposta.data[0]

@router.put("/{id_grandeza}", response_model=GrandezaSaida)
def atualizar_grandeza(id_grandeza: int, dados: GrandezaEntrada):
    conteudo = dados.model_dump(mode="json")
    resposta = (
        supabase.table("grandeza_fisica")
        .update(conteudo)
        .eq("id_grandeza", id_grandeza)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "Grandeza Física não encontrada.")
    return resposta.data[0]

@router.delete("/{id_grandeza}",
               status_code=status.HTTP_204_NO_CONTENT)
def excluir_grandeza(id_grandeza: int):
    resposta = (
        supabase.table("grandeza_fisica")
        .delete()
        .eq("id_grandeza", id_grandeza)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "Grandeza Física não encontrada.")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
