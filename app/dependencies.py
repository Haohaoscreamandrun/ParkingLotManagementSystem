from typing import Annotated
from starlette import status
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
import os
import jwt
import pytz
# get Jwt key
load_dotenv()
JWTkey = os.getenv('JWTKEY')

security = HTTPBearer()
async def admin_validation_dependency(credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]):
  token = credentials.credentials or None
  try:
      payload = jwt.decode(token, JWTkey, algorithms="HS256")
      yield payload
  except jwt.InvalidTokenError as e:
      raise HTTPException(
          status_code=status.HTTP_403_FORBIDDEN,
          detail="Invalid token: " + str(e)
      )
  except jwt.PyJWTError as e:
      raise HTTPException(
          status_code=status.HTTP_403_FORBIDDEN,
          detail="JWT error: " + str(e)
      )
  except Exception as e:
      raise HTTPException(
          status_code=status.HTTP_403_FORBIDDEN,
          detail="Token validation error: " + str(e)
      )

# Convert to local timezone
def convert_timezone(UTC):
  if UTC.tzinfo is None:
    UTC = pytz.utc.localize(UTC)
  local_tz = pytz.timezone('Asia/Taipei')
  dt_local = UTC.astimezone(local_tz)
  formatted_dt_local = dt_local.isoformat()
  return formatted_dt_local
