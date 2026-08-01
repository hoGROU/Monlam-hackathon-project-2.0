from dotenv import load_dotenv
import os

load_dotenv()

MONLAM_API_KEY = os.getenv("MONLAM_API_KEY")
MONLAM_BASE_URL = os.getenv("MONLAM_BASE_URL")