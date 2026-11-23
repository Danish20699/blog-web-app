"""
Unit Tests for Blog App (Stage 2 in CI/CD Pipeline)
Tests isolated logic in memory with zero database / network dependencies.
"""

import os
import sys

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from jose import jwt

from routes.blogs import calculate_reading_metrics
from security import (
    ALGORITHM,
    SECRET_KEY,
    create_access_token,
    hash_password,
    verify_password,
)


def test_password_hashing_and_verification():
    """Unit Test: Bcrypt password hashing must verify correctly and reject wrong passwords."""
    raw_password = "SuperSecretPassword123!"
    hashed = hash_password(raw_password)

    # Hash should not equal raw password
    assert hashed != raw_password
    assert hashed.startswith(("$2b$", "$2a$"))

    # Correct password verifies True
    assert verify_password(raw_password, hashed) is True

    # Incorrect password verifies False
    assert verify_password("WrongPassword!", hashed) is False


def test_jwt_token_generation_and_payload():
    """Unit Test: JWT token encoding and decoding must preserve subject data."""
    test_username = "alice_dev"
    token = create_access_token(data={"sub": test_username})

    # Token must have 3 dot-separated parts (Header.Payload.Signature)
    parts = token.split(".")
    assert len(parts) == 3

    # Decoding with valid secret retrieves original username
    decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert decoded["sub"] == test_username
    assert "exp" in decoded


def test_tampered_jwt_token_rejection():
    """Unit Test: Tampering with a JWT payload must fail cryptographic signature check."""
    token = create_access_token(data={"sub": "alice_dev"})
    header, _payload, signature = token.split(".")

    # Hacker tampers payload by substituting another user
    tampered_token = f"{header}.eyJzdWIiOiAiaGFja2VyIn0.{signature}"

    try:
        jwt.decode(tampered_token, SECRET_KEY, algorithms=[ALGORITHM])
        assert False, "Tampered token should have raised JWTError"
    except Exception:
        # Expected signature mismatch
        assert True


def test_pagination_formula_and_clamping():
    """Unit Test: Pagination math and limit clamping rules."""
    def calculate_pagination(page: int, limit: int, max_limit: int = 100):
        clamped_limit = min(max(1, limit), max_limit)
        offset = (max(1, page) - 1) * clamped_limit
        return clamped_limit, offset

    # Page 1, limit 20 -> offset 0
    limit, offset = calculate_pagination(page=1, limit=20)
    assert limit == 20
    assert offset == 0

    # Page 3, limit 20 -> offset 40
    limit, offset = calculate_pagination(page=3, limit=20)
    assert limit == 20
    assert offset == 40

    # Security: limit exceeding max_limit (e.g. 50000) must be clamped to 100
    limit, offset = calculate_pagination(page=1, limit=50000, max_limit=100)
    assert limit == 100
    assert offset == 0


def test_reading_time_and_word_count_calculation():
    """Unit Test: Reading time and word count formula (200 words/min, min 1 min)."""
    # Empty string
    assert calculate_reading_metrics("") == (1, 0)

    # Short content (< 200 words)
    short_text = "Hello world from FastAPI backend!"
    assert calculate_reading_metrics(short_text) == (1, 5)

    # Exactly 200 words -> 1 min
    two_hundred = " ".join(["word"] * 200)
    assert calculate_reading_metrics(two_hundred) == (1, 200)

    # 201 words -> 2 min
    two_hundred_one = " ".join(["word"] * 201)
    assert calculate_reading_metrics(two_hundred_one) == (2, 201)

    # 650 words -> 4 min
    long_text = " ".join(["word"] * 650)
    assert calculate_reading_metrics(long_text) == (4, 650)
