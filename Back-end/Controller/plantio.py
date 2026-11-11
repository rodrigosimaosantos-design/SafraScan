from fastapi import APIRouter, HTTPException, Response, status
from database import supabase
from models.plantio import PlantioEntrada, PlantioSaida

router = APIRouter(prefix="/plantio", tags=["Plantio"])


# Cadastrar plantio
@router.post(
    "",
    response_model=PlantioSaida,
    status_code=status.HTTP_201_CREATED
)
def cadastrar_plantio(dados: PlantioEntrada):
    conteudo = dados.model_dump(mode="json")

    resposta = (
        supabase.table("plantio")
        .insert(conteudo)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=502,
            detail="O Supabase não retornou o plantio cadastrado."
        )

    return resposta.data[0]


# Listar plantios
@router.get("", response_model=list[PlantioSaida])
def listar_plantios():
    resposta = (
        supabase.table("plantio")
        .select("*")
        .order("id_plantio")
        .execute()
    )

    return resposta.data


# Consultar plantio pelo ID
@router.get("/{id_plantio}", response_model=PlantioSaida)
def consultar_plantio(id_plantio: int):
    resposta = (
        supabase.table("plantio")
        .select("*")
        .eq("id_plantio", id_plantio)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=404,
            detail="Plantio não encontrado."
        )

    return resposta.data[0]


# Atualizar plantio
@router.put("/{id_plantio}", response_model=PlantioSaida)
def atualizar_plantio(
    id_plantio: int,
    dados: PlantioEntrada
):
    conteudo = dados.model_dump(mode="json")

    resposta = (
        supabase.table("plantio")
        .update(conteudo)
        .eq("id_plantio", id_plantio)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=404,
            detail="Plantio não encontrado."
        )

    return resposta.data[0]


# Excluir plantio
@router.delete(
    "/{id_plantio}",
    status_code=status.HTTP_204_NO_CONTENT
)
def excluir_plantio(id_plantio: int):
    resposta = (
        supabase.table("plantio")
        .delete()
        .eq("id_plantio", id_plantio)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=404,
            detail="Plantio não encontrado."
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)

