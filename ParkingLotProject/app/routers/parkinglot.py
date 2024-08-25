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
    200: {'model': RetrunParkingLot, 'description': "Successful on retrieve parking lots information"},
    400: {'model': Error, "description": "Failed to connect relational database"}
  },
    response_class=JSONResponse,
    response_model=RetrunParkingLot,
    summary="The API to reply nearest parking lot list based on altitude and latitude parameter or just all parking lots"
)
async def get_parking_lots(latitude: float, longitude: float, number: int = 15):
  try:
    myresult = parkinglot_by_localtion(latitude, longitude, number, 3000)
    if len(myresult) > 0:
      response_content_list = []
      for result in myresult:
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

@router.get("/{lotID}", responses={
    200: {'model': RetrunParkingLot, 'description': "Successful on retrieve parking lot information"},
    400: {'model': Error, "description": "Failed to connect relational database"}
  },
    response_class=JSONResponse,
    response_model=RetrunParkingLot,
    summary="The API to reply specific parking lot information based on parking lot ID"
)
async def get_parking_lot_by_ID(lotID: str):
  try:
    myresult = parkinglot_by_id(lotID)
    if len(myresult) > 0:
      response_content_list = []
      for result in myresult:
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
