import geopandas as gpd
import pandas as pd
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

# set path
shapefile_path = 'ParkingLotProject/database/park05_202408021150.shp'
csvfile_path = 'ParkingLotProject/database/新北市路外公共停車場資訊.csv'

# Load shapefile & csv
gdf = gpd.read_file(shapefile_path)
df = pd.read_csv(csvfile_path)

# Convert datetime columns to string
for column in gdf.select_dtypes(include=['datetime64']).columns:
    gdf[column] = gdf[column].astype(str)

# Convert the DataFrame to a JSON string
json_data = df.to_json(orient='records', lines=False, force_ascii=False)

#convert to GeoJSON
geojson = gdf.to_json()

with open('ParkingLotProject/database/taipei_city_parking_lot.json', 'w', encoding='utf-8') as f:
  # Ensure non-ASCII characters are not escaped
  json.dump(json.loads(geojson), f, ensure_ascii=False, indent=2)
  print('geojson saved!')


# Save JSON data to a file with UTF-8 encoding
with open('ParkingLotProject/database/new_taipei_city_parking_lot.json', 'w', encoding='utf-8') as f:
    json.dump(json.loads(json_data), f, ensure_ascii=False, indent=2)
    print('json saved!')
