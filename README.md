# Parking Lot Management & Online Payment System

[Link to the project homepage](https://parkinglot.haohaoscreamandrun.online/)

## Main Services

### Parking Lot Managing Main Process

![MVP](/public/images/Minimum_viable_product_process.png)

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
   - Jko Pay
   - Easy Wallet
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

1. Parking lots within 3km from user will be shown on map for user to choose from. 15 nearest lots will be returned if there are no parking lots within 3km.
2. Website will return realtime vacancy of parking lot when you click on them (either on list or map).

## Application Structure

![backend structure](/public/images/backend-structure.png)

- Domain
   1. GoDaddy domain name, hosted and routed by AWS Route53.
- Back-end
   1. Server built with Python FastAPI
   2. AWS RDS MySQL database
   3. Cache with Redis
   4. Deploy with Docker images on AWS EC2 machine
   5. Reverse proxy with Nginx
   6. Connection distribute by AWS Load Balancer
   7. Store images on AWS S3 bucket and cache at edge location by AWS CloudFront
- Front-end
   1. Built with Bootstrap toolkit
   2. Google maps API for map
   3. OpenCV.js & Tesseract.js for car license plate recognition

### High-light: Solution to reduce backend server load

- Pure frontend repeatedly optical character recognition
   1. Process photos with OpenCV.js to reduce noises
   2. Recognize license number with robust OCR engine Tesseract.js
- Upload captured photo from frontend
   1. Request S3 upload URL from backend
   2. Post enter car photo from frontend, delete exit car photo directly from backend

### RESTful back-end APIs

[Link to Swagger document](https://parkinglot.haohaoscreamandrun.online/docs#/)

## Database structure EER and index

![db structure](/public/images/databaseEER.png)

### High-light: Spatial Index for Geometry data type

Spatial index is used to speed up the query:

1. Create spatial index on POINT type data and insert data with SRID(Spatial Reference System Identifier) 4326
2. Calculate bounding box with radius: Calculate the circumscribing rectangle of a circle with a given radius
3. Use MBR(minimum bounding rectangles) function to utilize spatial index: Exclude the points that do not locate in this rectangle before actually calculate distance

Comparison of query with or without spatial index:

| Compare | No index | Spatial Index (Bounding box method) |
|:--|:--|:--|
| **Cost of CPU** | 316 Unit | 45.3 Unit |
| **Time** | 16.4 milliseconds | 2.66 milliseconds |

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
| redis                    | 5.0.8      |
