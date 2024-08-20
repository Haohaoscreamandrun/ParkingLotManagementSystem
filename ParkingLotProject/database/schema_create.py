from pyproj import Transformer
import os
import json
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')
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

sql = '''
CREATE TABLE admin( \
	id BIGINT AUTO_INCREMENT PRIMARY KEY, \
		account VARCHAR(20), \
			password VARCHAR(32))
			'''
try:
	mycursor.execute(sql)
	print("Table 'admin' created successfully.")
except mysql.connector.errors.ProgrammingError as e:
	if e.errno == 1050:
		print("Table 'admin' already exists.")
	else:
		print("An error occurred when create table in MySQL.")

# insert admin
# init
sql = 'SELECT * FROM admin'
mycursor.execute(sql)
myresult = mycursor.fetchall()
if len(myresult) != 0:
	print("Data is already inserted.")
	pass
else:
	sql = '''
	INSERT INTO admin (account, password) VALUES (%s, %s)
	'''
	for i in range(5):
		val = (f'admin{i:04}', f'Admin{i:04}') # fill 0 to the 4 digits in front
		try:
			mycursor.execute(sql, val)
			mydb.commit()
			print(i, 'admin complete!')
		except mysql.connector.errors.ProgrammingError as e:
			print(e)


# Create parking_lot table
sql = '''CREATE TABLE parking_lot( \
	id BIGINT AUTO_INCREMENT PRIMARY KEY, \
	  name VARCHAR(50) NOT NULL, \
	    coordinate POINT NOT NULL SRID 4326, \
			    address VARCHAR(225), \
				    total_space INT NOT NULL, \
							parking_fee INT NOT NULL, \
								admin_id BIGINT NOT NULL, \
									FOREIGN KEY (admin_id) REFERENCES admin(id))
										'''

try:
	mycursor.execute(sql)
	print("Table 'parking_lot' created successfully.")
except mysql.connector.errors.ProgrammingError as e:
	if e.errno == 1050:
		print("Table 'admin' already exists.")
	else:
		print("An error occurred when create table in MySQL.", e)

# load data into parking_lot

## taipei data
with open('ParkingLotProject/database/taipei_city_parking_lot.json', encoding= 'utf-8') as file:
	taipei_parking_lots = json.load(file)

## new taipei data
with open('ParkingLotProject/database/new_taipei_city_parking_lot.json', encoding='utf-8') as file:
	new_taipei_parking_lots = json.load(file)

## taipei data
with open('ParkingLotProject/database/taoyuan_city_parking_lot.json', encoding='utf-8') as file:
	taoyuan_parking_lots = json.load(file)

## init
sql = 'SELECT * FROM parking_lot'
mycursor.execute(sql)
myresult = mycursor.fetchall()
if len(myresult) != 0:
	print("Data is already inserted.")
	pass
else:
	
	# Assuming EPSG:3826 for Taiwan Geodetic Coordinate System
	proj_from = 'epsg:3826'  # EPSG:3826 - TWD97
	proj_to = 'epsg:4326'  # WGS84
	transformer = Transformer.from_crs(proj_from, proj_to, always_xy=True)

	# Function to Extract the First Integer of parking fee
	def extract_first_integer(s):
		if s is None:
			return None
		s = s.replace(',', '')
		matches = re.findall(r'\d+', s)
		# Convert the list of string matches to integers
		numbers = [int(match) for match in matches]
		for number in numbers:
			if number < 200 and number >= 20:
				return number
		return None
	
	sql = '''
	INSERT INTO parking_lot\
		(name, coordinate, address, total_space, parking_fee, admin_id)\
			VALUES (%s, ST_GeomFromText('POINT(%s %s)', 4326), %s, %s, %s, %s)
			'''

	
	def commit_db(name, latitude, longitude, address,
               total_space, parking_fee, index):
		
		# Construct filter val that should not be empty
		not_null = (name, latitude, longitude, total_space, parking_fee)
		# the logic to skip any empty value
		skip_this = False
		for v in not_null:
			if v is None or v == "" :
				skip_this = True
				continue
		if skip_this:
			return skip_this
		
		# try insert
		try:
			if not skip_this:
				import random
				admin_id = random.randint(1, 5)
				val = (name, latitude, longitude, address,
											total_space, parking_fee, admin_id)
				mycursor.execute(sql, val)
				print("Looping... ", index, "th parking lot is inserted.")
		except mysql.connector.errors.ProgrammingError as e:
			print(e)

# loop taipei data
	for index, data in enumerate(taipei_parking_lots['features']):
		# construct data
		name = data['properties']['gatename']
		longitude, latitude = transformer.transform(
			data['geometry']['coordinates'][0][0], data['geometry']['coordinates'][0][1])
		address = data['properties']['gateadrs']
		total_space = int(data['properties']['num_s']
		                  ) if data['properties']['num_s'] is not None else None
		parking_fee = extract_first_integer(data['properties']['feeb'])
		
		commit_db(name, latitude, longitude, address,
                   total_space, parking_fee, index)
	mydb.commit()

# loop new taipei data	
	for index, data in enumerate(new_taipei_parking_lots):
		name = data['NAME']
		longitude, latitude = transformer.transform(
			data['TW97X'], data['TW97Y'])
		address = data['ADDRESS']
		total_space = int(data["TOTALCAR"]) if data["TOTALCAR"] is not None else None 
		parking_fee = extract_first_integer(data["PAYEX"])
		commit_db(name, latitude, longitude, address,
                   total_space, parking_fee, index)
	mydb.commit()

# loop Taoyuan data
	for index, data in enumerate(taoyuan_parking_lots['parkingLots']):
		name = data['parkName']
		longitude = data['wgsY']
		latitude = data['wgsX']
		address = data['address']
		total_space = int(data["totalSpace"]) if data["totalSpace"] is not None else None
		parking_fee = extract_first_integer(data["payGuide"])
		commit_db(name, latitude, longitude, address,
                   total_space, parking_fee, index)
	mydb.commit()


# Create table cars

sql = \
'''
CREATE TABLE cars (\
	id BIGINT PRIMARY KEY AUTO_INCREMENT,\
		plate_number VARCHAR(7) NOT NULL,\
			enter_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\
				green_light TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\
					lot_id BIGINT NOT NULL,\
						FOREIGN KEY (lot_id) REFERENCES parking_lot(id))
'''
try:
	mycursor.execute(sql)
	print("Table 'cars' created successfully.")
except mysql.connector.errors.ProgrammingError as e:
	if e.errno == 1050:
		print("Table 'admin' already exists.")
	else:
		print("An error occurred when create table in MySQL.", e)

mydb.close()