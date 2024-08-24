from fastapi import *
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from typing import Annotated
from ..config.basemodel import *

router = APIRouter(
    prefix="/api/third",
    tags=['third'],
    responses={
        422: {'model': Error, 'description': "Transmission format error"},
        500: {'model': Error, 'description': 'Server internal error'}
    }
)

@router.post("/credit", responses={
    200: {'model': Success, 'description': "Successful on payment"},
    400: {'model': Error, "description": "Failed payment"}
  },
    response_class=JSONResponse,
    summary="The API to make payment to 3rd parties"
)
async def payment_credit(postPayment: PostPrimePayment):
  print(postPayment.prime, postPayment.car.id, postPayment.car.sub_total)
  pass