from fastapi import FastAPI

from routes.cultura import router as cultura_router
from routes.usuario import router as usuario_router
from routes.grandeza_fisica import router as grandeza_fisica_router

app = FastAPI(
    title="SafraScan API",
    description="Backend do projeto SafraScan",
    version="0.1.0",
)

app.include_router(cultura_router)
app.include_router(usuario_router)
app.include_router(grandeza_fisica_router)


@app.get("/")
def raiz():
    return {
        "mensagem": "SafraScan API funcionando!"
    }