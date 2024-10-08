import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

# get env variables - manager
host_RDS = os.getenv("RDS_PARKINGLOT_CONNECTION")
user_manager = os.getenv("RDS_USER_MANAGER")
password_manager = os.getenv("RDS_PASSWORD_MANAGER")
jwtkey = os.getenv("JWTKEY")

# connection pool
# Database connection pooling is a way to reduce the cost of opening and closing connections
dbconfig = {
    "host": host_RDS,
    "user": user_manager,
    "password": password_manager,
    "database": "parkinglot",
}

cnxpool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=5,
    # Reset session variables when the connection is returned to the pool.
    pool_reset_session=True,
    **dbconfig,
)


def mysql_select(sql, val):
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


def mysql_commit(sql, val):
    try:
        cnxconnection = cnxpool.get_connection()
        mycursor = cnxconnection.cursor()
        mycursor.execute(sql, val)
        cnxconnection.commit()
        print(mycursor.rowcount, "record processed.")
    except mysql.connector.Error:
        raise mysql.connector.Error
    finally:
        # close connection
        mycursor.close()
        cnxconnection.close()
        print("MySQL connection is closed")
