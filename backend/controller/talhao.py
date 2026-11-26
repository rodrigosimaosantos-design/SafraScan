
from fastapi import (
    APIRouter,
    HTTPException,
    Response,
    Path,
    status
)

from database import supabase

from models.talhao import (
    TalhaoEntrada,
    TalhaoSaida
)


router = APIRouter(
    prefix="/talhao",
    tags=["Talhao"]
)


# ============================================================
# VALIDAR PROPRIEDADE
# ============================================================

def validar_propriedade(id_propriedade: int):

    propriedade = (
        supabase.table("propriedade")
        .select("id_propriedade")
        .eq("id_propriedade", id_propriedade)
        .limit(1)
        .execute()
    )

    if not propriedade.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="A propriedade informada não existe."
        )


# ============================================================
# CADASTRAR TALHAO
# ============================================================

@router.post(
    "",
    response_model=TalhaoSaida,
    status_code=status.HTTP_201_CREATED
)
def cadastrar_talhao(dados: TalhaoEntrada):

    # Verificar se a propriedade existe.
    validar_propriedade(dados.id_propriedade)

    # Converter os dados para formato JSON.
    conteudo = dados.model_dump(mode="json")

    resposta = (
        supabase.table("talhao")
        .insert(conteudo)
        .select("*")
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="O Supabase não retornou o talhão cadastrado."
        )

    return resposta.data[0]


# ============================================================
# LISTAR TODOS OS TALHOES
# ============================================================

@router.get(
    "",
    response_model=list[TalhaoSaida]
)
def listar_talhoes():

    resposta = (
        supabase.table("talhao")
        .select("*")
        .order("id_talhao")
        .execute()
    )

    print("Dados retornados pelo Supabase:")
    print(resposta.data)

    return resposta.data


# ============================================================
# CONSULTAR TALHAO PELO ID
# ============================================================

@router.get(
    "/{id_talhao}",
    response_model=TalhaoSaida
)
def consultar_talhao(
    id_talhao: int = Path(gt=0)
):

    resposta = (
        supabase.table("talhao")
        .select("*")
        .eq("id_talhao", id_talhao)
        .limit(1)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Talhão não encontrado."
        )

    return resposta.data[0]


# ============================================================
# ATUALIZAR TALHAO
# ============================================================

@router.put(
    "/{id_talhao}",
    response_model=TalhaoSaida
)
def atualizar_talhao(
    id_talhao: int = Path(gt=0),
    dados: TalhaoEntrada = ...
):

    # Verificar se o talhão existe.
    talhao_existente = (
        supabase.table("talhao")
        .select("id_talhao")
        .eq("id_talhao", id_talhao)
        .limit(1)
        .execute()
    )

    if not talhao_existente.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Talhão não encontrado."
        )

    # Verificar se a propriedade existe.
    validar_propriedade(dados.id_propriedade)

    conteudo = dados.model_dump(mode="json")

    resposta = (
        supabase.table("talhao")
        .update(conteudo)
        .eq("id_talhao", id_talhao)
        .select("*")
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Não foi possível atualizar o talhão."
        )

    return resposta.data[0]


# ============================================================
# EXCLUIR TALHAO
# ============================================================

@router.delete(
    "/{id_talhao}",
    status_code=status.HTTP_204_NO_CONTENT
)
def excluir_talhao(
    id_talhao: int = Path(gt=0)
):

    # Verificar se o talhão existe.
    talhao_existente = (
        supabase.table("talhao")
        .select("id_talhao")
        .eq("id_talhao", id_talhao)
        .limit(1)
        .execute()
    )

    if not talhao_existente.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Talhão não encontrado."
        )

    # Verificar sensores vinculados.
    sensores = (
        supabase.table("sensor")
        .select("id_sensor")
        .eq("id_talhao", id_talhao)
        .limit(1)
        .execute()
    )

    if sensores.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Não é possível excluir este talhão, "
                "pois existem sensores vinculados a ele."
            )
        )

    # Verificar plantios vinculados.
    plantios = (
        supabase.table("plantio")
        .select("id_plantio")
        .eq("id_talhao", id_talhao)
        .limit(1)
        .execute()
    )

    if plantios.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Não é possível excluir este talhão, "
                "pois existem plantios vinculados a ele."
            )
        )

    # Excluir talhão.
    supabase.table("talhao").delete().eq(
        "id_talhao", id_talhao
    ).execute()

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )
