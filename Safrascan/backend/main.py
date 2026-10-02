from fastapi import FastAPI

from routes.cultura import router as cultura_router


app = FastAPI(
    title="SafraScan API",
    description="API do projeto SafraScan",
    version="1.0.0"
)


app.include_router(cultura_router)


@app.get("/")
def inicio():
    return {
        "mensagem": "API SafraScan funcionando!"
    }