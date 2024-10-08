import math
from ..config.mysql_pool import mysql_select
from ..config.redis import lookup_redis_return, setup_redis


# lookup admin by account and password
async def admin_lookup(account, password):
    sql = """
    SELECT *\
    FROM admin\
    WHERE account = %s\
    AND password = %s
    """
    val = (account, password)
    return mysql_select(sql, val)


# Lookup lot by admin id ## with cache
async def admin_parking_lot_lookup(admin):
    redis_key = f"parkinglot_name:admin_id{admin}"
    my_result = lookup_redis_return(redis_key)

    if my_result is None:
        sql = """
        SELECT id,\
          name\
        FROM parking_lot\
        WHERE admin_id = %s
        """
        val = (admin,)
        my_result = mysql_select(sql, val)
        # set redis cache for 10 mins
        setup_redis(redis_key, my_result)

    return my_result


# Lookup car by license
async def car_by_license(license):
    sql = """
    SELECT *\
    FROM cars\
    WHERE plate_number = %s
    """
    val = (license,)
    my_result = mysql_select(sql, val)
    return my_result


# Lookup cars total in lot by lot id
async def vacancy_lookup(lot_id):
    sql = """
    SELECT COUNT(cars.id) AS total_cars,\
      parking_lot.total_space AS total_space,\
        parking_lot.id AS lot_id\
    FROM parking_lot\
    LEFT JOIN cars ON cars.lot_id = parking_lot.id\
    WHERE parking_lot.id = %s\
    GROUP BY parking_lot.total_space, parking_lot.id\
    """
    val = (lot_id,)
    my_result = mysql_select(sql, val)
    return my_result


# Lookup all cars in lot by lot id
def cars_in_parking_lot(lot_id):
    sql = """
    SELECT *\
    FROM cars\
    WHERE lot_id = %s
    """
    val = (lot_id,)
    my_result = mysql_select(sql, val)
    return my_result


# look up car by car id
def car_by_carID(car_ID):
    sql = """
    SELECT *\
    FROM cars\
    WHERE id = %s
    """
    val = (car_ID,)
    my_result = mysql_select(sql, val)
    return my_result


# look up lot by lot id ## with cache
def parkinglot_by_id(id):
    redis_key = f"parkinglot_all:lot_id{id}"
    my_result = lookup_redis_return(redis_key)
    if my_result is None:
        sql = """
        SELECT id,\
          name,\
            ST_Longitude(coordinate) AS longitude,\
              ST_Latitude(coordinate) AS latitude,\
                address,\
                  total_space,\
                    parking_fee,\
                      admin_id\
        FROM parking_lot\
        WHERE id = %s
        """
        val = (id,)
        my_result = mysql_select(sql, val)
        setup_redis(redis_key, my_result)
    return my_result


# look up lots by coordinate ## with cache
def parking_lot_by_location(lat, lng, number, radius=0):
    redis_key = f"parkinglots:{lat,lng}"
    my_result = lookup_redis_return(redis_key)
    # Condition 1: find parking lot within specific radius
    if my_result is None and radius != 0:
        sql = """
        SELECT id,\
          name,\
            ST_Longitude(coordinate) AS longitude,\
              ST_Latitude(coordinate) AS latitude,\
                address,\
                  total_space,\
                    parking_fee,\
                      admin_id,\
                        ST_Distance_Sphere(coordinate, ST_GeomFromText('POINT(%s %s)', 4326)) AS distance\
        FROM parking_lot\
        WHERE MBRContains(ST_GeomFromText(%s, 4326), coordinate)\
        AND ST_Distance_Sphere(coordinate, ST_GeomFromText('POINT(%s %s)', 4326)) < %s \
        ORDER BY distance LIMIT %s;
        """
        # calculate the degree change of intend radius(meter)
        meter_per_degree_lat = 111320
        meter_per_degree_lng = meter_per_degree_lat * math.cos(math.radians(lat))
        degrees_lat = radius / meter_per_degree_lat
        degrees_lng = radius / meter_per_degree_lng
        min_lat = lat - degrees_lat
        max_lat = lat + degrees_lat
        min_lng = lng - degrees_lng
        max_lng = lng + degrees_lng
        # Define bounding box (final point repeats the first point to close the polygon)
        bounding_box = f"""
        POLYGON((\
          {min_lat} {min_lng},\
          {max_lat} {min_lng},\
          {max_lat} {max_lng},\
          {min_lat} {max_lng},\
          {min_lat} {min_lng}\
        ))
        """
        val = (lat, lng, bounding_box, lat, lng, radius, number)
        my_result = mysql_select(sql, val)
        setup_redis(redis_key, my_result)
    # Condition 2: find nearest parking lots
    elif my_result is None and radius == 0:
        sql = """
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
        ORDER BY distance LIMIT %s;
        """
        val = (lat, lng, number)
        my_result = mysql_select(sql, val)
        setup_redis(redis_key, my_result)

    return my_result
