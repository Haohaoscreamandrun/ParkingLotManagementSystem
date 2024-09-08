from fastapi import HTTPException
import redis
import json
from datetime import datetime
from dotenv import load_dotenv
import os
load_dotenv()
REDIS_KEY = os.getenv('REDIS')

# Connect to redis on port 6379
def get_redis_cloud():
  try:
    r = redis.Redis(
        host='redis-13212.c15.us-east-1-2.ec2.redns.redis-cloud.com',
        port=13212,
        password=REDIS_KEY,
        decode_responses=True)
    # r = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)
    return r
  except redis.ConnectionError as e:
    raise HTTPException(
        status_code=500,
        detail=f"Redis connection error: {e}"
      )

def lookup_redis_return(key, parse_time=False):
  r = get_redis_cloud()
  store_data = r.get(key)
  if store_data:
    print('Cache hit', key)
    my_result = json.loads(store_data)
    if parse_time:
      my_result = json_parser_datetime(my_result)
    return my_result
  else:
    return None


def setup_redis(key, obj):
  r = get_redis_cloud()
  print('Cache miss', key)
  my_result_json = json.dumps(obj, default=datetime_parser_json, ensure_ascii=False)
  r.set(key, my_result_json, ex=300) # 5mins cache


def datetime_parser_json(obj):
  if isinstance(obj, datetime):
    return obj.isoformat()
  
def json_parser_datetime(item):
  result = []
  for element in item:
      if isinstance(element, str):
          try:
              # Attempt to parse the string as a datetime
              result.append(datetime.fromisoformat(element))
          except ValueError:
              # If parsing fails, keep the original string
              result.append(element)
      elif isinstance(element, list):
          # Recursively handle nested lists
          result.append(json_parser_datetime(element))
      else:
          # For other types (int, float, etc.), just add them as-is
          result.append(element)
  return result

# def delete_redis(key):
#   r = get_redis_cloud()
#   print('cache delete', key)
#   r.delete(key)