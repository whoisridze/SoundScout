import math
import re
from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError

from app.core.exceptions import UserExistsError, NotFoundError
from app.core.security import get_password_hash
from app.models.user import UserCreate, UserUpdate, UserInDB, AdminUserUpdate
from app.models.common import UserRole


async def create_user(
    db: AsyncIOMotorDatabase,
    user_data: UserCreate,
    role: UserRole = UserRole.USER,
) -> UserInDB:
    """Create a new user."""
    now = datetime.now(timezone.utc)
    user_doc = {
        "username": user_data.username.lower(),
        "email": user_data.email.lower(),
        "hashed_password": await get_password_hash(user_data.password),
        "is_active": True,
        "role": role.value,
        "created_at": now,
        "updated_at": now,
    }

    try:
        result = await db.users.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        return UserInDB(**user_doc)
    except DuplicateKeyError:
        raise UserExistsError()


async def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> Optional[UserInDB]:
    """Get user by email."""
    doc = await db.users.find_one({"email": email.lower()})
    return UserInDB(**doc) if doc else None


async def get_user_by_username(db: AsyncIOMotorDatabase, username: str) -> Optional[UserInDB]:
    """Get user by username."""
    doc = await db.users.find_one({"username": username.lower()})
    return UserInDB(**doc) if doc else None


async def get_user_by_id(db: AsyncIOMotorDatabase, user_id: str) -> Optional[UserInDB]:
    """Get user by ID."""
    if not ObjectId.is_valid(user_id):
        return None
    doc = await db.users.find_one({"_id": ObjectId(user_id)})
    return UserInDB(**doc) if doc else None


async def update_user(
    db: AsyncIOMotorDatabase, user_id: str, user_data: UserUpdate
) -> UserInDB:
    """Update user profile."""
    update_fields = {}
    if user_data.username is not None:
        update_fields["username"] = user_data.username.lower()
    if user_data.email is not None:
        update_fields["email"] = user_data.email.lower()

    if not update_fields:
        user = await get_user_by_id(db, user_id)
        if not user:
            raise NotFoundError("User")
        return user

    update_fields["updated_at"] = datetime.now(timezone.utc)

    try:
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_fields},
        )
        if result.matched_count == 0:
            raise NotFoundError("User")
        return await get_user_by_id(db, user_id)
    except DuplicateKeyError:
        raise UserExistsError("Username or email already taken")


# Admin functions
async def get_all_users(
    db: AsyncIOMotorDatabase,
    page: int = 1,
    per_page: int = 20,
    search: Optional[str] = None,
) -> tuple:
    """Get all users with pagination (admin only)."""
    skip = (page - 1) * per_page

    query = {}
    if search:
        escaped = re.escape(search)
        query["$or"] = [
            {"username": {"$regex": escaped, "$options": "i"}},
            {"email": {"$regex": escaped, "$options": "i"}},
        ]

    cursor = db.users.find(query)
    total = await db.users.count_documents(query)

    users = await cursor.sort("created_at", -1).skip(skip).limit(per_page).to_list(per_page)
    pages = math.ceil(total / per_page) if total > 0 else 1

    return [UserInDB(**u) for u in users], total, pages


async def admin_update_user(
    db: AsyncIOMotorDatabase,
    user_id: str,
    update_data: AdminUserUpdate,
) -> UserInDB:
    """Update user by admin (can change role, active status)."""
    user = await get_user_by_id(db, user_id)
    if not user:
        raise NotFoundError("User")

    update_fields = {}
    if update_data.is_active is not None:
        update_fields["is_active"] = update_data.is_active
    if update_data.role is not None:
        update_fields["role"] = update_data.role.value

    if not update_fields:
        return user

    update_fields["updated_at"] = datetime.now(timezone.utc)

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_fields},
    )

    return await get_user_by_id(db, user_id)


async def delete_user(db: AsyncIOMotorDatabase, user_id: str) -> bool:
    """Delete user (admin only)."""
    if not ObjectId.is_valid(user_id):
        raise NotFoundError("User")

    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise NotFoundError("User")

    # Also delete user's favorites and comments
    await db.favorites.delete_many({"user_id": ObjectId(user_id)})
    await db.comments.update_many(
        {"user_id": ObjectId(user_id)},
        {"$set": {"is_deleted": True}},
    )

    return True


async def get_users_count(db: AsyncIOMotorDatabase) -> int:
    """Get total users count."""
    return await db.users.count_documents({})
