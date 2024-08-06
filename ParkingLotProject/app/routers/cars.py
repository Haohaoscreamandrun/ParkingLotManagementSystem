from fastapi import *
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from typing import Annotated
from ..config.basemodel import *


router = APIRouter(
    prefix="/api/cars",
    tags=['cars'],
    responses={
        422: {'model': Error, 'description': "Transmission format error"},
        500: {'model': Error, 'description': 'Server internal error'}
    }
)


@router.get("", responses={
    200: {'model': Success, 'description': "Successful on retrieve cars information"},
    400: {'model': Error, "description": "Failed to connect relational database"}
  },
    response_class=JSONResponse,
    summary="The API to reply cars information list in specific parking lot"
)
async def get_cars_info():
  pass


@router.get("/{license}", responses={
    200: {'model': Success, 'description': "Successful on retrieve specific car information"},
    400: {'model': Error, "description": "Failed to connect relational database"}
  },
    response_class=JSONResponse,
    summary="The API to reply specific car information based on license record"
)
async def get_car_by_license():
  pass


@router.put("/{license}", responses={
    200: {'model': Success, 'description': "Successful on modify specific car information"},
    400: {'model': Error, "description": "Failed to connect relational database"}
},
    response_class=JSONResponse,
    summary="The API to modify specific car information based on parameter"
)
async def put_car_by_license():
  pass


@router.delete("/{license}", responses={
    200: {'model': Success, 'description': "Successful on delete specific car information"},
    400: {'model': Error, "description": "Failed to connect relational database"}
},
    response_class=JSONResponse,
    summary="The API to delete specific car information based on license record"
)
async def get_car_by_license():
  pass
