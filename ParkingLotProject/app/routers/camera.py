from fastapi import *
from fastapi.responses import JSONResponse, FileResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from ..config.basemodel import *
from ..model.s3 import *
from ..model.manager import *


router = APIRouter(
    prefix="/api/camera",
    tags=['camera'],
    responses={
        422: {'model': Error, 'description': "Transmission format error"},
        500: {'model': Error, 'description': 'Server internal error'}
    }
)


@router.get('', responses={
    200: {'model': S3UploadURL, 'description': "Get the temperate URL to upload to S3 bucket, or nothing is returned."},
    400: {'model': Error, "description": "Connection failed"}
}, response_model= S3UploadURL)
def get_s3_upload_url(license: str):
  try:
    presignedObj = create_presigned_url(license)
    response = {
      "data": presignedObj
    }
    return JSONResponse(
      status_code=status.HTTP_200_OK,
      content=response
    )
  except (HTTPException, StarletteHTTPException) as exc:
    raise HTTPException(
        status_code=exc.status_code,
        detail=exc.detail
    )


@router.post('', responses={
    200: {'model': Success, 'description': "Get the enter signal or not."},
    400: {'model': Error, "description": "Connection failed"}
}, response_model=Success)
async def post_enter_RDS(data: PostCarEnter):
  
  try:
    lot_id = data.lotID
    license = data.license
    # check vacancy
    vacancy_result = await vacancy_lookup(lot_id)
    vacancy = vacancy_result[0][1]-vacancy_result[0][0]
    lot_id = vacancy_result[0][2]
    # check double
    double = await double_license(license)
    if vacancy > 0 and len(double) == 0:
      await car_enter(lot_id, license)
      return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
          "ok": True
        }
      )
    else:
      return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
          "ok": False
        }
      )
  except (HTTPException, StarletteHTTPException) as exc:
    raise HTTPException(
        status_code=exc.status_code,
        detail=exc.detail
    )
