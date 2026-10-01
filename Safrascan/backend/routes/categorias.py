#CULTURA

@router.get("/culturas", response_model=list[CulturaResponse])
def listar_culturas(db: Session = Depends(get_db)):
    return db.query(Cultura).all()

#USUARIO

@router.get("/usuarios", response_model=list[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.query(Usuario).all()
