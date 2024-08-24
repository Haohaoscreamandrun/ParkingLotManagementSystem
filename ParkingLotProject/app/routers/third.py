import requests
from fastapi import APIRouter
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
  # make request to Tappay
  tappay_url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
  partner_key = 'partner_MWolLkvQ1R4JQGVp6W2N7yNl15PEYfNBSRUlV14n5TxAbr6oxz33YmSK'
  merchant_id = 'J842671395_TAISHIN'
  response_obj = requests.post(
    url= tappay_url,
    headers={
      'Content-Type': 'application/json',
      'x-api-key': partner_key
    },
    json={
      'prime': postPayment.prime,
      'partner_key': partner_key,
      'merchant_id': merchant_id,
      'details': f'Payment for carID:{postPayment.car.id}',
      'amount': postPayment.car.sub_total
    }
  )
  response = response_obj.json()
  print(response)

  pass