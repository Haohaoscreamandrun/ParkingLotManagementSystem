from mysql.connector import pooling, Error
from dotenv import load_dotenv
import os
load_dotenv()

# get env variables - manager
host_RDS = os.getenv('RDS_PARKINGLOT_CONNECTION')
user_manager = os.getenv('RDS_USER_MANAGER')
password_manager = os.getenv('RDS_PASSWORD_MANAGER')
jwtkey = os.getenv('JWTKEY')

# connection pool
dbconfig = {
    'host': host_RDS,
    'user': user_manager,
    'password': password_manager,
    'database' : 'parkinglot'
}

cnxpool = pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=5,
    # Reset session variables when the connection is returned to the pool.
    pool_reset_session=True,
    **dbconfig
)

# Login lookup
async def admin_lookup(account, password):
  sql = '''
    SELECT * FROM admin\
      WHERE account = %s\
        AND password = %s
        '''
  val = (account, password)
  try:
    cnxconnection = cnxpool.get_connection()
    mycursor = cnxconnection.cursor()
    mycursor.execute(sql, val)
    myresult = mycursor.fetchall()
      
  except Error:
    raise Error
  
  finally:
    # close connection
      mycursor.close()
      cnxconnection.close()
      print("MySQL connection is closed")
      return myresult
