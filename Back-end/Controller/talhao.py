from fastapi import APIRouter, HTTPException, Response, status
from database import supabase
from models.talhao import TalhaoEntrada, TalhaoSaida

router = APIRouter(prefix="/talhao", tags=["Talhao"])


# Cadastrar um talhão.
@router.post(
    "",
    response_model=TalhaoSaida,
    status_code=status.HTTP_201_CREATED
)
def cadastrar_talhao(dados: TalhaoEntrada):
    conteudo = dados.model_dump(mode="json")

    resposta = (
        supabase.table("talhao")
        .insert(conteudo)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=502,
            detail="O Supabase não retornou o talhão cadastrado.",
        )

    return resposta.data[0]


# Listar todos os talhões.
@router.get("", response_model=list[TalhaoSaida])
def listar_talhoes():
    resposta = (
        supabase.table("talhao")
        .select("*")
        .order("id_talhao")
        .execute()
    )

    return resposta.data


# Consultar um talhão pelo ID.
@router.get("/{id_talhao}", response_model=TalhaoSaida)
def consultar_talhao(id_talhao: int):
    resposta = (
        supabase.table("talhao")
        .select("*")
        .eq("id_talhao", id_talhao)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=404,
            detail="Talhão não encontrado."
        )

    return resposta.data[0]


# Atualizar um talhão.
@router.put("/{id_talhao}", response_model=TalhaoSaida)
def atualizar_talhao(
    id_talhao: int,
    dados: TalhaoEntrada
):
    conteudo = dados.model_dump(mode="json")

    resposta = (
        supabase.table("talhao")
        .update(conteudo)
        .eq("id_talhao", id_talhao)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=404,
            detail="Talhão não encontrado."
        )

    return resposta.data[0]


# Excluir um talhão.
@router.delete(
    "/{id_talhao}",
    status_code=status.HTTP_204_NO_CONTENT
)
def excluir_talhao(id_talhao: int):
    resposta = (
        supabase.table("talhao")
        .delete()
        .eq("id_talhao", id_talhao)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=404,
            detail="Talhão não encontrado."
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)