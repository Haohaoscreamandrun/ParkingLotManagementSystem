import random, string, requests, io
from PIL import Image, ImageDraw, ImageFont

def generate_license_plate():
  # Generate a random license plate number.
  letters = ''.join(random.choices(string.ascii_uppercase, k=3))
  numbers = ''.join(random.choices(string.digits, k=4))
  return f"{letters}-{numbers}"

def create_license_plate_image(plate_number):
  # Create image of license plate number
  ## Define image size
  width, height = 300, 100
  background_color = (255, 255, 255) # white
  text_color = (0, 0, 0) #black

  ## create image
  image = Image.new('RGB', (width, height), background_color)
  draw = ImageDraw.Draw(image)

  ## Load font
  # try:
  font = ImageFont.truetype('database/raw/Uknumberplate-A4Vx.ttf', 40)
  # except IOError:
    # font = ImageFont.load_default()

  # Get text size
  left, top, right, bottom = draw.textbbox(
      (0, 0), plate_number, font=font, font_size=36)
  
  # Calculate text dimensions
  text_width = right - left
  text_height = bottom - top
  
  # Calculate position to center the text
  text_x = (width - text_width) / 2
  text_y = (height - text_height) / 2

  # Draw the text on the image
  draw.text((text_x, text_y), plate_number, font=font, fill=text_color)

  # Save the image
  buffer = io.BytesIO()
  image.save(buffer, format='PNG')
  buffer.seek(0)  # Go to the beginning of the file-like object
  return buffer 
  

def upload_file_to_s3(url, fields, file_obj, file_name):
    """Upload the in-memory file-like object to the given S3 URL."""
    try:
        files = {'file': (file_name, file_obj)}
        data = fields
        response = requests.post(url, files=files, data=data)
        if response.ok:
            return True
        else:
            print(f"Error uploading file: {\
                  response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Error uploading file: {e}")
        return False

def get_urlObj(license_plate):
  url = f'https://parkinglot.haohaoscreamandrun.online/api/camera?license={license_plate}'
  # Perform the GET request
  response = requests.get(url)

  # Check the response status code
  if response.status_code == 200:
      # Process the response
      data = response.json()  # or response.text for raw data
      return (data)
  else:
      print(f"Error: {response.status_code}")


def post_api_camera(lot_id, license_plate):
    try:
        # Define the URL and request body
        url = "https://parkinglot.haohaoscreamandrun.online/api/cars"
        # url = "http://127.0.0.1:8000/api/camera"
        request_body = {
            'lotID': lot_id,
            'license': license_plate
        }

        # Make the POST request
        response = requests.post(
            url,
            json=request_body,  # Automatically sets Content-Type to application/json
        )

        # Check if the response status code indicates success
        if response.ok:
            # Return the value of 'ok' key if present
            print('Post request succeed!')
        else:
            print(response.json())
            print('Post request failed!')
    except Exception as error:
        # Handle exceptions and alert the user
        print(f"Error fetch to backend: {error}")


def flow():
  license_plate = generate_license_plate()
  new_license_plate = license_plate.replace('-', "")
  
  image_file_obj = create_license_plate_image(license_plate)
  urlObj = get_urlObj(new_license_plate)
  
  upload_file_to_s3(urlObj['data']['url'],
                    urlObj['data']['fields'], image_file_obj, f'{new_license_plate}.png')
  lot_id = random.randint(3094,3163)
  post_api_camera(lot_id, new_license_plate)

for i in range(1000):
    flow()