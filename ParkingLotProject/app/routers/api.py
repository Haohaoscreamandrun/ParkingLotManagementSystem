from fastapi import APIRouter, Request, Header
from fastapi.responses import JSONResponse
from config.basemodel import *

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
async def storing_car_plate(request: Request):
  pass