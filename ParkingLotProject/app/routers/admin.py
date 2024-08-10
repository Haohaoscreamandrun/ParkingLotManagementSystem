from fastapi import *
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from typing import Annotated
import datetime
import jwt
import requests
from ..config.basemodel import *
from ..model.manager import admin_lookup
from dotenv import load_dotenv
import os
load_dotenv()
jwtkey = os.getenv('JWTKEY')

router = APIRouter(
    prefix="/api/admin/auth",
    tags=['admin'],
    responses={
        422: {'model': Error, 'description': "Transmission format error"},
        500: {'model': Error, 'description': 'Server internal error'}
    }
)

@router.put("", responses={
      200: {'model': Token, 'description': "Login attempt successful, give admin user a token"},
      400: {'model': Error, "description": "Login failed"}
    }, 
    response_class=JSONResponse,
    response_model= Token,
    summary="The API to validate log in information and reply with token when succeed or with error when failed"
  )
async def admin_login(admin: AdminCredentials):
  try:
    account, password = (s.strip() for s in (admin.account, admin.password))
    # lookup in table 'admin'
    myresult = await admin_lookup(account, password)
    # if admin data not exist
    if len(myresult) == 0:
      # Construct response
      status_code = status.HTTP_400_BAD_REQUEST
      context = {
        "error": True,
        "message": "Admin not exist or input wrong credentials."
      }
    else:
      # construct token
      try:
        # token expired in 1 day
        expiration = datetime.datetime.now() + datetime.timedelta(days=1)
        for admin_credentials in myresult:
          jwt_info = {
              "id" : admin_credentials[0],
              "account" : admin_credentials[1],
              "exp" : expiration
          }
        # Encoded
        enconded_info = jwt.encode(
          payload= jwt_info,
          key= jwtkey,
          algorithm="HS256"
        )
        # Construct response
        status_code = status.HTTP_200_OK
        context = {
          "token": enconded_info
        }
      except jwt.exceptions:
        raise HTTPException(
          status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
          detail= "JWT encoded problem."
        )
  except HTTPException as exc:
    raise HTTPException(
        status_code=exc.status_code,
        detail=exc.detail
    )
  finally:
      return JSONResponse(
          status_code=status_code,
          content=context
      )

@router.get("", responses= {
    200: {'model': ReturnAdmin, 'description': "Successful on decode token"}
    },
    response_class=JSONResponse,
    response_model= ReturnAdmin,
    summary="The API to reply admin log-in status"
  )
async def admin_check(Authorization: str = Header(None)):
  try:
    return_status = ''
    context = {}
    print(Authorization)
    if Authorization is None:
        return_status = status.HTTP_200_OK
        context = {
          'data' : None
        }
    elif Authorization is not None:
        Authorization = Authorization.split(" ")[1]
        user_data = jwt.decode(Authorization, jwtkey, algorithms="HS256")
        return_status = status.HTTP_200_OK
        context = {
            "data": {
                "id": user_data['id'],
                "account": user_data['account']
            }
        }
  except jwt.exceptions:
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail= "jwt decode error."
    )
  except HTTPException as exc:
    raise HTTPException(
        status_code=exc.status_code,
        detail=exc.detail
    )
  finally:
    return JSONResponse(
        status_code=return_status,
        content=context
    )
  