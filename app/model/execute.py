import math
from ..config.mysql_pool import mysql_select

# lookup admin by account and password
async def admin_lookup(account, password):
  sql = '''
    SELECT * FROM admin\
      WHERE account = %s\
        AND password = %s
        '''
  val = (account, password)
  return mysql_select(sql, val)

# Lookup lot by admin id
async def admin_parking_lot_lookup(admin):
  sql = '''SELECT id, name FROM parking_lot WHERE admin_id = %s'''
  val = (admin,)
  return mysql_select(sql, val)

# Lookup car by license
async def car_by_license(license):
  sql = '''SELECT * FROM cars WHERE plate_number = %s'''
  val = (license,)
  return mysql_select(sql, val)

# Lookup cars total in lot by lot id
async def vacancy_lookup(lot_id):
  sql = '''
  SELECT COUNT(cars.id) AS total_cars,\
    parking_lot.total_space AS total_space,\
      parking_lot.id AS lot_id\
        FROM parking_lot\
          LEFT JOIN cars ON cars.lot_id = parking_lot.id\
            WHERE parking_lot.id = %s\
              GROUP BY parking_lot.total_space, parking_lot.id\
              '''
  val = (lot_id,)
  return mysql_select(sql, val)

# Lookup all cars in lot by lot id
def cars_in_parking_lot(lot_id):
  sql = '''
  SELECT * FROM cars \
    WHERE lot_id = %s
    '''
  val = (lot_id,)
  return mysql_select(sql, val)

# look up car by car id
def car_by_carID(car_ID):
  sql = '''
  SELECT * FROM cars \
    WHERE id = %s
    '''
  val = (car_ID,)
  return mysql_select(sql, val)

# look up lot by lot id
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
  return mysql_select(sql, val)

# look up lots by coordinate
def parking_lot_by_location(lat, lng, number, radius=0):
  
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

  return mysql_select(sql, val)
