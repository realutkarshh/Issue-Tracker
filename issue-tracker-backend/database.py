import os
from motor.motor_asyncio import AsyncIOMotorClient
from motor.core import AgnosticClient, AgnosticDatabase, AgnosticCollection
from dotenv import load_dotenv
from typing import Optional

# Load environment variables
load_dotenv()

# MongoDB Atlas configuration from your .env
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "issue_tracker_db")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "issues")


class Database:
    def __init__(self):
        self.client: Optional[AgnosticClient] = None  # ✅ Correct typing
        self.database: Optional[AgnosticDatabase] = None
        self.collection: Optional[AgnosticCollection] = None


# Database instance
db = Database()


async def connect_to_mongo():
    """Connect to MongoDB Atlas"""
    try:
        print("🔌 Connecting to MongoDB Atlas...")
        print(f"📊 Database: {DATABASE_NAME}")
        print(f"📁 Collection: {COLLECTION_NAME}")

        # Create Motor client for MongoDB Atlas
        db.client = AsyncIOMotorClient(MONGODB_URL)

        # Test the connection
        await db.client.admin.command("ping")
        print("✅ Successfully connected to MongoDB Atlas!")

        # Get database and collection
        db.database = db.client[DATABASE_NAME]
        db.collection = db.database[COLLECTION_NAME]

        # Check existing documents
        count = await db.collection.count_documents({})
        print(f"📈 Current issues in database: {count}")

    except Exception as e:
        print(f"❌ Failed to connect to MongoDB Atlas: {e}")
        print("💡 Check your connection string and network access")
        raise e


async def close_mongo_connection():
    """Close MongoDB connection"""
    if db.client:
        db.client.close()
        print("✅ MongoDB Atlas connection closed")


def get_collection() -> Optional[AgnosticCollection]:
    """Get issues collection"""
    return db.collection
