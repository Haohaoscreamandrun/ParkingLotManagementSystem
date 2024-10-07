from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from ..config.basemodel import Error, S3UploadURL
from ..model.s3 import create_presigned_url


router = APIRouter(
    prefix="/api/camera",
    tags=["camera"],
    responses={
        422: {"model": Error, "description": "Transmission format error"},
        500: {"model": Error, "description": "Server internal error"},
    },
)


@router.get(
    "",
    responses={
        200: {
            "model": S3UploadURL,
            "description": "Get the temperate URL to upload to S3 bucket, or nothing is returned.",
        },
        400: {"model": Error, "description": "Connection failed"},
    },
    response_model=S3UploadURL,
    response_class=JSONResponse,
    summary="The API that return the s3 upload object.",
)
def get_s3_upload_url(license: str):
    try:
        presignedObj = create_presigned_url(license)
        response = {"data": presignedObj}
        return JSONResponse(status_code=status.HTTP_200_OK, content=response)
    except (HTTPException, StarletteHTTPException) as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)
