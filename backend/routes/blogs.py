from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from db import get_session
from models import (
    Blog,
    BlogCreate,
    BlogDetailResponse,
    Comment,
    CommentCreate,
    CommentResponse,
    LikeTracker,
    User,
)
from security import get_current_user

router = APIRouter(tags=["Blogs & Comments"])


@router.post("/blog", response_model=Blog, status_code=status.HTTP_201_CREATED)
def createBlog(
    blog: BlogCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    new_blog = Blog(
        title=blog.title,
        content=blog.content,
        author_id=current_user.id,
    )
    session.add(new_blog)
    session.commit()
    session.refresh(new_blog)
    return new_blog


@router.get("/blog/{blog_id}", response_model=BlogDetailResponse)
def getBlog(blog_id: int, session: Session = Depends(get_session)):
    # Optimized Single SQL JOIN Query (Eliminating N+1 queries)
    statement = (
        select(
            Blog.id,
            Blog.title,
            Blog.content,
            Blog.author_id,
            User.name.label("author_name"),
            func.coalesce(func.count(func.distinct(LikeTracker.liker_id)), 0).label("likes_count"),
            func.coalesce(func.count(func.distinct(Comment.id)), 0).label("comments_count"),
        )
        .join(User, Blog.author_id == User.id)
        .outerjoin(LikeTracker, LikeTracker.blog_id == Blog.id)
        .outerjoin(Comment, Comment.blog_id == Blog.id)
        .where(Blog.id == blog_id)
        .group_by(Blog.id, User.name)
    )
    result = session.exec(statement).first()
    if not result:
        raise HTTPException(status_code=404, detail="Blog not found")

    id, title, content, author_id, author_name, likes_count, comments_count = result

    return BlogDetailResponse(
        id=id,
        title=title,
        content=content,
        author_id=author_id,
        author_name=author_name,
        likes_count=likes_count,
        comments_count=comments_count,
    )


@router.get("/blogs", response_model=List[BlogDetailResponse])
def getAllBlogs(
    limit: int = Query(default=20, ge=1, le=100, description="Items per page (max 100)"),
    cursor: Optional[int] = Query(default=None, description="Cursor: Blog ID for keyset pagination"),
    offset: Optional[int] = Query(default=None, ge=0, description="Offset: Skip count for numbered pagination"),
    session: Session = Depends(get_session),
):
    # High-Performance Feed Query with SQL JOIN and Dual Pagination (Cursor & Offset)
    statement = (
        select(
            Blog.id,
            Blog.title,
            Blog.content,
            Blog.author_id,
            User.name.label("author_name"),
            func.coalesce(func.count(func.distinct(LikeTracker.liker_id)), 0).label("likes_count"),
            func.coalesce(func.count(func.distinct(Comment.id)), 0).label("comments_count"),
        )
        .join(User, Blog.author_id == User.id)
        .outerjoin(LikeTracker, LikeTracker.blog_id == Blog.id)
        .outerjoin(Comment, Comment.blog_id == Blog.id)
        .group_by(Blog.id, User.name)
        .order_by(Blog.id.desc())
    )

    # Iteration 6: Keyset / Cursor-Based Pagination (WHERE id < cursor) takes precedence for O(1) performance
    if cursor is not None:
        statement = statement.where(Blog.id < cursor)
    elif offset is not None:
        statement = statement.offset(offset)
    else:
        statement = statement.offset(0)

    statement = statement.limit(min(limit, 100))
    results = session.exec(statement).all()

    return [
        BlogDetailResponse(
            id=row[0],
            title=row[1],
            content=row[2],
            author_id=row[3],
            author_name=row[4],
            likes_count=row[5],
            comments_count=row[6],
        )
        for row in results
    ]


@router.delete("/blog/{blog_id}")
def deleteBlog(
    blog_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    blog = session.get(Blog, blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    if blog.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this blog post",
        )

    session.delete(blog)
    session.commit()
    return {"message": "Blog and all associated comments/likes deleted successfully"}


@router.post(
    "/blog/{blog_id}/comment",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def addComment(
    blog_id: int,
    comment_data: CommentCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not session.get(Blog, blog_id):
        raise HTTPException(status_code=404, detail="Blog not found")

    new_comment = Comment(
        text=comment_data.text,
        commenter_id=current_user.id,
        blog_id=blog_id,
    )
    session.add(new_comment)
    session.commit()
    session.refresh(new_comment)
    return CommentResponse(
        id=new_comment.id,
        text=new_comment.text,
        commenter_id=new_comment.commenter_id,
        blog_id=new_comment.blog_id,
        commenter_name=current_user.name,
    )


@router.get("/blog/{blog_id}/comments", response_model=List[CommentResponse])
def getBlogComments(blog_id: int, session: Session = Depends(get_session)):
    if not session.get(Blog, blog_id):
        raise HTTPException(status_code=404, detail="Blog not found")

    # Iteration 5: SQL JOIN to return commenter_name instead of raw commenter_id
    statement = (
        select(
            Comment.id,
            Comment.text,
            Comment.commenter_id,
            Comment.blog_id,
            User.name.label("commenter_name"),
        )
        .join(User, Comment.commenter_id == User.id)
        .where(Comment.blog_id == blog_id)
        .order_by(Comment.id.asc())
    )
    results = session.exec(statement).all()
    return [
        CommentResponse(
            id=row[0],
            text=row[1],
            commenter_id=row[2],
            blog_id=row[3],
            commenter_name=row[4],
        )
        for row in results
    ]


@router.delete("/comment/{comment_id}")
def deleteComment(
    comment_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Iteration 3 & 5: Delete comment if user is author of comment or blog owner
    comment = session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    blog = session.get(Blog, comment.blog_id)
    if comment.commenter_id != current_user.id and (not blog or blog.author_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this comment",
        )

    session.delete(comment)
    session.commit()
    return {"message": "Comment deleted successfully"}


@router.post("/blog/{blog_id}/like")
def toggleLike(
    blog_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not session.get(Blog, blog_id):
        raise HTTPException(status_code=404, detail="Blog not found")

    existing_like = session.get(LikeTracker, (current_user.id, blog_id))
    if existing_like:
        session.delete(existing_like)
        session.commit()
        return {"message": "Post unliked", "liked": False}
    else:
        new_like = LikeTracker(liker_id=current_user.id, blog_id=blog_id)
        session.add(new_like)
        session.commit()
        return {"message": "Post liked", "liked": True}
