from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from s3 import upload_file

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get('/', include_in_schema=False)
async def inex(request: Request):
  return FileResponse('./static/view.html', media_type="text/html")

@app.post('/api/postimg', responses={
  200: {'description': "成功新增至資料庫"}
}, response_class=JSONResponse, summary="接收圖片與文字並存於關聯式資料庫中")
async def store_image(file: UploadFile, text: str = Form(...)):
  try:
    print(text, file.filename, file.content_type, file.file)
    upload_file(file.file, file.filename, file.content_type)
    return JSONResponse(
      status_code = status.HTTP_200_OK,
      content={"message": "成功新增至資料庫"}
    )
  except HTTPException as error:
    print(error.detail)
    return JSONResponse(
      status_code= status.HTTP_400_BAD_REQUEST,
      content={"message": error.detail}
    )