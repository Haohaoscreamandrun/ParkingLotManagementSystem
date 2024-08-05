from fastapi import *
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from typing import Annotated
from ..config.basemodel import *

router = APIRouter(
  prefix="/api",
  tags=['api'],
  responses = {
    422: {'model': Error, 'description': "Transmission format error"},
    500: {'model': Error, 'description': 'Server internal error'}
  }
)

@router.post("/ocr", responses = {
    200: {'model': Success, 'description': "License plate image and recognition results have been successfully stored in the cloud database"}
}, response_class=JSONResponse, summary="Accept OCR data from front-end, then store the image to S3 and data to RCD")
async def storing_car_plate(request: Request, imageFile: UploadFile, recognized: str = Form(...)):
  ALLOWED_IMAGE_CONTENT_TYPES = {
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp',
      'image/tiff'
  }
  # Check if the file content type is allowed
  if imageFile.content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
    raise HTTPException(
      status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
      detail="Invalid file type. Only image files are allowed."
    )
  print(recognized)
  pass