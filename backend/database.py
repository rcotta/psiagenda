import re
import sqlite3
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(__file__).parent / "data/psiagenda.db"
SQL_DIR = Path(__file__).parent / "sql"


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
    except Exception:
        conn.rollback()
        raise
    else:
        conn.commit()
    finally:
        conn.close()


def load_queries(filename: str) -> dict[str, str]:
    """Carrega queries nomeadas de um arquivo .sql.

    Formato esperado no arquivo:
        -- [nome_da_query]
        SELECT ...;
    """
    text = (SQL_DIR / filename).read_text(encoding="utf-8")
    queries: dict[str, str] = {}
    current_name: str | None = None
    current_lines: list[str] = []

    for line in text.splitlines():
        match = re.match(r"--\s*\[(\w+)\]", line)
        if match:
            if current_name:
                queries[current_name] = "\n".join(current_lines).strip()
            current_name = match.group(1)
            current_lines = []
        elif current_name is not None:
            current_lines.append(line)

    if current_name:
        queries[current_name] = "\n".join(current_lines).strip()

    return queries


def init_db() -> None:
    schema = (SQL_DIR / "schema.sql").read_text(encoding="utf-8")
    with get_db() as conn:
        conn.executescript(schema)
