from typing import Optional
import logging

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.server_api import ServerApi

from app.core.config import settings

logger = logging.getLogger(__name__)


class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None

    async def connect(self) -> None:
        """Connect to MongoDB."""
        self.client = AsyncIOMotorClient(
            settings.mongodb_url,
            server_api=ServerApi("1"),
        )
        self.database = self.client[settings.database_name]
        await self._create_indexes()
        logger.info("Connected to MongoDB: %s", settings.database_name)

    async def disconnect(self) -> None:
        """Disconnect from MongoDB."""
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB")

    async def _create_indexes(self) -> None:
        """Create database indexes."""
        if self.database is None:
            return

        # Users collection indexes
        users = self.database.users
        await users.create_index("email", unique=True)
        await users.create_index("username", unique=True)
        await users.create_index("role")

        # Favorites collection indexes
        favorites = self.database.favorites
        await favorites.create_index([("user_id", 1), ("spotify_id", 1)], unique=True)
        await favorites.create_index("user_id")
        await favorites.create_index("added_at")

        # Comments collection indexes
        comments = self.database.comments
        await comments.create_index("track_id")
        await comments.create_index("user_id")
        await comments.create_index("artist_id")
        await comments.create_index("created_at")
        await comments.create_index([("track_id", 1), ("is_deleted", 1)])
        await comments.create_index([("artist_id", 1), ("is_deleted", 1)])

        logger.info("Database indexes created")


mongodb = MongoDB()


async def get_database() -> AsyncIOMotorDatabase:
    """Dependency for getting database instance."""
    if mongodb.database is None:
        raise RuntimeError("Database not initialized")
    return mongodb.database
