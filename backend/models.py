
from sqlmodel import Field, SQLModel

# ==============================================================================
# DATABASE TABLES (Entities)
# ==============================================================================


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    username: str = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    email: str = Field(unique=True, index=True, nullable=False)
    bio: str | None = Field(default=None)


class Blog(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(nullable=False)
    content: str = Field(nullable=False)
    author_id: int = Field(foreign_key="user.id", nullable=False)


class Comment(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    text: str = Field(nullable=False)
    commenter_id: int = Field(foreign_key="user.id", nullable=False)
    blog_id: int = Field(foreign_key="blog.id", nullable=False)


class LikeTracker(SQLModel, table=True):
    liker_id: int = Field(foreign_key="user.id", primary_key=True)
    blog_id: int = Field(foreign_key="blog.id", primary_key=True)


class UserFollow(SQLModel, table=True):
    follower_id: int = Field(foreign_key="user.id", primary_key=True)
    followed_id: int = Field(foreign_key="user.id", primary_key=True)


# ==============================================================================
# SCHEMAS (Request & Response)
# ==============================================================================


class UserCreate(SQLModel):
    name: str
    username: str
    password: str
    email: str
    bio: str | None = None


class UserGet(SQLModel):
    id: int
    name: str
    username: str
    email: str
    bio: str | None = None


class UserPut(SQLModel):
    name: str
    username: str
    password: str | None = None
    email: str
    bio: str | None = None


class Token(SQLModel):
    access_token: str
    token_type: str


class BlogCreate(SQLModel):
    title: str
    content: str


class BlogDetailResponse(SQLModel):
    id: int
    title: str
    content: str
    author_id: int
    author_name: str | None = None
    likes_count: int = 0
    comments_count: int = 0


class CommentCreate(SQLModel):
    text: str


class CommentResponse(SQLModel):
    id: int
    text: str
    commenter_id: int
    commenter_name: str | None = None
    blog_id: int
