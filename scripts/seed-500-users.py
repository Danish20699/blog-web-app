import os
import random
import sys
from pathlib import Path

# Add backend directory to path to reuse database engine
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from db import engine, init_db
from models import Blog, Comment, LikeTracker, User, UserFollow
from sqlmodel import Session, select

# Pre-computed Bcrypt hash for "password123" (Cost Factor 12)
# Avoids hashing 500 times in Python, inserting 500 users in < 1 second!
PRECOMPUTED_BCRYPT_HASH = (
    "$2b$12$N38Q7mXv6QkYkY6R1fGjE.6rTz8XQoBmVhZg5tWp2sKk7lMnOpQrS"
)

TECH_TOPICS = [
    ("Scaling FastAPI with Docker Compose", "In-depth guide covering multi-stage builds, reverse proxies, and healthcheck synchronization."),
    ("PostgreSQL Indexing: B-Trees vs Hash", "Why B-Tree indexes speed up feed sorting and foreign key joins from O(N) to O(log N)."),
    ("Stateless JWT vs Server Sessions", "Architectural trade-offs when scaling distributed microservices horizontally."),
    ("Understanding Bcrypt Work Factors", "Why work factor 12 (4,096 rounds) is the industry sweet spot for brute-force defense."),
    ("Eliminating the N+1 Query Problem", "How SQL JOINs and COALESCE aggregations replace hundreds of sequential queries with one."),
    ("Building Microservices with AnyIO", "Asynchronous concurrency and event loop multitasking in modern ASGI frameworks."),
    ("Kubernetes Pod Auto-scaling Secrets", "Horizontal pod autoscalers and metric server tuning under high HTTP load."),
    ("Database Connection Pooling Secrets", "How SQLModel and SQLAlchemy connection pools prevent server socket starvation."),
    ("Designing Resilient CI/CD Pipelines", "Automating linting, unit testing, and Docker builds on pull requests with GitHub Actions."),
    ("Micro-Frontend Architecture in 2026", "Decoupling React applications across domain teams with Module Federation."),
]


def seed_database():
    print("=" * 60)
    print("🚀 SEEDING 500 DEMO USERS, ARTICLES & SOCIAL INTERACTIONS")
    print("=" * 60)

    init_db()

    with Session(engine) as session:
        # Check if already seeded
        existing_users = session.exec(select(User)).all()
        if len(existing_users) >= 50:
            print(f"ℹ️ Database already contains {len(existing_users)} users. Skipping duplicate seeding.")
            return

        print("\n[1/4] Generating 500 user accounts...")
        users = []
        for i in range(1, 501):
            user = User(
                name=f"Developer {i}",
                username=f"dev_{i}",
                email=f"dev_{i}@devspace.io",
                hashed_password=PRECOMPUTED_BCRYPT_HASH,
                bio=f"Full-Stack & Systems Engineer #{i} | Passionate about distributed architectures.",
            )
            users.append(user)

        session.add_all(users)
        session.commit()
        print("✅ 500 users successfully created! (Password for all: password123)")

        # Refresh user IDs
        all_users = session.exec(select(User)).all()
        user_ids = [u.id for u in all_users]

        print("\n[2/4] Publishing articles across creators...")
        blogs = []
        for i in range(100):
            title, content = random.choice(TECH_TOPICS)
            author_id = random.choice(user_ids)
            blog = Blog(
                title=f"{title} (Vol. {i + 1})",
                content=f"{content}\n\nAuthored by our community engineer.",
                author_id=author_id,
            )
            blogs.append(blog)

        session.add_all(blogs)
        session.commit()
        print("✅ 100 technical articles published!")

        # Fetch created blog IDs
        all_blogs = session.exec(select(Blog)).all()
        blog_ids = [b.id for b in all_blogs]

        print("\n[3/4] Generating likes and threaded discussions...")
        likes = []
        comments = []
        sample_comments = [
            "Great architectural breakdown!",
            "This saved me hours of debugging.",
            "How does this perform under 10k RPS?",
            "Clear explanation of the N+1 problem.",
            "Docker Compose healthchecks are a game changer.",
        ]

        # Generate unique likes
        created_likes = set()
        for _ in range(500):
            u_id = random.choice(user_ids)
            b_id = random.choice(blog_ids)
            if (u_id, b_id) not in created_likes:
                created_likes.add((u_id, b_id))
                likes.append(LikeTracker(liker_id=u_id, blog_id=b_id))

        # Generate comments
        for _ in range(300):
            u_id = random.choice(user_ids)
            b_id = random.choice(blog_ids)
            comments.append(
                Comment(
                    text=random.choice(sample_comments),
                    commenter_id=u_id,
                    blog_id=b_id,
                )
            )

        session.add_all(likes)
        session.add_all(comments)
        session.commit()
        print(f"✅ Generated {len(likes)} likes and {len(comments)} comments!")

        print("\n[4/4] Creating follow relationships for feed testing...")
        follows = []
        created_follows = set()
        for _ in range(400):
            u1 = random.choice(user_ids)
            u2 = random.choice(user_ids)
            if u1 != u2 and (u1, u2) not in created_follows:
                created_follows.add((u1, u2))
                follows.append(UserFollow(follower_id=u1, followed_id=u2))

        session.add_all(follows)
        session.commit()
        print(f"✅ Created {len(follows)} follower relationships!")

    print("\n" + "=" * 60)
    print("🎉 DATABASE READY FOR STRESS TESTING (oha / load-balancing)!")
    print("=" * 60)


if __name__ == "__main__":
    seed_database()
