
from fastapi import APIRouter, HTTPException, Response, status

from database import supabase
from models.leitura_sensor import (
    LeituraSensorEntrada,
    LeituraSensorSaida
)

router = APIRouter(
    prefix="/leitura_sensor",
    tags=["Leitura Sensor"]
)


# Cadastrar leitura
@router.post(
    "",
    response_model=LeituraSensorSaida,
    status_code=status.HTTP_201_CREATED
)
def cadastrar_leitura(dados: LeituraSensorEntrada):

    conteudo = dados.model_dump(
        mode="json",
        exclude_none=True
    )

    resposta = (
        supabase.table("leitura_sensor")
        .insert(conteudo)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=502,
            detail="O Supabase não retornou a leitura cadastrada."
        )

    return resposta.data[0]


# Listar leituras
@router.get(
    "",
    response_model=list[LeituraSensorSaida]
)
def listar_leituras():

    resposta = (
        supabase.table("leitura_sensor")
        .select("*")
        .order("id_leitura")
        .execute()
    )

    return resposta.data


# Consultar leitura pelo ID
@router.get(
    "/{id_leitura}",
    response_model=LeituraSensorSaida
)
def consultar_leitura(id_leitura: int):

    resposta = (
        supabase.table("leitura_sensor")
        .select("*")
        .eq("id_leitura", id_leitura)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=404,
            detail="Leitura não encontrada."
        )

    return resposta.data[0]


# Atualizar leitura
@router.put(
    "/{id_leitura}",
    response_model=LeituraSensorSaida
)
def atualizar_leitura(
    id_leitura: int,
    dados: LeituraSensorEntrada
):

    conteudo = dados.model_dump(
        mode="json",
        exclude_none=True
    )

    resposta = (
        supabase.table("leitura_sensor")
        .update(conteudo)
        .eq("id_leitura", id_leitura)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=404,
            detail="Leitura não encontrada."
        )

    return resposta.data[0]


# Excluir leitura
@router.delete(
    "/{id_leitura}",
    status_code=status.HTTP_204_NO_CONTENT
)
def excluir_leitura(id_leitura: int):

    resposta = (
        supabase.table("leitura_sensor")
        .delete()
        .eq("id_leitura", id_leitura)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=404,
            detail="Leitura não encontrada."
        )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )
