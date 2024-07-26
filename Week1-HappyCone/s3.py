import logging
import boto3
import hashlib
import datetime
from fastapi import HTTPException
from starlette import status
from botocore.exceptions import ClientError
from dotenv import load_dotenv
import os
load_dotenv()

region = 'ap-southeast-2'
bucket_name = 'wehelp-happycone.project'


def upload_file(file, name, content_type):
  session = boto3.Session(
    aws_access_key_id=os.getenv("ACCESS_KEY"),
    aws_secret_access_key=os.getenv("ACCESS_KEY_PRIVATE"),
    region_name=region
  )
  s3_client = session.client('s3')

  # hash the file name with time stamp
  current_time = datetime.datetime.now()
  string = f'{name}{current_time}'
  hash_obj = hashlib.sha256(str.encode(string))
  hash_string = hash_obj.hexdigest()[:64]

  try:
    s3_client.upload_fileobj(file, bucket_name, hash_string, ExtraArgs={
      'ContentType': content_type
    })
    return hash_string
  except ClientError as e:
    logging.error(e)
    print(f"Upload failed: {e}")
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="S3 Client error!"
    )
