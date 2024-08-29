# Parking Lot Management & Online Payment System

## Main Services

### Parking Lot Managing Main Process

1. Vehicle enters, client system reads the license plate number and captures vehicle photo. Front-end verifies the license plate number, then calls system API with license plate number and photo URL.
2. System API receives the license plate number:
   - Checks remaining parking spaces; if available, sends gate open signal.
   - If no spaces available, system returns "Parking full" message.
3. System retrieves license plate number and vehicle photo URL, begins calculating parking fee duration.
4. User wishes to exit, inputs license plate number on client side, which sends it to the backend system.
5. Backend system receives license plate number, searches for similar entries in the database, returns multiple vehicle photo URLs.
6. User selects vehicle from photos and confirms desired payment platform, calls backend payment API.
7. System calculates parking fee amount based on exit time.
8. System integrates with user-selected platform for payment processing:
   - Credit card
   - Line Pay
9. Payment successful, system grants "exit allowed" status to vehicle for 15 minutes.
   - If vehicle information isn't removed after 15 minutes, system restarts entry time calculation.
10. Vehicle exits, client system reads license plate number, front-end verifies the number, calls system API with license plate number.
11. System API receives license plate number:
    - Backend verifies vehicle in system with "exit allowed" status, sends gate open message. System deletes vehicle information and updates remaining space count.
    - Backend verifies vehicle in system without "exit allowed" status, returns message to pay via cloud system.
    - Backend does not find vehicle record in system, returns message of no entry record for the vehicle.

### Parking Lot Admin System

User with admin privilege can:

1. Check all parking lots which belongs to admin themselves.
2. Check all the cars information in below list which parks in the parking lot:
   - Cars photo
   - Recognized license plate number
   - Car's enter timestamp
   - Subtotal parking fee
   - Payment status
3. Update the recognized plate number and payment status manually.
4. Delete car information from database if the parking fee is paid.

### User Friendly: Empty Lots Searching Function

1. 15 nearest parking lots within 3km from user will be shown on map for user to choose from.
2. Website will return realtime vacancy of parking lot when you click on them (either on list or map).

## Backend Structure

![backend strucuture](https://parkinglot.haohaoscreamandrun.online/public/images/backend-structure.png)

## Database structure EER and index

![db structure](https://parkinglot.haohaoscreamandrun.online/public/images/databaseEER.png)

### Spatial Index for Geometry data type

Spatial index is used to speed up the query:

1. Create spatial index on POINT type data and insert data

   ```python
   sql = '''CREATE TABLE parking_lot( \
   id BIGINT AUTO_INCREMENT PRIMARY KEY, \
      name VARCHAR(50) NOT NULL, \
      coordinate POINT NOT NULL SRID 4326, \
         address VARCHAR(225), \
         total_space INT NOT NULL, \
            parking_fee INT NOT NULL, \
               admin_id BIGINT NOT NULL, \
               FOREIGN KEY (admin_id) REFERENCES admin(id),\
                  SPATIAL INDEX(coordinate))
                  '''
   sql = '''
   INSERT INTO parking_lot\
   (name, coordinate, address, total_space, parking_fee, admin_id)\
      VALUES (%s, ST_GeomFromText('POINT(%s %s)', 4326), %s, %s, %s, %s)
      '''
   ```

2. Calculate bounding box with radius

   ```python
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
   ```

3. Use MBRfunction to utilize spatial index

   ```python
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
   val = (lat, lng, bounding_box, lat, lng, radius, number)
   ```

## Utilized Package

| Package                  | Version    |
|--------------------------|------------|
| annotated-types          | 0.6.0      |
| boto3                    | 1.34.147   |
| botocore                 | 1.34.147   |
| fastapi                  | 0.111.0    |
| fastapi-cli              | 0.0.2      |
| httpcore                 | 1.0.5      |
| httptools                | 0.6.1      |
| httpx                    | 0.27.0     |
| mysql-connector-python   | 8.4.0      |
| pydantic                 | 2.7.1      |
| pydantic-extra-types     | 2.8.2      |
| pydantic_core            | 2.18.2     |
| Pygments                 | 2.18.0     |
| PyJWT                    | 2.8.0      |
| python-dateutil          | 2.9.0.post0|
| python-dotenv            | 1.0.1      |
| python-multipart         | 0.0.9      |
| pytz                     | 2024.1     |
| PyYAML                   | 6.0.1      |
| requests                 | 2.32.3     |
| s3transfer               | 0.10.2     |
| starlette                | 0.37.2     |
| shapely                  | 2.0.5      |
| typer                    | 0.12.3     |
| typing_extensions        | 4.11.0     |
| uvicorn                  | 0.29.0     |
