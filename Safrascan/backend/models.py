from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, func

from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Cultura(Base):
    __tablename__ = "cultura"

    id_cultura: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    nome_cultura: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    ciclo_medio_dias: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )


class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    nome_usuario: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    email_usuario: Mapped[str] = mapped_column(
        String
    )

    telefone_usuario: Mapped[str] = mapped_column(
        String
    )

    senha_hash: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    tipo_usuario: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    data_cadastro: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    nullable=False,
    server_default=func.current_timestamp()
    )

    ativo_usuario: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False
    )


class GrandezaFisica(Base):
    __tablename__ = "grandeza_fisica"

    id_grandeza: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    nome_grandeza: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    unidade_medida: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    descricao_grandeza: Mapped[str] = mapped_column(
        String,
        nullable=False
    )