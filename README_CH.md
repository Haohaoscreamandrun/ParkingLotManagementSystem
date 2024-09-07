# Parking Lot Management & Online Payment System

1. [Link to the project homepage](https://parkinglot.haohaoscreamandrun.online/)
2. [English README](./README.md)

## 目錄

<!-- TOC -->

- [Parking Lot Management & Online Payment System](#parking-lot-management--online-payment-system)
  - [目錄](#目錄)
    - [主要服務](#主要服務)
      - [停車場管理主要流程](#停車場管理主要流程)
      - [停車場管理員系統](#停車場管理員系統)
      - [使用者友好的空車位搜索功能](#使用者友好的空車位搜索功能)
    - [程式架構](#程式架構)
      - [亮點: 減少後端服務器負載的解決方案](#亮點-減少後端服務器負載的解決方案)
      - [RESTful 後端 API](#restful-後端-api)
    - [資料庫結構 EER 和索引](#資料庫結構-eer-和索引)
      - [亮點: 幾何數據類型的空間索引](#亮點-幾何數據類型的空間索引)
  - [專案使用套件](#專案使用套件)

<!-- /TOC -->

### 主要服務

#### 停車場管理主要流程

![MVP](/public/images/Minimum_viable_product_process.png)

1. 車輛進入時，客戶端系統讀取車牌號碼並捕捉車輛照片。前端驗證車牌號碼，然後調用系統 API 並附上車牌號碼和照片 URL。
2. 系統 API 接收到車牌號碼：
    - 檢查剩餘停車位；如果有空位，發送開門信號。
    - 如果沒有空位，系統返回“車位已滿”消息。
3. 系統檢索車牌號碼和車輛照片 URL，開始計算停車費用時長。
4. 用戶希望離場時，在客戶端輸入車牌號碼，並將其發送到後端系統。
5. 後端系統接收車牌號碼，在數據庫中搜索類似記錄，返回多個車輛照片 URL。
6. 用戶從照片中選擇車輛並確認所需的支付平台，調用後端支付 API。
7. 系統根據離場時間計算停車費用。
8. 系統與用戶選擇的支付平台進行支付處理：
    - 信用卡
    - Line Pay
    - 街口支付
    - 悠遊付
9. 支付成功後，系統授予車輛“允許離場”狀態，允許時間為15分鐘。
    - 如果在15分鐘後車輛信息未被移除，系統將重新開始計算入場時間。
10. 車輛離場時，客戶端系統讀取車牌號碼，前端驗證號碼，調用系統 API 並附上車牌號碼。
11. 系統 API 接收到車牌號碼：
    - 後端驗證系統中的車輛狀態為“允許離場”，發送開門信號。系統刪除車輛信息並更新剩餘空位數。
    - 後端驗證系統中的車輛狀態非為“允許離場”，返回請繳費的消息。
    - 後端在系統中找不到車輛記錄，返回車輛沒有入場記錄的消息。

#### 停車場管理員系統

具有管理員權限的用戶可以：

1. 查看屬於管理員自己的所有停車場。
2. 查看停車場內所有車輛的信息，包括：
    - 車輛照片
    - 識別的車牌號碼
    - 車輛的進入時間戳
    - 總停車費用
    - 支付狀態
3. 手動更新識別的車牌號碼和支付狀態。
4. 如果停車費用已支付，從數據庫中刪除車輛信息。

#### 使用者友好的空車位搜索功能

1. 顯示用戶3公里範圍內的停車場地圖。如果在3公里範圍內沒有停車場，則返回15個最近的停車場。
2. 當用戶點擊停車場時，網站會返回停車場的實時空位（無論是點擊列表還是地圖）。

### 程式架構

![backend structure](/public/images/backend-structure.png)

- 域名
    1. GoDaddy 域名，通過 AWS Route53 托管和路由。
- 後端
    1. 使用 Python FastAPI 構建服務器
    2. AWS RDS MySQL 數據庫
    3. 使用 Redis 進行緩存
    4. 在 AWS EC2 機器上通過 Docker 映像部署
    5. 使用 Nginx 作為反向代理
    6. 通過 AWS 負載均衡器進行連接分配
    7. 在 AWS S3 存儲圖像，並通過 AWS CloudFront 在邊緣位置進行緩存
- 前端
    1. 使用 Bootstrap 工具包構建
    2. 使用 Google Maps API 顯示地圖
    3. 使用 OpenCV.js 和 Tesseract.js 進行車牌識別

#### 亮點: 減少後端服務器負載的解決方案

- 純前端重複光學字符識別
    1. 使用 OpenCV.js 處理照片以減少噪音
    2. 使用強大的 OCR 引擎 Tesseract.js 識別車牌號碼
- 從前端上傳照片
    1. 從後端請求 S3 上傳 URL
    2. 從前端上傳入場照片，並從後端直接刪除離場車照片

#### RESTful 後端 API

[Link to Swagger document](https://parkinglot.haohaoscreamandrun.online/docs#/)

### 資料庫結構 EER 和索引

![db structure](/public/images/databaseEER.png)

#### 亮點: 幾何數據類型的空間索引

使用空間索引加速查詢：

1. 在 POINT 類型數據欄位上創建空間索引，並使用 SRID（空間參考系統標識符）4326 插入數據
2. 計算邊界框半徑：計算給定半徑圓的外接矩形
3. 使用 MBR（最小邊界矩形）函數以利用空間索引：在實際計算距離之前排除不在此矩形內的點

使用空間索引與否的查詢比較:

| 比較 | 無索引 | 空間索引 (邊界框法) |
|:--|:--|:--|
| **Cost of CPU** | 316 Unit | 45.3 Unit |
| **Time** | 16.4 milliseconds | 2.66 milliseconds |

## 專案使用套件

| 套件                  | 版本    |
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
