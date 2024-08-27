from fastapi import *
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
import pytz
from datetime import datetime, timezone,timedelta
from concurrent.futures import ThreadPoolExecutor
from ..config.basemodel import *
from ..model.commit import *
from ..model.execute import *
from ..model.s3 import *
from ..dependencies import *


router = APIRouter(
    prefix="/api/cars",
    tags=['cars'],
    responses={
        422: {'model': Error, 'description': "Transmission format error"},
        500: {'model': Error, 'description': 'Server internal error'}
    }
)

# Convert to local timezone
def convert_timezone(UTC):
  if UTC.tzinfo is None:
    UTC = pytz.utc.localize(UTC)
  local_tz = pytz.timezone('Asia/Taipei')
  dt_local = UTC.astimezone(local_tz)
  formatted_dt_local = dt_local.isoformat()
  return formatted_dt_local

@router.get("", responses={
    200: {'model': ReturnCarsObj, 'description': "Successful on retrieve cars information"},
    400: {'model': Error, "description": "Failed to connect relational database"}
  },
    response_class=JSONResponse,
    response_model=ReturnCarsObj,
    summary="The API to reply cars information list in specific parking lot"
)
async def get_cars_info(lot_id: int):
  try:
    myresult = cars_in_parking_lot(lot_id)
    if len(myresult) > 0:
      response_content_list = []
      for result in myresult:
        response_content = {
          'car_id' : result[0],
          'license': result[1],
          'enter_time': convert_timezone(result[2]),
          'green_light': convert_timezone(result[3]),
          'parking_lot_id': result[4]
        }
        response_content_list.append(response_content)
      return JSONResponse(
        status_code= status.HTTP_200_OK,
        content= {
          'data': response_content_list
        }
      )
    else:
      return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            'data': None
        }
      )

  except (HTTPException, StarletteHTTPException) as exc:
    raise HTTPException(
        status_code=exc.status_code,
        detail=exc.detail
    )


@router.get("/{car_ID}", responses={
    200: {'model': ReturnCarsObj, 'description': "Successful on retrieve specific car information"},
    400: {'model': Error, "description": "Failed to connect relational database"}
  },
    response_class=JSONResponse,
    response_model=ReturnCarsObj,
    summary="The API to reply specific car information based on license record"
)
async def get_car_by_ID(car_ID: str):
  try:
    myresult = car_by_carID(car_ID)
    if len(myresult) > 0:
      response_content_list = []
      for result in myresult:
        response_content = {
            'car_id': result[0],
            'license': result[1],
            'enter_time': convert_timezone(result[2]),
            'green_light': convert_timezone(result[3]),
            'parking_lot_id': result[4]
        }
        response_content_list.append(response_content)
      return JSONResponse(
          status_code=status.HTTP_200_OK,
          content={
              'data': response_content_list
          }
      )
    else:
      return JSONResponse(
          status_code=status.HTTP_200_OK,
          content={
              'data': None
          }
      )

  except (HTTPException, StarletteHTTPException) as exc:
    raise HTTPException(
        status_code=exc.status_code,
        detail=exc.detail
    )


@router.post('', responses={
      200: {'model': Success, 'description': "Success on post a new car."},
      400: {'model': Error, "description": "Failed to post a new car due to no vacancy or doubled license."}
    }, 
    response_model=Success, 
    response_class=JSONResponse, 
    summary="The API to post new car into assigned parking lot.")
async def post_enter_RDS(data: PostCarEnter):

  try:
    lot_id = data.lotID
    license = data.license
    # check vacancy
    vacancy_result = await vacancy_lookup(lot_id)
    vacancy = vacancy_result[0][1]-vacancy_result[0][0]
    lot_id = vacancy_result[0][2]
    # check double
    double = await car_by_license(license)
    if vacancy > 0 and len(double) == 0:
      await car_enter(lot_id, license)
      return JSONResponse(
          status_code=status.HTTP_200_OK,
          content={
              "ok": True
          }
      )
    elif vacancy == 0:
      return JSONResponse(
          status_code=status.HTTP_400_BAD_REQUEST,
          content={
              "error": True,
              "message": "There's no vacancy right now!"
          }
      )
    elif len(double) > 0:
      return JSONResponse(
          status_code=status.HTTP_400_BAD_REQUEST,
          content={
              "error": True,
              "message": "You license duplicates with a exist car in this or another parking lot."
          }
      )
  except (HTTPException, StarletteHTTPException) as exc:
    raise HTTPException(
        status_code=exc.status_code,
        detail=exc.detail
    )

@router.put("", responses={
    200: {'model': Success, 'description': "Successful on modify specific car information"},
    400: {'model': Error, "description": "Failed to connect relational database"}
},
    response_class=JSONResponse,
    summary="The API to modify specific car information based on parameter"
)
async def put_car_by_id(admin: Annotated[dict, Depends(admin_validation_dependency)], updates: PutCarInfo):
  # check admin can update this car info
  parking_lot_list = await admin_parking_lot_lookup(admin['id'])
  parking_lot_id_list = list(tuple[0] for tuple in parking_lot_list)
  target_lot_id = updates.lotID
  try:

    car = await car_by_carID(updates.carID)
    original_license = car[0][1]

    if updates.updateLicense != original_license:
      await car_update(updates.carID, updates.updateLicense)
      copy_file(updates.updateLicense, original_license)
      delete_file(original_license)
      
    
    if target_lot_id not in parking_lot_id_list:
      # logic if not authorized
      return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": True,
            "message": "Your account has not authorization to update this car information."
        }
      )
    elif target_lot_id in parking_lot_id_list and updates.isPaid:
      # logic if authorized, and if isPaid is true
      await grant_green_light(updates.carID)
      return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "ok": True
        }
      )
    elif target_lot_id in parking_lot_id_list and not updates.isPaid:
      # logic if authorized, and if isPaid is not true
      return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "ok": True
        }
      )
  except (HTTPException, StarletteHTTPException) as exc:
    raise HTTPException(
      status_code=exc.status_code,
      detail=exc.detail
    )


@router.delete("/{license}", responses={
    200: {'model': Success, 'description': "Successful on delete specific car information"},
    400: {'model': Error, "description": "Not paid yet or wrong license."}
},
    response_class=JSONResponse,
    summary="The API to delete specific car information based on license record"
)
async def delete_car_by_license(license: str, lot_id: int):
  try:
    car = await car_by_license(license)
    car = car[0]
    car_enter_time = datetime.fromisoformat(convert_timezone(car[2]))
    car_green_light = datetime.fromisoformat(convert_timezone(car[3]))
    now = datetime.now(timezone(timedelta(hours=+8)))

    if car_green_light > now:
      # is paid and within 15 mins
      await car_exit(lot_id, license)
      await delete_file(license)
      return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "ok": True
        }
      )
    elif car_green_light == car_enter_time:
      return JSONResponse(
          status_code=status.HTTP_400_BAD_REQUEST,
          content={
              "error": True,
              "message": "Not yet paid."
          }
      )
    elif car_green_light != car_enter_time and car_green_light < now:
      return JSONResponse(
          status_code=status.HTTP_400_BAD_REQUEST,
          content={
              "error": True,
              "message": "Exit overtime."
          }
      )
  except (HTTPException, StarletteHTTPException) as exc:
    raise HTTPException(
        status_code=exc.status_code,
        detail=exc.detail
    )
