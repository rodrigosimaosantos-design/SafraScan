from fastapi import FastAPI

from routes.categories import router as categorias_router

app = FastAPI(
    title="API do Projeto Integrador",
    description="Backend FastAPI conectado ao PostgreSQL no Supabase",
    version="0.1.0",
)

# Registra as rotas de categorias em /categorias
app.include_router(categorias_router, prefix="/categorias", tags=["Categorias"])


@app.get("/")
def raiz():
    return {"mensagem": "API funcionando. Acesse /docs para ver as rotas."}
