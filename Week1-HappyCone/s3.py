import logging
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
import os
load_dotenv()

region = 'ap-southeast-2'
bucket_name = 'wehelp-happycone.project'


def upload_file(file, name, content_type):
  session = boto3.Session(
    aws_access_key_id=os.getenv("ACCESS_KEY"),
    aws_secret_access_key=os.getenv("ACCESS_KEY_PRIVATE")
  )
  s3_client = session.client('s3')
  try:
    s3_client.upload_fileobj(file, bucket_name, name, ExtraArgs={
      'ContentType': content_type
    })
    print(f"File {file} uploaded to {bucket_name}/{name}")
    return True
  except ClientError as e:
    logging.error(e)
    print(f"Upload failed: {e}")
    return False
