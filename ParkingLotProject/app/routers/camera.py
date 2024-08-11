from fastapi import *
from fastapi.responses import JSONResponse, FileResponse
from starlette.exceptions import HTTPException
from ..config.basemodel import *


router = APIRouter(
    prefix="/camera",
    tags=['camera'],
    responses={
        422: {'model': Error, 'description': "Transmission format error"},
        500: {'model': Error, 'description': 'Server internal error'}
    }
)


@router.get('/{parkinglotID}', include_in_schema=False)
async def inex(request: Request):
  return FileResponse('./static/camera.html', media_type="text/html")
