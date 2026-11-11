
from fastapi import APIRouter, HTTPException, Response, status

from database import supabase
from models.sensor import SensorEntrada, SensorSaida


router = APIRouter(
    prefix="/sensores",
    tags=["Sensores"]
)


# Verificar se o talhão existe.
def validar_talhao(id_talhao: int):

    resposta = (
        supabase.table("talhao")
        .select("id_talhao")
        .eq("id_talhao", id_talhao)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=400,
            detail="Talhão não encontrado. Consulte um talhão cadastrado."
        )


# Cadastrar sensor.
@router.post(
    "",
    response_model=SensorSaida,
    status_code=status.HTTP_201_CREATED
)
def cadastrar_sensor(dados: SensorEntrada):

    validar_talhao(dados.id_talhao)

    resposta = (
        supabase.table("sensor")
        .insert(dados.model_dump(mode="json"))
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=502,
            detail="O Supabase não retornou o sensor cadastrado."
        )

    return resposta.data[0]


# Listar todos os sensores.
@router.get(
    "",
    response_model=list[SensorSaida]
)
def listar_sensores():

    resposta = (
        supabase.table("sensor")
        .select("*")
        .order("id_sensor")
        .execute()
    )

    return resposta.data


# Consultar sensor pelo ID.
@router.get(
    "/{id_sensor}",
    response_model=SensorSaida
)
def consultar_sensor(id_sensor: int):

    resposta = (
        supabase.table("sensor")
        .select("*")
        .eq("id_sensor", id_sensor)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=404,
            detail="Sensor não encontrado."
        )

    return resposta.data[0]


# Atualizar sensor.
@router.put(
    "/{id_sensor}",
    response_model=SensorSaida
)
def atualizar_sensor(
    id_sensor: int,
    dados: SensorEntrada
):

    # Verificar se o sensor existe.
    consultar_sensor(id_sensor)

    # Verificar se o novo talhão existe.
    validar_talhao(dados.id_talhao)

    resposta = (
        supabase.table("sensor")
        .update(dados.model_dump(mode="json"))
        .eq("id_sensor", id_sensor)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=404,
            detail="Sensor não encontrado."
        )

    return resposta.data[0]


# Excluir sensor.
@router.delete(
    "/{id_sensor}",
    status_code=status.HTTP_204_NO_CONTENT
)
def excluir_sensor(id_sensor: int):

    resposta = (
        supabase.table("sensor")
        .delete()
        .eq("id_sensor", id_sensor)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=404,
            detail="Sensor não encontrado."
        )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )
