#!/usr/bin/env python3
"""Quick management commands for SoundScout."""

import argparse
import sys
from pymongo import MongoClient

DB_URL = "mongodb://localhost:27017"
DB_NAME = "soundscout"


def get_db():
    return MongoClient(DB_URL)[DB_NAME]


def promote(args):
    db = get_db()
    result = db.users.update_one(
        {"email": args.email}, {"$set": {"role": "admin"}}
    )
    if result.matched_count:
        print(f"✓ {args.email} is now admin")
    else:
        print(f"✗ No user found with email: {args.email}", file=sys.stderr)
        sys.exit(1)


def demote(args):
    db = get_db()
    result = db.users.update_one(
        {"email": args.email}, {"$set": {"role": "user"}}
    )
    if result.matched_count:
        print(f"✓ {args.email} is now user")
    else:
        print(f"✗ No user found with email: {args.email}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SoundScout management CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("promote", help="Make a user admin")
    p.add_argument("email")
    p.set_defaults(func=promote)

    p = sub.add_parser("demote", help="Remove admin from a user")
    p.add_argument("email")
    p.set_defaults(func=demote)

    args = parser.parse_args()
    args.func(args)
