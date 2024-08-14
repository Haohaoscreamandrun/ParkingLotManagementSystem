from fastapi import *
from fastapi.responses import JSONResponse, FileResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from ..config.basemodel import *
from ..model.s3 import *


router = APIRouter(
    prefix="/api/camera",
    tags=['camera'],
    responses={
        422: {'model': Error, 'description': "Transmission format error"},
        500: {'model': Error, 'description': 'Server internal error'}
    }
)


@router.get('/{parkinglotID}', include_in_schema=False)
async def inex(request: Request):
  return FileResponse('./static/camera.html', media_type="text/html")


@router.post('', responses={
    200: {'model': S3UploadURL, 'description': "Get the temperate URL to upload to S3 bucket, or nothing is returned."},
    400: {'model': Error, "description": "Connection failed"}
})
def get_s3_upload_url(license: str):
  try:
    response = create_presigned_url(license)
    return JSONResponse(
      status_code=status.HTTP_200_OK,
      content=response
    )
  except (HTTPException, StarletteHTTPException) as exc:
    raise HTTPException(
        status_code=exc.status_code,
        detail=exc.detail
    )
