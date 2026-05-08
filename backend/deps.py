import jwt as pyjwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from auth import decodificar_token

bearer = HTTPBearer()


def get_usuario_atual(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> dict:
    try:
        payload = decodificar_token(credentials.credentials)
        return {"id": int(payload["sub"]), "login": payload["login"]}
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")
