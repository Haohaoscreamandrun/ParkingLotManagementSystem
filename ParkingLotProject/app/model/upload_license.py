import boto3
from dotenv import load_dotenv
import os
load_dotenv()

region = 'ap-southeast-2'
bucket_name = 'wehelp-parkinglot.project'


def upload_file(file, name, content_type):
  session = boto3.Session(
      aws_access_key_id=os.getenv("ACCESS_KEY"),
      aws_secret_access_key=os.getenv("ACCESS_KEY_PRIVATE"),
      region_name=region
  )
  s3_client = session.client('s3')
