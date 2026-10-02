from sqlalchemy import Integer, String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from database import Base
import datetime


# =========================
# CULTURA
# =========================

class Cultura(Base):
    __tablename__ = "cultura"

    id_cultura: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    nome_cultura: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    ciclo_medio_dias: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )


# =========================
# USUARIO
# =========================

class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    nome_usuario: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    email_usuario: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        unique=True
    )

    telefone_usuario: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    senha_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    tipo_usuario: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    data_cadastro: Mapped[datetime.datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    ativo_usuario: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True
    )