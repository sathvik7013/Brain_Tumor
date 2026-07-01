import os

predictions_collection = None

try:
	from dotenv import load_dotenv
	from motor.motor_asyncio import AsyncIOMotorClient

	load_dotenv()

	MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
	client = AsyncIOMotorClient(MONGO_URL)
	db = client["brain_tumor_db"]
	predictions_collection = db["predictions"]
except Exception as exc:
	print(f"Database client unavailable: {exc}")
