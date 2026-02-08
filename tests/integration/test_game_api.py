"""
Integration tests for game API endpoints.
"""

import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
class TestGameEndpoints:
    """Test game-related API endpoints."""

    def test_start_game(self, client: TestClient, auth_headers: dict):
        """Test starting a new game."""
        response = client.post("/game/start", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert "message" in data

    def test_start_game_unauthorized(self, client: TestClient):
        """Test starting game without authentication."""
        response = client.post("/game/start")
        assert response.status_code == 401

    def test_ask_question(self, client: TestClient, auth_headers: dict):
        """Test asking a question to a god."""
        # Start game first
        start_response = client.post("/game/start", headers=auth_headers)
        session_id = start_response.json()["session_id"]

        # Ask question
        response = client.post(
            "/game/ask",
            headers=auth_headers,
            json={
                "session_id": session_id,
                "god_index": 0,
                "question": "Are you the God of Truth?",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        assert "questions_left" in data
        assert data["questions_left"] == 2


@pytest.mark.integration
class TestHealthEndpoints:
    """Test health check endpoints."""

    def test_health_check(self, client: TestClient):
        """Test basic health check."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "version" in data

    def test_readiness_check(self, client: TestClient):
        """Test readiness check."""
        response = client.get("/readiness")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "checks" in data
        assert "database" in data["checks"]
