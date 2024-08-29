from fastapi import *
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from ..config.basemodel import *
from ..model.commit import *
from ..model.execute import *

router = APIRouter(
    prefix="/api/parkinglot",
    tags=['parkinglot'],
    responses={
        422: {'model': Error, 'description': "Transmission format error"},
        500: {'model': Error, 'description': 'Server internal error'}
    }
)

@router.get("", responses={
    200: {'model': RetrunParkingLotObj, 'description': "Successful on retrieve parking lots information based on distance or specific parking lot information, or else return noting if condition is not met."}
  },
    response_class=JSONResponse,
    response_model=RetrunParkingLotObj,
    summary="The API to reply nearest parking lot list based on longitude and latitude parameter or parking lots within 3km from user."
)
async def get_parking_lots(
  latitude: float = Query(None, 
                          description="Latitude for location-based search"), 
  longitude: float = Query(None, 
                           description="Longitude for location-based search"),
  number: int = Query(15, 
                      description="Number of parking lots to retrieve if location is provided"),
  lot_id: str = Query(None, alias='lotID',
                    description="Parking lot ID for specific lot retrieval")):
  try:
    
    # Cond 1: lotID is provided
    if lot_id:
      my_result = parkinglot_by_id(lot_id)
      response_content_list = []
      if len(my_result) > 0:
        for result in my_result:
          response_content = {
              'id': result[0],
              'name': result[1],
              'longitude':  result[2],
              'latitude': result[3],
              'address': result[4],
              'total_space': result[5],
              'parking_fee': result[6],
              'admin_id': result[7]
          }
          response_content_list.append(response_content)
    # Cond 2: latitude and longitude is provided
    elif latitude is not None and longitude is not None:
      my_result = parking_lot_by_location(latitude, longitude, number, 3000)
      response_content_list = []
      if len(my_result) > 0:
        for result in my_result:
          response_content = {
              'id': result[0],
              'name': result[1],
              'longitude':  result[2],
              'latitude': result[3],
              'address': result[4],
              'total_space': result[5],
              'parking_fee': result[6],
              'admin_id': result[7],
              'distance': result[8]
          }
          response_content_list.append(response_content)

    return JSONResponse(
      status_code=status.HTTP_200_OK,
      content={
          'data':response_content_list
      }
    )

  except (HTTPException, StarletteHTTPException) as exc:
    raise HTTPException(
        status_code=exc.status_code,
        detail=exc.detail
    )