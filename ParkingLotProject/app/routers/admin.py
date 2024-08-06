from fastapi import *
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from typing import Annotated
from ..config.basemodel import *

router = APIRouter(
    prefix="/api/admin/auth",
    tags=['admin'],
    responses={
        422: {'model': Error, 'description': "Transmission format error"},
        500: {'model': Error, 'description': 'Server internal error'}
    }
)

@router.put("", responses={
      200: {'model': Success, 'description': "Login attempt successful, give admin user a token"},
      400: {'model': Error, "description": "Login failed"}
    }, 
    response_class=JSONResponse, 
    summary="The API to validate log in information and reply with token when succeed or with error when failed"
  )
async def admin_login():
  pass

@router.get("", responses= {
      200: {'model': Success, 'description': "Successful on decode token"}
    },
    response_class=JSONResponse,
    summary="The API to reply admin log-in status"
  )
async def admin_check():
  pass