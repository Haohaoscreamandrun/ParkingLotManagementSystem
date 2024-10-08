import requests
import json
from fastapi import APIRouter, HTTPException, status, Request
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from ..config.basemodel import Error, Success, PostThirdPayment
from ..model.commit import grant_green_light

router = APIRouter(
    prefix="/api/third",
    tags=["third"],
    responses={
        422: {"model": Error, "description": "Transmission format error"},
        500: {"model": Error, "description": "Server internal error"},
    },
)


@router.post(
    "/{method}",
    responses={
        200: {"model": Success, "description": "Successful on payment"},
        400: {"model": Error, "description": "Failed payment"},
    },
    # response_model= Success,
    response_class=JSONResponse,
    summary="The API to make payment through credit card and grant green light",
)
async def payment_third(method: str, postPayment: PostThirdPayment):
    # make request to Tappay
    tappay_url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
    partner_key = "partner_MWolLkvQ1R4JQGVp6W2N7yNl15PEYfNBSRUlV14n5TxAbr6oxz33YmSK"
    merchant_id = postPayment.merchant_id
    request_object = {
        "prime": postPayment.prime,
        "partner_key": partner_key,
        "details": f"Payment_for_carID:{postPayment.car.id}",
        "order_number": postPayment.car.id,
        "amount": int(postPayment.car.sub_total),
        "cardholder": {
            "phone_number": postPayment.cardholder.phone_number,
            "name": postPayment.cardholder.name,
            "email": postPayment.cardholder.email,
        },
    }
    if method == "credit":
        request_object["merchant_id"] = merchant_id
    elif method != "credit":
        request_object["merchant_id"] = merchant_id
        request_object["result_url"] = {
            "frontend_redirect_url": postPayment.result_url.frontend_redirect_url,
            "backend_notify_url": postPayment.result_url.backend_notify_url,
        }

    try:
        response_obj = requests.post(
            url=tappay_url,
            headers={"Content-Type": "application/json", "x-api-key": partner_key},
            json=request_object,
        )
        response = response_obj.json()

        if response["status"] == 0 and method == "credit":
            grant_green_light(postPayment.car.id)

            return JSONResponse(status_code=status.HTTP_200_OK, content={"ok": True})
        elif response["status"] == 0 and method != "credit":
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={"ok": True, "payment_url": response["payment_url"]},
            )
        else:
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={"error": True, "message": response["msg"]},
            )
    except (HTTPException, StarletteHTTPException) as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)


@router.post(
    "/thirdPay/notify",
    summary="The API to grant green light after get the payment success information from tap pay.",
)
async def get_tappay_response(request: Request):
    try:
        # Get the raw request body
        raw_data = await request.body()
        # Decode bytes to a string (assuming it's UTF-8 encoded text)
        decoded_data = raw_data.decode("utf-8")
        # Process the decoded data (if it’s JSON, you’ll need to parse it)
        data = json.loads(decoded_data)
        if data.get("msg") == "Success" and data.get("status") == 0:
            grant_green_light(data.get("order_number"))
    except (HTTPException, StarletteHTTPException) as exc:
        print(exc)
    except json.JSONDecodeError:
        print("Invalid JSON format")


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
