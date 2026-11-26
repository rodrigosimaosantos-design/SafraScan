import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from database import supabase as db_client
from httpx import RequestError
from postgrest.exceptions import APIError
from controller.cultura import router as cultura_router
from controller.usuario import router as usuario_router
from controller.grandeza_fisica import router as grandeza_router
from controller.propriedade import router as propriedade_router
from controller.talhao import router as talhao_router
from controller.sensor import router as sensores_router
from controller.plantio import router as plantio_router
from controller.leitura_sensor import router as leitura_sensor_router
from controller.auth import router as auth_router

logger = logging.getLogger("uvicorn.error")
app = FastAPI(
    title="Safrascan Backend",
    description="CRUD com Supabase por HTTPS.",
)

# Depois de app = FastAPI(...):
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
)


app.include_router(cultura_router)
app.include_router(usuario_router)
app.include_router(grandeza_router)
app.include_router(propriedade_router)
app.include_router(talhao_router)
app.include_router(sensores_router)
app.include_router(plantio_router)
app.include_router(leitura_sensor_router)
app.include_router(auth_router)

@app.exception_handler(APIError)
async def tratar_erro_supabase(request: Request, erro: APIError):
    logger.error("Erro na operação do Supabase: %s", erro)
    return JSONResponse(
        status_code=502,
        content={"detail": (
            "O Supabase recusou a operação. "
            "Confira a mensagem no terminal."
        )},
    )

@app.exception_handler(RequestError)
async def tratar_erro_rede(request: Request, erro: RequestError):
    logger.error("Falha de comunicação: %s", type(erro).__name__)
    return JSONResponse(
        status_code=503,
        content={"detail": (
            "Não foi possível acessar o Supabase. "
            "Verifique a conexão com a internet."
        )},
    )


# Verifica a comunicação com o banco Supabase.
@app.get("/api/health")
def verificar_saude():
    db_client.table("cultura").select("id_cultura").limit(1).execute()
    return {"mensagem": "API e banco de dados conectados.", "api": "ok", "database": "ok"}

@app.middleware("http")
async def revalidar_estaticos(request, call_next):
    resposta = await call_next(request)
    if request.url.path == "/" or request.url.path.endswith((".html", ".css", ".js")):
        resposta.headers["Cache-Control"] = "no-cache"
    return resposta

# O mesmo FastAPI entrega o frontend e a API, evitando problemas de CORS.
# Os mounts são registrados depois das rotas para não interceptar os endpoints.
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

app.mount("/css", StaticFiles(directory=FRONTEND_DIR / "css"), name="css")
app.mount("/js", StaticFiles(directory=FRONTEND_DIR / "js"), name="js")
app.mount("/img", StaticFiles(directory=FRONTEND_DIR / "img"), name="img")
app.mount("/", StaticFiles(directory=FRONTEND_DIR / "templates", html=True), name="frontend")
