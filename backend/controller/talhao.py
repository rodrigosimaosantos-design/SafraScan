
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
# VALIDAR REFERENCIAS
# ============================================================

def validar_referencias(
    id_propriedade: int,
    id_cultura: int
):
    # Verificar se a propriedade existe.
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

    # Verificar se a cultura existe.
    cultura = (
        supabase.table("cultura")
        .select("id_cultura")
        .eq("id_cultura", id_cultura)
        .limit(1)
        .execute()
    )

    if not cultura.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="A cultura informada não existe."
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

    validar_referencias(
        dados.id_propriedade,
        dados.id_cultura
    )

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
    id_talhao: int,
    dados: TalhaoEntrada
):

    if id_talhao <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O ID do talhão deve ser positivo."
        )

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

    # Validar propriedade e cultura.
    validar_referencias(
        dados.id_propriedade,
        dados.id_cultura
    )

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

    # Verificar se existem sensores vinculados.
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

    # Verificar se existem plantios vinculados.
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

    # Excluir o talhão.
    supabase.table("talhao").delete().eq(
        "id_talhao", id_talhao
    ).execute()

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )
