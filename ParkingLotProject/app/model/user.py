import mysql.connector
import math
from dotenv import load_dotenv
import os
load_dotenv()

# get env variables - manager
host_RDS = os.getenv('RDS_PARKINGLOT_CONNECTION')
user_user = os.getenv('RDS_USER_USER')
password_user = os.getenv('RDS_PASSWORD_USER')
jwtkey = os.getenv('JWTKEY')

# connection pool
dbconfig = {
    'host': host_RDS,
    'user': user_user,
    'password': password_user,
    'database': 'parkinglot'
}

cnxpool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=5,
    # Reset session variables when the connection is returned to the pool.
    pool_reset_session=True,
    **dbconfig
)

def cars_in_parking_lot(lot_id):
  sql = '''
  SELECT * FROM cars \
    WHERE lot_id = %s
    '''
  val = (lot_id,)
  try:
    cnxconnection = cnxpool.get_connection()
    mycursor = cnxconnection.cursor()
    mycursor.execute(sql, val)
    myresult = mycursor.fetchall()

  except mysql.connector.Error:
    raise mysql.connector.Error

  finally:
    # close connection
    mycursor.close()
    cnxconnection.close()
    print("MySQL connection is closed")
    return myresult


def car_by_carID(car_ID):
  sql = '''
  SELECT * FROM cars \
    WHERE id = %s
    '''
  val = (car_ID,)
  try:
    cnxconnection = cnxpool.get_connection()
    mycursor = cnxconnection.cursor()
    mycursor.execute(sql, val)
    myresult = mycursor.fetchall()

  except mysql.connector.Error:
    raise mysql.connector.Error

  finally:
    # close connection
    mycursor.close()
    cnxconnection.close()
    print("MySQL connection is closed")
    return myresult


def parkinglot_by_id(id):
  sql = '''
  SELECT id,\
    name,\
    ST_Longitude(coordinate) AS longitude,\
      ST_Latitude(coordinate) AS latitude,\
        address,\
          total_space,\
            parking_fee,\
              admin_id FROM parking_lot\
                WHERE id = %s
                '''
  val = (id,)
  try:
    cnxconnection = cnxpool.get_connection()
    mycursor = cnxconnection.cursor()
    mycursor.execute(sql, val)
    myresult = mycursor.fetchall()

  except mysql.connector.Error:
    raise mysql.connector.Error

  finally:
    # close connection
    mycursor.close()
    cnxconnection.close()
    print("MySQL connection is closed")
    return myresult


def parkinglot_by_localtion(lat, lng, number, radius=0):
  
  sql = '''
  SELECT id,\
    name,\
    ST_Longitude(coordinate) AS longitude,\
      ST_Latitude(coordinate) AS latitude,\
        address,\
          total_space,\
            parking_fee,\
              admin_id,\
                ST_Distance_Sphere(coordinate, ST_GeomFromText('POINT(%s %s)', 4326)) AS distance\
                  FROM parking_lot \
                    WHERE MBRContains(ST_GeomFromText(%s, 4326), coordinate)\
                      AND ST_Distance_Sphere(coordinate, ST_GeomFromText('POINT(%s %s)', 4326)) < %s \
                        ORDER BY distance LIMIT %s;
                        '''
  degrees_lat = radius / 111320
  degrees_lng = radius / (111320 * math.cos(math.radians(lat)))
  min_lat = lat - degrees_lat
  max_lat = lat + degrees_lat
  min_lng = lng - degrees_lng
  max_lng = lng + degrees_lng
  bounding_box = f'''
  POLYGON((\
    {min_lat} {min_lng},\
    {max_lat} {min_lng},\
    {max_lat} {max_lng},\
    {min_lat} {max_lng},\
    {min_lat} {min_lng}\
    ))
    '''
  val = (lat, lng, bounding_box, lat, lng, radius, number)

  try:
    cnxconnection = cnxpool.get_connection()
    mycursor = cnxconnection.cursor()
    mycursor.execute(sql, val)
    myresult = mycursor.fetchall()
  
  except mysql.connector.Error:
    raise mysql.connector.Error

  finally:
    # close connection
    mycursor.close()
    cnxconnection.close()
    print("MySQL connection is closed")
    return myresult
