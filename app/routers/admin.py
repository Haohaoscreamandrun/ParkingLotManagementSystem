from fastapi import APIRouter, status, HTTPException, Header
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from datetime import datetime, timedelta
import jwt
from ..config.basemodel import (
    Error,
    ReturnAdminParkingLotsObj,
    Token,
    AdminCredentials,
    ReturnAdmin,
)
from ..model.execute import admin_parking_lot_lookup, admin_lookup
from dotenv import load_dotenv
import os

load_dotenv()
jwtkey = os.getenv("JWTKEY")

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    responses={
        422: {"model": Error, "description": "Transmission format error"},
        500: {"model": Error, "description": "Server internal error"},
    },
)


@router.get(
    "",
    responses={
        200: {
            "model": ReturnAdminParkingLotsObj,
            "description": "Successful on decode token",
        }
    },
    response_class=JSONResponse,
    response_model=ReturnAdminParkingLotsObj,
    summary="The API to reply admin controls parking lots",
)
async def get_lots_by_admin(admin: int):
    try:
        parking_lots = await admin_parking_lot_lookup(admin)
        if len(parking_lots) > 0:
            response_content_list = []
            for parking_lot in parking_lots:
                response_content = {
                    "lot_id": parking_lot[0],
                    "lot_name": parking_lot[1],
                }
                response_content_list.append(response_content)
            return JSONResponse(
                status_code=status.HTTP_200_OK, content={"data": response_content_list}
            )
        else:
            return JSONResponse(status_code=status.HTTP_200_OK, content={"data": None})
    except (HTTPException, StarletteHTTPException) as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)


@router.put(
    "/auth",
    responses={
        200: {
            "model": Token,
            "description": "Login attempt successful, give admin user a token",
        },
        400: {"model": Error, "description": "Login failed"},
    },
    response_class=JSONResponse,
    response_model=Token,
    summary="The API to validate log in information and reply with token when succeed or with error when failed",
)
async def admin_login(admin: AdminCredentials):
    try:
        account, password = (s.strip() for s in (admin.account, admin.password))
        # lookup in table 'admin'
        myresult = await admin_lookup(account, password)
        # if admin data not exist
        if len(myresult) == 0:
            # Construct response
            print("wrong credentials")
            status_code = status.HTTP_400_BAD_REQUEST
            context = {
                "error": True,
                "message": "Admin not exist or input wrong credentials.",
            }
            return JSONResponse(status_code=status_code, content=context)
        else:
            # construct token
            try:
                # token expired in 1 day
                expiration = datetime.now() + timedelta(days=1)
                for admin_credentials in myresult:
                    jwt_info = {
                        "id": admin_credentials[0],
                        "account": admin_credentials[1],
                        "exp": expiration,
                    }
                # Encoded
                enconded_info = jwt.encode(
                    payload=jwt_info, key=jwtkey, algorithm="HS256"
                )
                # Construct response
                status_code = status.HTTP_200_OK
                context = {"token": enconded_info}
                return JSONResponse(status_code=status_code, content=context)
            except jwt.exceptions:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="JWT encoded problem.",
                )
    except (HTTPException, StarletteHTTPException) as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)


@router.get(
    "/auth",
    responses={
        200: {"model": ReturnAdmin, "description": "Successful on decode token"}
    },
    response_class=JSONResponse,
    response_model=ReturnAdmin,
    summary="The API to reply admin log-in status",
)
async def admin_check(Authorization: str = Header(None)):
    try:
        if type(Authorization) is type(None):
            return_status = status.HTTP_200_OK
            context = {"data": None}
        elif Authorization is not None:
            Authorization = Authorization.split(" ")[1]
            user_data = jwt.decode(Authorization, jwtkey, algorithms="HS256")
            return_status = status.HTTP_200_OK
            context = {"data": {"id": user_data["id"], "account": user_data["account"]}}
        return JSONResponse(status_code=return_status, content=context)
    except (jwt.ExpiredSignatureError, jwt.DecodeError, jwt.InvalidTokenError):
        print("There are problems with jwt decoding!")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="jwt decode error.",
        )
    except (HTTPException, StarletteHTTPException) as exc:
        print("Something wrong with connection.")
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)
