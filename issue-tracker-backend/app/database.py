import motor.motor_asyncio
from app.core.config import settings

# Create MongoDB client (like mongoose.connect())
client = motor.motor_asyncio.AsyncIOMotorClient(settings.mongodb_url)
database = client[settings.database_name]

# Collections (like your models)
issue_collection = database.get_collection("issues")

async def connect_to_mongo():
    """Create database connection"""
    try:
        # Test connection
        await client.admin.command('ping')
        print("Connected to MongoDB!")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")

async def close_mongo_connection():
    """Close database connection"""
    client.close()
