from fastapi import *
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
import pytz
from ..config.basemodel import *
from ..model.commit import *
from ..model.execute import *


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


@router.post('/{license}', responses={
      200: {'model': Success, 'description': "Success on post a new car."},
      400: {'model': Error, "description": "Connection failed"}
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
    double = await double_license(license)
    if vacancy > 0 and len(double) == 0:
      await car_enter(lot_id, license)
      return JSONResponse(
          status_code=status.HTTP_200_OK,
          content={
              "ok": True
          }
      )
    else:
      return JSONResponse(
          status_code=status.HTTP_200_OK,
          content={
              "ok": False
          }
      )
  except (HTTPException, StarletteHTTPException) as exc:
    raise HTTPException(
        status_code=exc.status_code,
        detail=exc.detail
    )

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
