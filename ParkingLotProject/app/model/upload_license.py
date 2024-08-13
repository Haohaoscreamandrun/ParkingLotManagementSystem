from fastapi import HTTPException, status
import boto3
import logging
from botocore.exceptions import ClientError
from dotenv import load_dotenv
import os
load_dotenv()

# bucket_name = 'wehelp-parkinglot.project'

# def upload_file(file, name, content_type):
#   session = boto3.Session(
#       aws_access_key_id=os.getenv("ACCESS_KEY"),
#       aws_secret_access_key=os.getenv("ACCESS_KEY_PRIVATE"),
#       region_name='ap-southeast-2'
#   )

def create_presigned_url(object_name):
  session = boto3.Session(
      aws_access_key_id=os.getenv("ACCESS_KEY"),
      aws_secret_access_key=os.getenv("ACCESS_KEY_PRIVATE"),
      region_name='ap-southeast-2'
  )
  s3_client = session.client('s3')
  try:
    response = s3_client.generate_presigned_post(
      bucket_name='wehelp-parkinglot.project',
      object_name = object_name,
      expiration = 12
    )
  except ClientError as e:
    logging.error(e)
    response = None
    print('Error Message: {}'.format(e.response['Error']['Message']))
    # raise HTTPException(
    #   status_code=status.HTTP_401_UNAUTHORIZED,
    #   detail= e.response['Error']['Message']
    # )
  finally:  
    return response