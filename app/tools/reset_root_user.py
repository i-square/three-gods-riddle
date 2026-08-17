"""Administrative helper to reset the built-in root user."""

import argparse
import os
import sqlite3

import bcrypt


def _resolve_database_path() -> str:
    database_url = os.getenv("DATABASE_URL", "sqlite:///database.db")
    sqlite_prefix = "sqlite:///"

    if database_url.startswith(sqlite_prefix):
        # sqlite:///absolute_path
        if database_url.startswith("sqlite:////"):
            return database_url[len("sqlite:////") - 1 :]

        # sqlite:///relative_path
        path = database_url[len(sqlite_prefix) :]
        return path if path else "/app/data/database.db"

    raise ValueError(f"Unsupported database URL: {database_url}")


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def reset_root(password: str, database_path: str) -> tuple[str, bool]:
    conn = sqlite3.connect(database_path)
    cur = conn.cursor()

    hashed_password = _hash_password(password)

    cur.execute(
        "INSERT INTO user (id, hashed_password, is_admin, must_change_password, tutorial_completed, is_disabled, created_at) "
        "VALUES (:id, :hashed_password, 1, 1, 0, 0, CURRENT_TIMESTAMP) "
        "ON CONFLICT(id) DO UPDATE SET hashed_password=excluded.hashed_password, must_change_password=1, is_admin=1",
        {
            "id": "root",
            "hashed_password": hashed_password,
        },
    )
    conn.commit()

    row = cur.execute(
        "SELECT is_admin, must_change_password FROM user WHERE id='root'"
    ).fetchone()
    conn.close()

    return row


def main() -> int:
    parser = argparse.ArgumentParser(description="Reset root account password")
    parser.add_argument(
        "--password",
        default=os.getenv("ROOT_PASSWORD", "change_me_on_first_login"),
        help="Password to set for root account. Defaults to ROOT_PASSWORD env value.",
    )
    parser.add_argument(
        "--db-path",
        default=None,
        help="SQLite database path. Defaults to DATABASE_URL in env.",
    )

    args = parser.parse_args()

    database_path = args.db_path or _resolve_database_path()

    is_admin, must_change_password = reset_root(args.password, database_path)

    print(f"Reset root user with database={database_path}")
    print(f"is_admin={bool(is_admin)} must_change_password={bool(must_change_password)}")
    print("Done.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
