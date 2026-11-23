"""
Integration Tests for Blog App (Stage 3 in CI/CD Pipeline)
Tests full API route workflows interacting with an isolated in-memory test database.
"""

import os
import sys

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

# Add backend directory to path
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, backend_dir)

from main import app

from db import get_session

# Ephemeral in-memory SQLite database for integration tests
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@pytest.fixture(name="client", scope="module")
def client_fixture():
    # Create all tables in memory
    SQLModel.metadata.create_all(engine)

    def get_test_session():
        with Session(engine) as session:
            yield session

    # Override the database dependency in FastAPI
    app.dependency_overrides[get_session] = get_test_session

    client = TestClient(app)
    yield client

    # Cleanup
    app.dependency_overrides.clear()
    SQLModel.metadata.drop_all(engine)


def test_health_check_endpoint(client: TestClient):
    """Integration Test: Root health endpoint must return 200 OK."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["service"] == "DEVSPACE Modular Blog API"


def test_complete_user_and_blog_workflow(client: TestClient):
    """
    Integration Test: Full end-to-end API lifecycle:
    1. Register user 'carol'
    2. Login to get JWT access token
    3. Access protected route /user/me
    4. Create a new blog post
    5. Fetch blogs feed (verifies SQL JOIN author_name)
    6. Add a comment (verifies SQL JOIN commenter_name)
    7. Delete comment
    """

    # 1. Register User
    reg_payload = {
        "name": "Carol Danvers",
        "username": "carol",
        "email": "carol@devspace.io",
        "password": "Password123!",
        "bio": "Cloud and DevOps Engineer",
    }
    reg_res = client.post("/user", json=reg_payload)
    assert reg_res.status_code == 201
    user_id = reg_res.json()["id"]
    assert reg_res.json()["username"] == "carol"

    # 2. Login to get JWT
    login_res = client.post(
        "/login",
        data={"username": "carol", "password": "Password123!"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token is not None
    auth_header = {"Authorization": f"Bearer {token}"}

    # 3. Access Protected /user/me
    me_res = client.get("/user/me", headers=auth_header)
    assert me_res.status_code == 200
    assert me_res.json()["id"] == user_id
    assert me_res.json()["username"] == "carol"

    # 4. Create Blog
    blog_payload = {
        "title": "Scaling FastAPI with NGINX Reverse Proxy",
        "content": "Deep dive into microservices load balancing and connection pooling.",
    }
    blog_res = client.post("/blog", json=blog_payload, headers=auth_header)
    assert blog_res.status_code == 201
    blog_id = blog_res.json()["id"]
    assert blog_res.json()["title"] == blog_payload["title"]

    # 5. Fetch Blogs Feed (Verifies SQL JOIN author_name and Pagination)
    feed_res = client.get("/blogs?limit=10&offset=0")
    assert feed_res.status_code == 200
    blogs = feed_res.json()
    assert len(blogs) >= 1
    found_blog = next((b for b in blogs if b["id"] == blog_id), None)
    assert found_blog is not None
    assert found_blog["author_name"] == "Carol Danvers"
    assert found_blog["reading_time"] == 1
    assert found_blog["word_count"] == 9

    # 5b. Fetch Single Blog Detail (Verifies dynamic reading metrics)
    detail_res = client.get(f"/blog/{blog_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["reading_time"] == 1
    assert detail_res.json()["word_count"] == 9

    # 6. Add Comment
    comment_payload = {"text": "Great explanation of NGINX reverse proxies!"}
    comm_res = client.post(f"/blog/{blog_id}/comment", json=comment_payload, headers=auth_header)
    assert comm_res.status_code == 201
    comment_id = comm_res.json()["id"]
    assert comm_res.json()["commenter_name"] == "Carol Danvers"

    # 7. List Comments (Verifies SQL JOIN commenter_name)
    comm_list_res = client.get(f"/blog/{blog_id}/comments")
    assert comm_list_res.status_code == 200
    comments = comm_list_res.json()
    assert len(comments) == 1
    assert comments[0]["commenter_name"] == "Carol Danvers"

    # 8. Delete Comment (Iteration 3 & 5 requirement)
    del_comm_res = client.delete(f"/comment/{comment_id}", headers=auth_header)
    assert del_comm_res.status_code == 200
    assert del_comm_res.json()["message"] == "Comment deleted successfully"
