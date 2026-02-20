from fastapi import APIRouter

from app.api.v1 import auth, genres, artists, favorites, comments, profile, search, admin

router = APIRouter()

# Include all v1 routers
router.include_router(auth.router)
router.include_router(genres.router)
router.include_router(artists.router)
router.include_router(favorites.router)
router.include_router(comments.router)
router.include_router(profile.router)
router.include_router(search.router)
router.include_router(admin.router)
