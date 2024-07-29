from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from typing import List
from s3 import upload_file
from RDS import insert_data, select_all

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get('/', include_in_schema=False)
async def inex(request: Request):
  return FileResponse('./static/view.html', media_type="text/html")

@app.post('/api/postimg', responses={
  200: {'description': "成功新增至資料庫"},
  400: {'description': "新增至資料庫失敗"},
  500: {'description': "伺服器錯誤"},
  503: {'description': "資料庫連線失敗"}
}, response_class=JSONResponse, summary="接收圖片與文字並存於關聯式資料庫中")
async def store_image(file: UploadFile, text: str = Form(...)):
  ALLOWED_IMAGE_CONTENT_TYPES = {
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/tiff'
  }
  # Check if the file content type is allowed
  if file.content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
      
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid file type. Only image files are allowed.")

  try:

    obj_name = upload_file(file.file, file.filename, file.content_type)
    
    insert_data(text, obj_name)
    
    stat = status.HTTP_200_OK
    content={"message": "成功新增至資料庫"}
    
  except HTTPException as error:
    
    stat = error.status_code
    content={"message": error.detail}

  except Exception as e:
    
    stat = status.HTTP_500_INTERNAL_SERVER_ERROR
    content = {"message": f"Internal server error: {str(e)}"}

  return JSONResponse(
    status_code=stat,
    content=content
  )
  


@app.get('/api/getrds', responses={
    200: {'description': "成功自資料庫取得資料"},
    400: {'description': "新增至資料庫失敗"},
    500: {'description': "伺服器錯誤"},
    503: {'description': "資料庫連線失敗"}
}, response_class=JSONResponse, summary="取得存於關聯式資料庫中圖片與文字")
def get_data():
  
  try: 
    content = []
    data_list = select_all()
    for data in data_list:
      obj = {
        'id': data[0],
        'text': data[1],
        'url': data[2]
      }
      content.append(obj)
    stat = status.HTTP_200_OK

  except HTTPException as error:

    stat = error.status_code
    content = {"message": error.detail}
  
  except Exception as e:

    stat = status.HTTP_500_INTERNAL_SERVER_ERROR
    content = {"message": f"Internal server error: {str(e)}"}

  return JSONResponse(
      status_code=stat,
      content = content
    )


@app.get("/loaderio-16fd09a270e82919c66dcefde9817800")
async def loaderIO():
  return FileResponse("./static/loaderio-16fd09a270e82919c66dcefde9817800.txt", media_type="text/html")
