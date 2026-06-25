from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # em produção, troque "*" pelo domínio do seu front
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Caminho absoluto do arquivo index.html
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INDEX_FILE = os.path.join(BASE_DIR, "index.html")

@app.get("/")
def abrir_index():
    return FileResponse(INDEX_FILE)