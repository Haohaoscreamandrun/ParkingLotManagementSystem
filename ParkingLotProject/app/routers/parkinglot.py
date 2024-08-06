from fastapi import *
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from typing import Annotated
from ..config.basemodel import *

router = APIRouter(
    prefix="/api/parkinglot",
    tags=['parkinglot'],
    responses={
        422: {'model': Error, 'description': "Transmission format error"},
        500: {'model': Error, 'description': 'Server internal error'}
    }
)

@router.get("", responses={
    200: {'model': Success, 'description': "Successful on retrieve parking lots information"},
    400: {'model': Error, "description": "Failed to connect relational database"}
  },
    response_class=JSONResponse,
    summary="The API to reply nearest parking lot list based on altitude and latitude parameter or just all parking lots"
)
async def get_parking_lots():
  pass

@router.get("/{lotID}", responses={
    200: {'model': Success, 'description': "Successful on retrieve parking lot information"},
    400: {'model': Error, "description": "Failed to connect relational database"}
  },
    response_class=JSONResponse,
    summary="The API to reply specific parking lot information based on parking lot ID"
)
async def get_parking_lot_by_ID():
  pass