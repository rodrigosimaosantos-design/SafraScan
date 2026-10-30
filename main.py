from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from routes.cultura import router as cultura_router
from routes.usuario import router as usuario_router
from routes.grandeza_fisica import router as grandeza_fisica_router
from routes.propriedade import router as propriedade_router
from routes.talhao import router as talhao_router

app = FastAPI(
    title="SafraScan API",
    description="Backend do projeto SafraScan",
    version="0.1.0",
)


# O front-end também pode ser aberto por um servidor de desenvolvimento
# (por exemplo, o Live Server). Quando ele é servido pelo próprio FastAPI,
# as requisições são de mesma origem e não dependem de CORS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


BACKEND_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BACKEND_DIR.parent / "frontend"
INDEX_FILE = FRONTEND_DIR / "templates" / "index.html"

app.mount(
    "/frontend",
    StaticFiles(directory=FRONTEND_DIR),
    name="frontend",
)
app.mount(
    "/css",
    StaticFiles(directory=FRONTEND_DIR / "css"),
    name="css",
)
app.mount(
    "/js",
    StaticFiles(directory=FRONTEND_DIR / "js"),
    name="js",
)
# Permite que os arquivos de imagem usados pelos HTMLs sejam abertos em /img/...
# Exemplo: ../img/safra_logo_pricipal.svg, dentro de /login.html, vira /img/... .
app.mount(
    "/img",
    StaticFiles(directory=FRONTEND_DIR / "img"),
    name="img",
)

app.include_router(cultura_router)
app.include_router(usuario_router)
app.include_router(grandeza_fisica_router)
app.include_router(propriedade_router)
app.include_router(talhao_router)


@app.get("/index.html", include_in_schema=False)
def pagina_inicial():
    return FileResponse(INDEX_FILE)


@app.get("/", tags=["Sistema"])
def raiz():
    return {
        "mensagem": "SafraScan API funcionando!"
    }


@app.get("/api/health", tags=["Sistema"])
def verificar_api():
    return {
        "mensagem": "SafraScan API funcionando!"
    }


# Esta montagem fica por último para não esconder as rotas da API acima.
# Ela entrega qualquer página HTML da pasta "templates" pelo seu próprio nome,
# como /login.html, /config.html e /sobre.html.
app.mount(
    "/",
    StaticFiles(directory=FRONTEND_DIR / "templates", html=False),
    name="templates",
)
