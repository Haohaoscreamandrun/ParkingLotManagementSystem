from ..config.mysql_pool import mysql_commit

# insert car into cars
async def car_enter(lot_id, license):
  sql = '''INSERT INTO cars (plate_number, lot_id)\
    VALUES (%s, %s)
    '''
  val = (license, lot_id)
  mysql_commit(sql, val)

# update green_light +15 mins
async def grant_green_light(car_id):
  sql = '''UPDATE cars SET green_light = \
    DATE_ADD(NOW(), INTERVAL 15 MINUTE)\
        WHERE id = %s'''
  val = (car_id,)
  mysql_commit(sql, val)

# delete car by license
async def car_exit(lot_id, license):
  sql = '''DELETE FROM cars \
    WHERE plate_number = %s \
      AND lot_id = %s'''
  val = (license, lot_id)
  mysql_commit(sql, val)
