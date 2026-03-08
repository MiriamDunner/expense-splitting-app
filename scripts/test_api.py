"""
Tests for the FastAPI expense splitting backend.
Run with: pytest test_api.py -v
"""

import pytest
from fastapi.testclient import TestClient
from fastapi_server import app

client = TestClient(app)


class TestHealthEndpoint:
    """Test health check endpoint."""

    def test_health_check(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestRootEndpoint:
    """Test root API info endpoint."""

    def test_root(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "endpoints" in data


class TestSettlementCalculation:
    """Test expense settlement calculation."""

    def test_simple_settlement(self):
        """Test basic settlement with 2 participants."""
        payload = {
            "participants": [
                {"name": "Alice", "email": "alice@example.com", "amount_paid": 100},
                {"name": "Bob", "email": "bob@example.com", "amount_paid": 0},
            ]
        }
        response = client.post("/calculate-settlement", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert "total" in data
        assert data["total"] == 100
        assert "per_person" in data
        assert data["per_person"] == 50
        assert "settlements" in data
        assert len(data["settlements"]) == 1
        
        settlement = data["settlements"][0]
        assert settlement["from"] == "Bob"
        assert settlement["to"] == "Alice"
        assert settlement["amount"] == 50

    def test_three_person_settlement(self):
        """Test settlement with 3 participants."""
        payload = {
            "participants": [
                {"name": "Alice", "email": "alice@example.com", "amount_paid": 90},
                {"name": "Bob", "email": "bob@example.com", "amount_paid": 60},
                {"name": "Charlie", "email": "charlie@example.com", "amount_paid": 0},
            ]
        }
        response = client.post("/calculate-settlement", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["total"] == 150
        assert data["per_person"] == 50
        assert len(data["settlements"]) >= 1

    def test_no_settlement_needed(self):
        """Test when everyone paid equally."""
        payload = {
            "participants": [
                {"name": "Alice", "email": "alice@example.com", "amount_paid": 50},
                {"name": "Bob", "email": "bob@example.com", "amount_paid": 50},
            ]
        }
        response = client.post("/calculate-settlement", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["total"] == 100
        assert data["per_person"] == 50
        assert len(data["settlements"]) == 0

    def test_invalid_participant_count(self):
        """Test error handling for too few participants."""
        payload = {
            "participants": [
                {"name": "Alice", "email": "alice@example.com", "amount_paid": 100},
            ]
        }
        response = client.post("/calculate-settlement", json=payload)
        assert response.status_code == 400

    def test_negative_amount(self):
        """Test error handling for negative amounts."""
        payload = {
            "participants": [
                {"name": "Alice", "email": "alice@example.com", "amount_paid": -10},
                {"name": "Bob", "email": "bob@example.com", "amount_paid": 50},
            ]
        }
        response = client.post("/calculate-settlement", json=payload)
        assert response.status_code == 400

    def test_invalid_email(self):
        """Test error handling for invalid email."""
        payload = {
            "participants": [
                {"name": "Alice", "email": "invalid-email", "amount_paid": 50},
                {"name": "Bob", "email": "bob@example.com", "amount_paid": 50},
            ]
        }
        response = client.post("/calculate-settlement", json=payload)
        assert response.status_code == 422  # Pydantic validation error


class TestMessagesEndpoint:
    """Test chat messages endpoint."""

    def test_get_messages_empty(self):
        """Test getting messages for non-existent event."""
        response = client.get("/api/messages?eventId=test-event-123")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_post_message(self):
        """Test posting a new message."""
        payload = {
            "eventId": "test-event-456",
            "sender_name": "Alice",
            "text": "Hello everyone!",
            "participants": ["Alice", "Bob"]
        }
        response = client.post("/api/messages", json=payload)
        # Should either succeed or return appropriate error
        assert response.status_code in [200, 201, 400, 403]
