from auth import hash_senha
from database import get_db, init_db, load_queries

Q = load_queries("usuario.sql")

USUARIOS = [
    ("Renata", "renata", "Psi@2026"),
]


def seed():
    init_db()
    with get_db() as conn:
        for nome, login, senha in USUARIOS:
            existe = conn.execute(Q["buscar_por_login"], (login,)).fetchone()
            if existe:
                print(f"Usuário '{login}' já existe, pulando.")
                continue
            conn.execute(Q["criar_usuario"], (nome, login, hash_senha(senha)))
            print(f"Usuário '{login}' criado.")


if __name__ == "__main__":
    seed()
