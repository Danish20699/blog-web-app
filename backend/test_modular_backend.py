import sys
import os

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_modular_app():
    print("\n" + "="*60)
    print("TESTING MODULAR BLOG BACKEND (JWT, Bcrypt & AuthZ)")
    print("="*60)

    # 1. Register Alice
    print("\n[1] Registering Alice...")
    r = client.post("/user", json={
        "name": "Alice Smith",
        "username": "alice",
        "password": "alicepassword123",
        "email": "alice@example.com",
        "bio": "Writer & Engineer"
    })
    assert r.status_code == 201, f"Expected 201, got {r.status_code}: {r.text}"
    alice_id = r.json()["id"]
    print(f"[PASS] Alice registered with ID={alice_id}")
    # Verify no hashed_password leak
    assert "hashed_password" not in r.json(), "Security leak: hashed_password found in UserGet!"
    print("[PASS] Security check passed: hashed_password is NOT exposed in response!")

    # 2. Login Alice
    print("\n[2] Logging in Alice at /login...")
    r = client.post("/login", data={"username": "alice", "password": "alicepassword123"})
    assert r.status_code == 200
    alice_token = r.json()["access_token"]
    alice_headers = {"Authorization": f"Bearer {alice_token}"}
    print("[PASS] Alice logged in! Access token acquired.")

    # 3. Alice gets profile (/user/me)
    print("\n[3] Testing GET /user/me for Alice...")
    r = client.get("/user/me", headers=alice_headers)
    assert r.status_code == 200
    assert r.json()["username"] == "alice"
    print("[PASS] Profile loaded via Depends(get_current_user)!")

    # 4. Alice creates a Blog (No author_id passed!)
    print("\n[4] Alice creating a blog post (author_id auto-extracted from JWT)...")
    r = client.post("/blog", json={
        "title": "FastAPI Architecture Refactoring",
        "content": "Modular structure with routes, db, models, and security!"
    }, headers=alice_headers)
    assert r.status_code == 201
    blog_data = r.json()
    blog_id = blog_data["id"]
    assert blog_data["author_id"] == alice_id, f"Expected author_id={alice_id}, got {blog_data['author_id']}"
    print(f"[PASS] Blog created (ID={blog_id})! Backend automatically bound author_id={alice_id}!")

    # 5. Register Bob
    print("\n[5] Registering Bob...")
    r = client.post("/user", json={
        "name": "Bob Jones",
        "username": "bob",
        "password": "bobpassword123",
        "email": "bob@example.com",
        "bio": "DevOps Guy"
    })
    assert r.status_code == 201
    bob_id = r.json()["id"]
    print(f"[PASS] Bob registered with ID={bob_id}")

    # 6. Login Bob
    print("\n[6] Logging in Bob at /login...")
    r = client.post("/login", data={"username": "bob", "password": "bobpassword123"})
    assert r.status_code == 200
    bob_token = r.json()["access_token"]
    bob_headers = {"Authorization": f"Bearer {bob_token}"}
    print("[PASS] Bob logged in! Access token acquired.")

    # 7. Bob tries to DELETE Alice's Blog (Authorization Check!)
    print("\n[7] Bob attempting to DELETE Alice's blog post (Security Check)...")
    r = client.delete(f"/blog/{blog_id}", headers=bob_headers)
    print(f"Status Code: {r.status_code}")
    print(f"Response: {r.json()}")
    assert r.status_code == 403, f"Expected 403 Forbidden, got {r.status_code}"
    assert r.json()["detail"] == "Not authorized to delete this blog post"
    print("[PASS] 403 Forbidden returned! Ownership check successfully protected Alice's post!")

    # 8. Bob comments on Alice's Blog (No commenter_id passed!)
    print("\n[8] Bob commenting on Alice's blog (commenter_id auto-extracted)...")
    r = client.post(f"/blog/{blog_id}/comment", json={
        "text": "Great article on refactoring!"
    }, headers=bob_headers)
    assert r.status_code == 201
    comment_data = r.json()
    assert comment_data["commenter_id"] == bob_id
    print(f"[PASS] Comment posted! Backend automatically bound commenter_id={bob_id}!")

    # 9. Bob Likes Alice's Blog
    print("\n[9] Bob toggling LIKE on Alice's blog...")
    r = client.post(f"/blog/{blog_id}/like", headers=bob_headers)
    assert r.status_code == 200
    assert r.json()["liked"] is True
    print("[PASS] Like registered successfully!")

    # 10. Bob Follows Alice
    print("\n[10] Bob following Alice...")
    r = client.post(f"/user/{alice_id}/follow", headers=bob_headers)
    assert r.status_code == 200
    assert r.json()["following"] is True
    print(f"[PASS] Follow registered! Bob is now following Alice.")

    # 11. Alice successfully deletes her own blog
    print("\n[11] Alice deleting her own blog post...")
    r = client.delete(f"/blog/{blog_id}", headers=alice_headers)
    assert r.status_code == 200
    print("[PASS] Blog post deleted by author!")

    print("\n" + "="*60)
    print("ALL 11 TESTS IN MODULAR ARCHITECTURE PASSED PERFECTLY!")
    print("="*60 + "\n")

if __name__ == "__main__":
    test_modular_app()

