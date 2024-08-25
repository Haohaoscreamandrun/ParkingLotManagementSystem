import requests
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from typing import Annotated
from ..config.basemodel import *
from ..model.manager import grant_green_light

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
    response_model= Success,
    response_class=JSONResponse,
    summary="The API to make payment through credit card and grant green light"
)
async def payment_credit(postPayment: PostPrimePayment):
  # make request to Tappay
  tappay_url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
  partner_key = 'partner_MWolLkvQ1R4JQGVp6W2N7yNl15PEYfNBSRUlV14n5TxAbr6oxz33YmSK'
  merchant_id = 'J842671395_TAISHIN'
  try:
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
        'amount': postPayment.car.sub_total,
        'cardholder':{
          "phone_number": postPayment.card_holder.phone_number,
          "name": postPayment.card_holder.name,
          "email": postPayment.card_holder.email
        }
      }
    )
    response = response_obj.json()

    if (response['status'] == 0):
      await grant_green_light(postPayment.car.id)
      
      return JSONResponse(
          status_code=status.HTTP_200_OK,
          content={
              'ok': True
          }
      )
    else:
      return JSONResponse(
          status_code=status.HTTP_200_OK,
          content={
              'error': True,
              'message': response['msg']
          }
      )
  except (HTTPException, StarletteHTTPException) as exc:
    raise HTTPException(
        status_code=exc.status_code,
        detail=exc.detail
    )
