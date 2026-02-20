import math
import re
from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError

from app.core.exceptions import UserExistsError, NotFoundError, AuthenticationError
from app.core.security import get_password_hash, verify_password, validate_password_strength
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
    if user_data.status is not None:
        update_fields["status"] = user_data.status

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


_ALLOWED_IMAGE_FIELDS = {"avatar_url", "banner_url"}


async def update_user_image(
    db: AsyncIOMotorDatabase,
    user_id: str,
    field: str,
    url: str,
) -> UserInDB:
    """Update user avatar or banner URL."""
    if field not in _ALLOWED_IMAGE_FIELDS:
        raise ValueError(f"Invalid image field: {field}")
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {field: url, "updated_at": datetime.now(timezone.utc)}},
    )
    if result.matched_count == 0:
        raise NotFoundError("User")
    return await get_user_by_id(db, user_id)


async def remove_user_image(
    db: AsyncIOMotorDatabase,
    user_id: str,
    field: str,
) -> UserInDB:
    """Remove user avatar or banner URL (set to null)."""
    if field not in _ALLOWED_IMAGE_FIELDS:
        raise ValueError(f"Invalid image field: {field}")
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {field: None, "updated_at": datetime.now(timezone.utc)}},
    )
    if result.matched_count == 0:
        raise NotFoundError("User")
    return await get_user_by_id(db, user_id)


# Settings functions
async def change_password(
    db: AsyncIOMotorDatabase,
    user_id: str,
    current_password: str,
    new_password: str,
) -> bool:
    """Change user password after verifying current one."""
    user = await get_user_by_id(db, user_id)
    if not user:
        raise NotFoundError("User")

    if not await verify_password(current_password, user.hashed_password):
        raise AuthenticationError("Current password is incorrect")

    is_valid, error_msg = validate_password_strength(new_password)
    if not is_valid:
        raise ValueError(error_msg)

    hashed = await get_password_hash(new_password)
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"hashed_password": hashed, "updated_at": datetime.now(timezone.utc)}},
    )
    return True


async def change_email(
    db: AsyncIOMotorDatabase,
    user_id: str,
    new_email: str,
    password: str,
) -> UserInDB:
    """Change user email after verifying password."""
    user = await get_user_by_id(db, user_id)
    if not user:
        raise NotFoundError("User")

    if not await verify_password(password, user.hashed_password):
        raise AuthenticationError("Password is incorrect")

    # Check uniqueness
    existing = await get_user_by_email(db, new_email)
    if existing and str(existing.id) != user_id:
        raise UserExistsError("Email already taken")

    try:
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"email": new_email.lower(), "updated_at": datetime.now(timezone.utc)}},
        )
    except DuplicateKeyError:
        raise UserExistsError("Email already taken")

    return await get_user_by_id(db, user_id)


async def delete_user_account(
    db: AsyncIOMotorDatabase,
    user_id: str,
    password: str,
) -> bool:
    """Delete own account after verifying password."""
    user = await get_user_by_id(db, user_id)
    if not user:
        raise NotFoundError("User")

    if not await verify_password(password, user.hashed_password):
        raise AuthenticationError("Password is incorrect")

    # Clean up related data first, then delete user
    await db.favorites.delete_many({"user_id": ObjectId(user_id)})
    await db.comments.update_many(
        {"user_id": ObjectId(user_id)},
        {"$set": {"is_deleted": True}},
    )

    # Delete uploaded files
    from app.services import uploads as uploads_service
    await uploads_service.delete_upload(user.avatar_url)
    await uploads_service.delete_upload(user.banner_url)

    # Delete user document last
    await db.users.delete_one({"_id": ObjectId(user_id)})

    return True


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

    user = await get_user_by_id(db, user_id)
    if not user:
        raise NotFoundError("User")

    # Clean up related data first
    await db.favorites.delete_many({"user_id": ObjectId(user_id)})
    await db.comments.update_many(
        {"user_id": ObjectId(user_id)},
        {"$set": {"is_deleted": True}},
    )

    # Delete uploaded files
    from app.services import uploads as uploads_service
    await uploads_service.delete_upload(user.avatar_url)
    await uploads_service.delete_upload(user.banner_url)

    # Delete user document last
    await db.users.delete_one({"_id": ObjectId(user_id)})

    return True


async def get_users_count(db: AsyncIOMotorDatabase) -> int:
    """Get total users count."""
    return await db.users.count_documents({})
