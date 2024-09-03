import math
from ..config.mysql_pool import mysql_select
from ..config.redis import lookup_redis_return, setup_redis


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
  redis_key = f'parkinglot_name:admin_id{admin}'
  my_result = lookup_redis_return(redis_key)
  
  if my_result == None:
    sql = '''SELECT id, name FROM parking_lot WHERE admin_id = %s'''
    val = (admin,)
    my_result = mysql_select(sql, val)
    # set redis cache for 10 mins
    setup_redis(redis_key, my_result)
  
  return my_result

# Lookup car by license
async def car_by_license(license):
  redis_key = f'cars_all:plate_number{license}'
  my_result = lookup_redis_return(redis_key)
  if my_result == None:
    sql = '''SELECT * FROM cars WHERE plate_number = %s'''
    val = (license,)
    my_result = mysql_select(sql, val)
    setup_redis(redis_key, my_result)
  return my_result

# Lookup cars total in lot by lot id
async def vacancy_lookup(lot_id):
  redis_key = f'cars_sum:lot_id:{lot_id}'
  my_result = lookup_redis_return(redis_key)
  if my_result == None:
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
    my_result = mysql_select(sql, val)
    setup_redis(redis_key, my_result)
  return my_result

# Lookup all cars in lot by lot id
def cars_in_parking_lot(lot_id):
  redis_key = f'cars_all:lot_id{lot_id}'
  my_result = lookup_redis_return(redis_key)
  if my_result == None:
    sql = '''
    SELECT * FROM cars \
      WHERE lot_id = %s
      '''
    val = (lot_id,)
    my_result = mysql_select(sql, val)
    setup_redis(redis_key, my_result)
  return my_result

# look up car by car id
def car_by_carID(car_ID):
  redis_key = f'cars_all:car_id{car_ID}'
  my_result = lookup_redis_return(redis_key)
  if my_result == None:
    sql = '''
    SELECT * FROM cars \
      WHERE id = %s
      '''
    val = (car_ID,)
    my_result = mysql_select(sql, val)
    setup_redis(redis_key, my_result)
  return my_result

# look up lot by lot id
def parkinglot_by_id(id):
  redis_key = f'parkinglot_all:lot_id{id}'
  my_result = lookup_redis_return(redis_key)
  if my_result == None:
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
    my_result = mysql_select(sql, val)
    setup_redis(redis_key, my_result)
  return my_result

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
