from fastapi import APIRouter, File, UploadFile, HTTPException
from pathlib import Path
import shutil
import uuid
from datetime import datetime
router = APIRouter(prefix="/upload", tags=["Upload"])
UPLOAD_DIR = Path("uploads/images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        file_extension = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        url = f"/uploads/images/{unique_filename}"
        return {
            "url": url,
            "filename": unique_filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")