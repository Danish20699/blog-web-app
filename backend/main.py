from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import init_db
from routes import auth, blogs, users

# Run the SQL migration script on app startup
init_db()

app = FastAPI(
    title="Modular Blog Backend with JWT & Bcrypt",
    swagger_ui_parameters={"persistAuthorization": True},
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount individual routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(blogs.router)
