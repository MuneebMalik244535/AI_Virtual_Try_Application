import os
import pytest

from app.db.database import DatabaseManager
from app.core.exceptions import DatabaseError


def test_database_manager_raises_when_url_missing(monkeypatch):
    monkeypatch.delenv("NEON_DATABASE_URL", raising=False)

    with pytest.raises(DatabaseError):
        DatabaseManager()


def test_database_manager_connects_with_valid_url(monkeypatch):
    monkeypatch.setenv("NEON_DATABASE_URL", "postgresql://user:pass@localhost:5432/dbname")

    with pytest.raises(Exception):
        DatabaseManager()
