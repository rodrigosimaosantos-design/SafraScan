from fastapi import APIRouter, HTTPException, Response, status
from database import supabase
from models.cultura import CulturaEntrada, CulturaSaida

router = APIRouter(prefix="/cultura", tags=["Cultura"])

# Cadastrar: o banco gera o ID.
@router.post("", response_model=CulturaSaida,
             status_code=status.HTTP_201_CREATED)
def cadastrar_cultura(dados: CulturaEntrada):
    conteudo = dados.model_dump(mode="json")
    resposta = (
        supabase.table("cultura")
        .insert(conteudo)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=502,
            detail="O Supabase não retornou a cultura cadastrada.",
        )
    return resposta.data[0]

# Listar os registros acessíveis, ordenados pelo ID.
@router.get("", response_model=list[CulturaSaida])
def listar_cultura():
    resposta = (
        supabase.table("cultura")
        .select("*")
        .order("id_cultura")
        .execute()
    )
    return resposta.data

@router.get("/{id_cultura}", response_model=CulturaSaida)
def consultar_cultura(id_cultura: int):
    resposta = (
        supabase.table("cultura")
        .select("*")
        .eq("id_cultura", id_cultura)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "Cultura não encontrada.")
    return resposta.data[0]

@router.put("/{id_cultura}", response_model=CulturaSaida)
def atualizar_cultura(id_cultura: int, dados: CulturaEntrada):
    conteudo = dados.model_dump(mode="json")
    resposta = (
        supabase.table("cultura")
        .update(conteudo)
        .eq("id_cultura", id_cultura)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "Cultura não encontrada.")
    return resposta.data[0]

@router.delete("/{id_cultura}",
               status_code=status.HTTP_204_NO_CONTENT)
def excluir_cultura(id_cultura: int):
    resposta = (
        supabase.table("cultura")
        .delete()
        .eq("id_cultura", id_cultura)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "Cultura não encontrada.")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
