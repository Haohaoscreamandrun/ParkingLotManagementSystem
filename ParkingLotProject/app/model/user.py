import mysql.connector
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


def car_by_license(license):
  sql = '''
  SELECT * FROM cars \
    WHERE license = %s
    '''
  val = (license,)
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
    ST_X(coordinate) AS longitude,\
      ST_Y(coordinate) AS latitude,\
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


def parkinglot_by_localtion(lat, lon, number):
  
  sql = '''
  SELECT id,\
    name,\
    ST_X(coordinate) AS longitude,\
      ST_Y(coordinate) AS latitude,\
        address,\
          total_space,\
            parking_fee,\
              admin_id,\
                ST_Distance_Sphere(coordinate, POINT(%s, %s)) AS distance\
                  FROM parking_lot ORDER BY distance LIMIT %s;
                  '''
  val = (lon, lat, number)

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
