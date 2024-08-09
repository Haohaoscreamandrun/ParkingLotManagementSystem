import os
from dotenv import load_dotenv
import mysql.connector
load_dotenv()

# get env variables - admin
host_RDS = os.getenv('RDS_PARKINGLOT_CONNECTION')
user_admin = os.getenv('RDS_USER_ADMIN')
password_admin = os.getenv('RDS_PASSWORD_ADMIN')

mydb = mysql.connector.connect(
  host = host_RDS,
  user = user_admin,
  password = password_admin,
  database = 'parkinglot'
)

mycursor = mydb.cursor()

# create admin table in database

sql = 'CREATE TABLE admin( \
  id BIGINT AUTO_INCREMENT PRIMARY KEY, \
    account VARCHAR(20), \
      password VARCHAR(32))'
try:
	mycursor.execute(sql)
	print("Table 'admin' created successfully.")
except mysql.connector.errors.ProgrammingError as e:
	if e.errno == 1050:
		print("Table 'admin' already exists.")
	else:
		print("An error occurred when create table in MySQL.")


mydb.close()