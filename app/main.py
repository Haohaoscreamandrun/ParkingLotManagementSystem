from fastapi import FastAPI, Request, status, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from mysql.connector import Error as MysqlException
# router import
from .routers import admin, cars, parkinglot, third, camera

tags_meta = [
  {
    "name": "admin",
    "description": "For admin sign-in and get token"
  },
  {
    "name": "parkinglot",
    "description": "Provide the information of all or specific parking lot"
  },
  {
    "name": "cars",
    "description": "For all to get cars or specific car information and for admin to manipulate the database"
  },
  {
    "name": "third",
    "description": "Process the payment related to 3rd parties"
  },
  {
    "name": "camera",
    "description": "Reply the upload URL object to AWS S3 service."
  }
]

app = FastAPI(
  title="Parking Lot Management System",
  summary= "This app can help you manage a parking lot as an administrative, or provide e-payment method to your customer. User can look up the parking lot through map and get real time vacancy information.",
  version="0.0.1",
  contact={
    'Name': "Haohaoscreamandrun",
    "email": "J842671395@gmail.com"
  },
  openapi_tags=tags_meta
)
# Router include

app.include_router(admin.router)
app.include_router(parkinglot.router)
app.include_router(cars.router)
app.include_router(third.router)
app.include_router(camera.router)

# Static files

app.mount("/static", StaticFiles(directory="./static"), name="static")
app.mount("/public", StaticFiles(directory="./public"), name="public")

# Static Pages

@app.get('/', include_in_schema=False)
async def static_index(request: Request):
  return FileResponse('./static/index.html', media_type="text/html")


@app.get('/admin', include_in_schema=False)
async def static_admin(request: Request):
  return FileResponse('./static/admin.html', media_type="text/html")


@app.get('/choose/{lotID}', include_in_schema=False)
async def static_choose(request: Request, lotID: int):
  return FileResponse('./static/choose.html', media_type="text/html")


@app.get('/payment/{car_id}', include_in_schema=False)
async def static_payment(request: Request, car_id: str):
  return FileResponse('./static/payment.html', media_type="text/html")


@app.get('/camera/{parkinglotID}', include_in_schema=False)
async def static_camera(request: Request):
  return FileResponse('./static/camera.html', media_type="text/html")


@app.get('/thankyou/{parkinglotID}', include_in_schema=False)
async def static_thankyou(request: Request):
  return FileResponse('./static/thankyou.html', media_type="text/html")

# Error Handler


@app.exception_handler(MysqlException)
async def MysqlException_exception_handler(request: Request, exc: MysqlException):
  return JSONResponse(
    status_code= status.HTTP_500_INTERNAL_SERVER_ERROR,
    content= {
      "error": True,
      "message": str(f"Code: {exc.errno}, {exc.msg}")
    }
  )


@app.exception_handler(RequestValidationError)
async def RequestValidation_exception_handler(request: Request, exc: RequestValidationError):
  return JSONResponse(
    status_code= status.HTTP_422_UNPROCESSABLE_ENTITY,
    content={
      "error": True,
      "message": str(f"{exc.errors()[0]['loc'][-1]}:{exc.errors()[0]['msg']}")
    }
  )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
  return JSONResponse(
    status_code=exc.status_code,
    content= {
      "error": True,
      "message": exc.detail
    }
  )

@app.exception_handler(StarletteHTTPException)
async def starlette_exception_handler(request: Request, exc: StarletteHTTPException):
  return JSONResponse(
    status_code=exc.status_code,
    content={
      "error": True,
      "message": exc.detail
    }
  )
