import requests
from fastapi import APIRouter, HTTPException, status, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from typing import Annotated
from ..config.basemodel import *
from ..model.commit import *
from ..model.execute import *

router = APIRouter(
    prefix="/api/third",
    tags=['third'],
    responses={
        422: {'model': Error, 'description': "Transmission format error"},
        500: {'model': Error, 'description': 'Server internal error'}
    }
)

@router.post("/{method}", responses={
    200: {'model': Success, 'description': "Successful on payment"},
    400: {'model': Error, "description": "Failed payment"}
  },
    # response_model= Success,
    response_class=JSONResponse,
    summary="The API to make payment through credit card and grant green light"
)
async def payment_third(method: str, postPayment: PostThirdPayment):
  # make request to Tappay
  tappay_url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
  partner_key = 'partner_MWolLkvQ1R4JQGVp6W2N7yNl15PEYfNBSRUlV14n5TxAbr6oxz33YmSK'
  merchant_id = 'J842671395_TAISHIN'
  request_object = {
    'prime': postPayment.prime,
    'partner_key': partner_key,
    'merchant_id': merchant_id,
    'details': f'Payment for carID:{postPayment.car.id}',
    'order_number': postPayment.car.id,
    'amount': postPayment.car.sub_total,
    'cardholder': {
      "phone_number": postPayment.cardholder.phone_number,
      "name": postPayment.cardholder.name,
      "email": postPayment.cardholder.email
    }
  }
  if method == 'linePay':
    request_object['merchant_id'] = 'J842671395_LINEPAY'
    request_object['result_url'] = {
        'frontend_redirect_url': postPayment.result_url.frontend_redirect_url,
        'backend_notify_url': postPayment.result_url.backend_notify_url,
        'go_back_url': postPayment.result_url.go_back_url
    }

  try:
    response_obj = requests.post(
      url= tappay_url,
      headers={
        'Content-Type': 'application/json',
        'x-api-key': partner_key
      },
      json=request_object
    )
    response = response_obj.json()

    if (response['status'] == 0 and method == 'credit'):
      grant_green_light(postPayment.car.id)
      
      return JSONResponse(
          status_code=status.HTTP_200_OK,
          content={
              'ok': True
          }
      )
    elif (response['status'] == 0 and method == 'linePay'):
      return JSONResponse(
          status_code=status.HTTP_200_OK,
          content={
              'ok': True,
              'payment_url': response['payment_url']
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


@router.post('/linePay/notify', summary="The API to grant green light after get the payment success information from tap pay.")
async def get_tappay_response(request: Request):
    # Get the raw request body
    raw_data = await request.body()
    if raw_data['msg'] == 'Success' and raw_data['status'] == 0:
      grant_green_light(raw_data['order_number'])

# Success request
# {"msg": "Success",
#  "bank_result_code":"0000",
#  "bank_result_msg":"Success.","transaction_time_millis":1724937798969,"rec_trade_id":"LN20240829ooCtMy","bank_transaction_id":"TP20240829ooCtMy",
#  "amount":30,
#  "pay_info":{
#    "credit_card":30,
#    "method":"CREDIT_CARD",
#    "balance":0,
#    "masked_credit_card_number":"************9818",
#    "discount":0,
#    "point":0,
#    "bank_account":0
#    },
#    "order_number":"",
#    "acquirer":"TW_LINE_PAY",
#    "status":0}

# Failed request
# {"msg": "LINE Pay order is canceled",
#  "bank_result_code":"",
#  "bank_result_msg":"",
#  "transaction_time_millis":1724936869878,"rec_trade_id":"LN20240829jeh9f1","bank_transaction_id":"TP20240829jeh9f1",
#  "amount":3160,"order_number":"",
#  "acquirer":"TW_LINE_PAY",
#  "status":924}