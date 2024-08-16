from pydantic import BaseModel, Field, field_validator, ValidationError
from typing import List, Optional
import re
from datetime import datetime


class Error(BaseModel):
    error: bool
    message: str


class Success(BaseModel):
    ok: bool


# Regex pattern
pattern_password = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$'

class AdminCredentials(BaseModel):
    account: str = Field(..., min_length=8, max_length=20)
    password: str = Field(..., min_length=8, max_length=20)

    @field_validator('password')
    def password_pattern(cls, v):
        if re.match(pattern_password, v) is None:
            raise ValueError(
                'password should contain at least 1 uppercase, 1 lowercase and 1 number.')
        return v


class Admin(BaseModel):
    id: int
    account: str = Field(..., min_length=8, max_length=20)


class Token(BaseModel):
    token: str


class ReturnAdmin(BaseModel):
    data: Admin | None


class S3UploadURL(BaseModel):
    data: object


class PostCarEnter(BaseModel):
    admin: int
    license: str


class ReturnCars(BaseModel):
    car_id: int
    license: str
    enter_time: datetime
    green_light: datetime
    parking_lot_id: int


class ReturnCarsObj(BaseModel):
    data: Optional[List[ReturnCars]]


class ReturnAdminParkingLots(BaseModel):
    lot_id : int
    lot_name : str


class ReturnAdminParkingLotsObj(BaseModel):
    data: Optional[List[ReturnAdminParkingLots]]