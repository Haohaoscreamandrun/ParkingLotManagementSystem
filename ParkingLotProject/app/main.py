from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
# router import
from routers import api

tags_meta = [
  {
    "name": "api",
    "description": "All APIs related to the backend management system"
  },
]

app = FastAPI(
  title="Parking Lot Management System",
  summary= "This app can help you manage a parking lot as an administrative, or provide e-payment method to your customer.",
  version="0.0.1",
  contact={
    'Name': "Haohaoscreamandrun",
    "email": "J842671395@gmail.com"
  },
  openapi_tags=tags_meta
)
# Router include

app.include_router(api.router)

# Static files

app.mount("/static", StaticFiles(directory="../static"), name="static")
app.mount("/public", StaticFiles(directory="../public"), name="public")

# Static Pages

@app.get('/', include_in_schema=False)
async def inex(request: Request):
  return FileResponse('../static/OCR.html', media_type="text/html")

# Error Handler

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
  return JSONResponse(
    status_code= status.HTTP_422_UNPROCESSABLE_ENTITY,
    content={
      "error": True,
      "message": str(f"{exc.errors()[0]['loc'][1]}:{exc.errors()[0]['msg']}")
    }
  )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
  return JSONResponse(
    status_code=exc.status_code,
    content=exc.detail
  )

@app.exception_handler(StarletteHTTPException)
async def starlette_exception_handler(request: Request, exc: StarletteHTTPException):
  return JSONResponse(
    status_code=exc.status_code,
    content=exc.detail
  )
