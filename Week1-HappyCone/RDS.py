import mysql.connector
from fastapi import HTTPException
from starlette import status
import os
from dotenv import load_dotenv
load_dotenv()
DBpassword = os.getenv('DB_PASSWORD')

dbconfig = {
  'host': 'happycone.cnc4cy8wmip0.ap-southeast-2.rds.amazonaws.com',
  'user': 'happycone',
  'password': DBpassword,
  'database': 'HappyCone'
}

cnxpool = mysql.connector.pooling.MySQLConnectionPool(
  pool_name='rdspool',
  pool_size=10,
  pool_reset_session=True,
  **dbconfig
)

def insert_data(text, image_name):
  
  image_url = f'https://d3oxcb6ibox8sd.cloudfront.net/{image_name}'
  
  sql = 'INSERT INTO message\
    (text, image)\
    VALUES (%s, %s)'
  val = (text, image_url)

  try:
    cnxconnection = cnxpool.get_connection()
    mycursor = cnxconnection.cursor()
    mycursor.execute(sql, val)
    cnxconnection.commit()
    print(mycursor.rowcount, "record processed.")
  except mysql.connector.OperationalError as e:
        print("Operational Error while connecting to MySQL using Connection pool ", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Lost MySQL connection"
        )
  except mysql.connector.ProgrammingError as e:
      print("Programming Error: Invalid SQL script ", e)
      raise HTTPException(
          status_code=status.HTTP_400_BAD_REQUEST,
          detail="Invalid SQL script"
      )
  except mysql.connector.Error as e:
      print("Error while connecting to MySQL using Connection pool ", e)
      raise HTTPException(
          status_code=status.HTTP_400_BAD_REQUEST,
          detail="Other MySQL error occurred"
      )
  finally:
      # close connection
      mycursor.close()
      cnxconnection.close()
      print("MySQL connection is closed")


def select_all():
    
  sql = 'SELECT * FROM message ORDER BY id DESC'

  try:
    cnxconnection = cnxpool.get_connection()
    mycursor = cnxconnection.cursor()
    mycursor.execute(sql)
    myresult = mycursor.fetchall()

  except mysql.connector.OperationalError as e:
        print("Operational Error while connecting to MySQL using Connection pool ", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Lost MySQL connection"
        )
  except mysql.connector.ProgrammingError as e:
      print("Programming Error: Invalid SQL script ", e)
      raise HTTPException(
          status_code=status.HTTP_400_BAD_REQUEST,
          detail="Invalid SQL script"
      )
  except mysql.connector.Error as e:
      print("Error while connecting to MySQL using Connection pool ", e)
      raise HTTPException(
          status_code=status.HTTP_400_BAD_REQUEST,
          detail="Other MySQL error occurred"
      )
  finally:
      # close connection
      mycursor.close()
      cnxconnection.close()
      print("MySQL connection is closed")
      return myresult