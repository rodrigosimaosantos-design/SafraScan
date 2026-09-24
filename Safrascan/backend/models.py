from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from database import Base
import datetime


class Cultura(Base):
   __tablename__ = "cultura"


   id_cultura: Mapped[int] = mapped_column(Integer, primary_key=True)
   nome_cultura: Mapped[str] = mapped_column(String, nullable=False)
   ciclo_medio_dias: Mapped[int] = mapped_column(Integer, nullable=True)


class Usuario(Base):
   id_usuario: Mapped[int] = mapped_column(Integer, primary_key=True)
   nome_usuario: Mapped[str] = mapped_column(String, nullable=False)
   email_usuario: Mapped[str] = mapped_column(String)
   telefone_usuario: Mapped[int] = mapped_column(Integer, primary_key=True)
   senha_hash: Mapped[str] = mapped_column(String, nullable=False)
   tipo_usuario: Mapped[str] = mapped_column(String, nullable=False)
   data_cadastro: Mapped[datetime] = mapped_column(datetime) # type: ignore
   ativo_usuario: Mapped[bool] = mapped_column(bool, nullable=False)

