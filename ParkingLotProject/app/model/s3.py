from fastapi import HTTPException, status
import boto3
import logging
from botocore.exceptions import ClientError
from dotenv import load_dotenv
import os
load_dotenv()

def create_presigned_url(object_name):
  s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv("ACCESS_KEY"),
    aws_secret_access_key=os.getenv("ACCESS_KEY_PRIVATE"),
    region_name='ap-southeast-2'
  )
  try:
    response = s3_client.generate_presigned_post(
      Bucket='wehelp-parkinglot.project',
      Key=f'{object_name}.png',
      ExpiresIn = 1200,
      Fields={"Content-Type": "image/png"},
      Conditions=[
        {"Content-Type": "image/png"}
      ]
    )
  except ClientError as e:
    logging.error(e)
    response = None
    print('Error Message: {}'.format(e.response['Error']['Message']))
    
  finally:  
    return response
