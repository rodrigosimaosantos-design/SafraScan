from fastapi import APIRouter, HTTPException, Response, status

from database import supabase
from models.propriedade import PropriedadeEntrada, PropriedadeSaida

router = APIRouter(prefix="/propriedade", tags=["Propriedade"])

# O relacionamento permite buscar o nome na tabela clientes.
COLUNAS = (
    "id_propriedade, nome_propriedade, endereco_propriedade, municipio_propriedade, estado_propriedade,  cep_propriedade, tamanho_ha, id_usuario, "
    "usuario:usuario(nome_usuario)"
)


def validar_usuario(id_usuario: int):
    resposta = (
        supabase.table("usuario")
        .select("id_usuario, nome_usuario")
        .eq("id_usuario", id_usuario)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=400,
            detail="Propriedade não encontrada. Consulte um usuário cadastrado.",
        )

def preparar_saida(registro):
    # O Supabase devolve o nome dentro do objeto cliente.
    usuario = registro.get("usuario")
    if not usuario:
        raise HTTPException(
            status_code=502,
            detail="Não foi possível consultar o usuário da propriedade.",
        )
    return {
        "id_propriedade": registro["id_propriedade"],
        "nome_propriedade": registro["nome_propriedade"],
        "endereco_propriedade": registro["endereco_propriedade"],
        "municipio_propriedade": registro["municipio_propriedade"],
        "estado_propriedade": registro["estado_propriedade"],
        "cep_propriedade": registro["cep_propriedade"],
        "tamanho_ha": registro["tamanho_ha"],
        "id_usuario": registro["id_usuario"],
        "nome_usuario": usuario["nome_usuario"],
    }

def buscar_propriedade(id_propriedade: int):
    resposta = (
        supabase.table("propriedade")
        .select(COLUNAS)
        .eq("id_propriedade", id_propriedade)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "Propriedade não encontrada.")
    return preparar_saida(resposta.data[0])

@router.post("", response_model=PropriedadeSaida, status_code=201)
def cadastrar_propriedade(dados: PropriedadeEntrada):
    validar_usuario(dados.id_usuario)
    resposta = (
        supabase.table("propriedade")
        .insert(dados.model_dump(mode="json"))
        .execute()
    )
    if not resposta.data:
        raise HTTPException(502, "O Supabase não retornou a propriedade cadastrada.")
    id_novo = resposta.data[0]["id_propriedade"]
    return buscar_propriedade(id_novo)

@router.get("", response_model=list[PropriedadeSaida])
def listar_propriedades():
    resposta = (
        supabase.table("propriedade")
        .select(COLUNAS)
        .order("id_propriedade")
        .execute()
    )
    return [preparar_saida(registro) for registro in resposta.data]


@router.get("/{id_propriedade}", response_model=PropriedadeSaida)
def consultar_propriedade(id_propriedade: int):
    return buscar_propriedade(id_propriedade)

@router.put("/{id_propriedade}", response_model=PropriedadeSaida)
def atualizar_propriedade(id_propriedade: int, dados: PropriedadeEntrada):
    buscar_propriedade(id_propriedade)
    validar_usuario(dados.id_usuario)
    resposta = (
        supabase.table("propriedade")
        .update(dados.model_dump(mode="json"))
        .eq("id_propriedade", id_propriedade)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "Propriedade não encontrada.")
    return buscar_propriedade(id_propriedade)

@router.delete("/{id_propriedade}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_propriedade(id_propriedade: int):
    resposta = (
        supabase.table("propriedade")
        .delete()
        .eq("id_propriedade", id_propriedade)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(404, "Propriedade não encontrada.")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
