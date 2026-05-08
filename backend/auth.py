from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

SECRET_KEY = "change-me-in-production"
ALGORITHM = "HS256"
TOKEN_EXPIRY_HOURS = 8


def hash_senha(senha: str) -> str:
    return bcrypt.hashpw(senha.encode(), bcrypt.gensalt()).decode()


def verificar_senha(senha: str, hash: str) -> bool:
    return bcrypt.checkpw(senha.encode(), hash.encode())


def criar_token(usuario_id: int, login: str) -> str:
    payload = {
        "sub": str(usuario_id),
        "login": login,
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRY_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decodificar_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
