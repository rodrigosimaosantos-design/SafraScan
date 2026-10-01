#CULTURA

@router.get("/culturas", response_model=list[CulturaResponse])
def listar_culturas(db: Session = Depends(get_db)):
    return db.query(Cultura).all()


@router.post(
    "/",
    response_model=CulturaResponse,
    status_code=status.HTTP_201_CREATED
)
def criar_cultura(dados: CulturaCreate, db: Session = Depends(get_db)):
    cultura = Cultura(
        nome=dados.nome,
        descricao=dados.descricao
    )
    db.add(cultura)
    db.commit()
    db.refresh(cultura)
    return cultura


#USUARIO

@router.get("/usuarios", response_model=list[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.query(Usuario).all()
