# เอกสารการทดสอบระบบ REST API (Lumina Books E-Commerce)

เอกสารฉบับนี้สรุปรายการและวิธีการทดสอบ REST API ของระบบร้านหนังสือออนไลน์ **Lumina Books** ซึ่งถูกพัฒนาและติดตั้งอยู่ในระบบจริงที่ `/api/...` เพื่อใช้ทดสอบร่วมกับโปรแกรม Postman หรือเครื่องมือ HTTP Client อื่นๆ ได้อย่างถูกต้องแม่นยำ 100%

---

## 🔑 ข้อมูลทางเทคนิคที่สำคัญ (Technical Notes)

1. **Base URL:** `http://localhost:3000`
2. **การยืนยันตัวตน (Authentication):**
   - ระบบใช้สิทธิการล็อกอินแบบ Session-based ผ่านคุกกี้ชื่อ `lumina-session` (ภายในมีข้อมูล JWT Token)
   - เมื่อล็อกอินสำเร็จผ่าน API ฝั่งเซิร์ฟเวอร์จะคืนค่า `Set-Cookie: lumina-session=...` ให้โดยอัตโนมัติ
   - **ข้อแนะนำสำหรับ Postman:** ตรวจสอบว่าระบบ Cookie Jar ของโดเมน `localhost` ถูกเปิดใช้งานอยู่ เพื่อให้ Postman สามารถส่งคุกกี้เซสชันนี้ไปพร้อมกับ API เส้นอื่นๆ (เช่น ตะกร้าสินค้า หรือคำสั่งซื้อ) ได้โดยอัตโนมัติ
3. **การเข้าถึงระบบ Admin:**
   - บัญชีแอดมินเริ่มต้นที่ติดตั้งผ่าน Seed ในระบบคือ:
     - **Email:** `admin@lumina.com`
     - **Password:** `admin123`

---

## 📋 รายละเอียด API Endpoints ทั้งหมด

### 1. Authentication (ระบบจัดการสิทธิ์และยืนยันตัวตน)

#### 1.1 ลงทะเบียนผู้ใช้ใหม่ (Signup)
- **Method:** `POST`
- **Path:** `/api/auth/signup`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "name": "Test User",
    "email": "testuser@lumina.com",
    "password": "password123",
    "confirmPassword": "password123"
  }
  ```
- **Responses:**
  - `200 OK` (ลงทะเบียนและล็อกอินสำเร็จ):
    ```json
    {
      "success": true,
      "message": "ลงทะเบียนสมาชิกสำเร็จ",
      "user": {
        "id": 2,
        "name": "Test User",
        "email": "testuser@lumina.com",
        "role": "member"
      }
    }
    ```
  - `400 Bad Request` (ข้อมูลไม่ถูกต้องตาม Zod Schema เช่น รหัสผ่านยาวไม่พอ หรืออีเมลซ้ำ):
    ```json
    {
      "fieldErrors": {
        "confirmPassword": ["รหัสผ่านไม่ตรงกัน"]
      }
    }
    ```
    หรือ
    ```json
    {
      "error": "อีเมลนี้ถูกใช้งานแล้ว"
    }
    ```

#### 1.2 เข้าสู่ระบบ (Login)
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "email": "testuser@lumina.com",
    "password": "password123"
  }
  ```
- **Responses:**
  - `200 OK` (ล็อกอินสำเร็จ และฝั่งเซิร์ฟเวอร์จะแนบคุกกี้ `lumina-session` กลับมา):
    ```json
    {
      "success": true,
      "message": "เข้าสู่ระบบสำเร็จ",
      "user": {
        "id": 2,
        "name": "Test User",
        "email": "testuser@lumina.com",
        "role": "member"
      }
    }
    ```
  - `400 Bad Request` (ข้อมูลไม่ถูกต้อง หรืออีเมล/รหัสผ่านผิดพลาด):
    ```json
    {
      "error": "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
    }
    ```

#### 1.3 ออกจากระบบ (Logout)
- **Method:** `POST`
- **Path:** `/api/auth/logout`
- **Responses:**
  - `200 OK` (ลบคุกกี้เซสชันสำเร็จ):
    ```json
    {
      "success": true,
      "message": "ออกจากระบบสำเร็จ"
    }
    ```

---

### 2. Books & Catalog (แคตตาล็อกหนังสือสำหรับบุคคลทั่วไป)

#### 2.1 แสดงรายการหนังสือทั้งหมด / ค้นหา (Get Books)
- **Method:** `GET`
- **Path:** `/api/books`
- **Query Parameters:**
  - `search` (ค้นหาจากชื่อหนังสือหรือชื่อผู้แต่ง เช่น: `ความลับแห่งแสงจันทร์`)
  - `category` (สามารถส่งเป็นรหัสหมวดหมู่เช่น `1` หรือส่งเป็นสลักหมวดหมู่เช่น `fiction` ก็ได้)
  - `minPrice` (ราคาสูงสุดเริ่มต้น เช่น `200`)
  - `maxPrice` (ราคาต่ำสุดจำกัด เช่น `500`)
  - `sort` (รูปแบบการจัดเรียง: `newest`, `price-asc`, `price-desc`, `rating`)
- **Responses:**
  - `200 OK` (คืนค่าเป็นรายการหนังสือในรูปแบบอาร์เรย์):
    ```json
    [
      {
        "id": 1,
        "title": "ความลับแห่งแสงจันทร์",
        "author": "พลอยใส รัตนกุล",
        "description": "เมื่อแสงจันทร์นำพาสองหัวใจมาพบกันในค่ำคืนที่แสนยาวนาน นวนิยายโรแมนติกแฟนตาซีที่ครองใจผู้อ่านทั่วประเทศ",
        "price": 350,
        "originalPrice": 400,
        "coverImage": "data:image/jpeg;base64,...",
        "categoryId": 1,
        "stock": 50,
        "isBestSeller": true,
        "rating": 4.8,
        "reviewCount": 125,
        "createdAt": "2026-07-12T13:53:57Z"
      }
    ]
    ```

#### 2.2 แสดงรายละเอียดของหนังสือรายเล่ม (Get Book Details)
- **Method:** `GET`
- **Path:** `/api/books/:id` (เปลี่ยน `:id` เป็นรหัสหนังสือ เช่น `/api/books/1`)
- **Responses:**
  - `200 OK` (ข้อมูลหนังสือ):
    ```json
    {
      "id": 1,
      "title": "ความลับแห่งแสงจันทร์",
      "author": "พลอยใส รัตนกุล",
      ...
    }
    ```
  - `404 Not Found` (ไม่พบหนังสือรหัสที่ส่งมา):
    ```json
    {
      "error": "ไม่พบหนังสือที่ระบุ"
    }
    ```

---

### 3. Shopping Cart (ระบบจัดการตะกร้าสินค้า - *ต้องล็อกอินก่อน*)

#### 3.1 ดึงรายการสินค้าทั้งหมดในตะกร้า (Get Cart Items)
- **Method:** `GET`
- **Path:** `/api/cart`
- **Responses:**
  - `200 OK` (คืนรายการสินค้าในตะกร้าและข้อมูลรายละเอียดหนังสือ):
    ```json
    [
      {
        "id": 1,
        "userId": 2,
        "bookId": 1,
        "quantity": 2,
        "book": {
          "id": 1,
          "title": "ความลับแห่งแสงจันทร์",
          "price": 350,
          ...
        }
      }
    ]
    ```
  - `401 Unauthorized` (ไม่ได้ล็อกอิน):
    ```json
    {
      "error": "กรุณาเข้าสู่ระบบก่อนดำเนินการ"
    }
    ```

#### 3.2 เพิ่มหนังสือเข้าตะกร้าสินค้า (Add to Cart)
- **Method:** `POST`
- **Path:** `/api/cart`
- **Body (JSON):**
  ```json
  {
    "bookId": 1,
    "quantity": 1
  }
  ```
- **Responses:**
  - `200 OK` (เพิ่มลงตะกร้าหรือสะสมจำนวนเพิ่มสำเร็จ):
    ```json
    {
      "success": true,
      "message": "เพิ่มหนังสือลงในตะกร้าเรียบร้อยแล้ว"
    }
    ```

#### 3.3 แก้ไขจำนวนของหนังสือในตะกร้า (Update Cart Item)
- **Method:** `PUT`
- **Path:** `/api/cart/:cartItemId` (เปลี่ยน `:cartItemId` เป็น ID รายการในตะกร้า เช่น `/api/cart/1`)
- **Body (JSON):**
  ```json
  {
    "quantity": 3
  }
  ```
  *(หมายเหตุ: หากอัปเดตจำนวนเป็น `0` หรือติดลบ ระบบจะลบรายการนี้ออกจากตะกร้าให้อัตโนมัติ)*
- **Responses:**
  - `200 OK` (อัปเดตสำเร็จ):
    ```json
    {
      "success": true,
      "message": "อัปเดตจำนวนสินค้าเรียบร้อยแล้ว"
    }
    ```

#### 3.4 ลบหนังสือชิ้นนั้นออกจากตะกร้า (Remove Cart Item)
- **Method:** `DELETE`
- **Path:** `/api/cart/:cartItemId`
- **Responses:**
  - `200 OK` (ลบรายการนี้ออกสำเร็จ):
    ```json
    {
      "success": true,
      "message": "ลบสินค้าออกจากตะกร้าเรียบร้อยแล้ว"
    }
    ```

#### 3.5 ล้างสินค้าทั้งหมดในตะกร้า (Clear Cart)
- **Method:** `DELETE`
- **Path:** `/api/cart`
- **Responses:**
  - `200 OK` (ล้างตะกร้าสำเร็จ):
    ```json
    {
      "success": true,
      "message": "ล้างตะกร้าสินค้าเรียบร้อยแล้ว"
    }
    ```

---

### 4. Orders & Checkout (ระบบสั่งซื้อและชำระเงิน - *ต้องล็อกอินก่อน*)

#### 4.1 เช็คเอาต์คำสั่งซื้อใหม่ (Create Order / Checkout)
- **Method:** `POST`
- **Path:** `/api/orders`
- **Body (JSON):**
  ```json
  {
    "email": "testuser@lumina.com",
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "address": "99/9 หมู่ 9 ถนนพหลโยธิน",
    "city": "คลองหลวง",
    "province": "ปทุมธานี",
    "postalCode": "12120",
    "phone": "0891234567"
  }
  ```
- **เงื่อนไขค่าจัดส่ง:**
  - ยอดซื้อรวมตั้งแต่ **1,000 บาทขึ้นไป** -> จัดส่งฟรี (0 บาท)
  - ยอดซื้อรวม**ต่ำกว่า 1,000 บาท** -> คิดค่าจัดส่ง 50 บาท
- **Responses:**
  - `200 OK` (สร้างรายการออเดอร์สำเร็จ พร้อมคืนข้อมูลค่าใช้จ่ายและรหัสออเดอร์):
    ```json
    {
      "success": true,
      "message": "สร้างคำสั่งซื้อสำเร็จ",
      "orderId": 5,
      "totalAmount": 750,
      "shippingFee": 50
    }
    ```

#### 4.2 เรียกดูประวัติการสั่งซื้อ (Get Order History)
- **Method:** `GET`
- **Path:** `/api/orders`
- **Responses:**
  - `200 OK` (คืนค่าประวัติการสั่งซื้อพร้อมรายการหนังสือที่สั่งทั้งหมด):
    ```json
    [
      {
        "id": 5,
        "userId": 2,
        "totalAmount": 750,
        "shippingFee": 50,
        "status": "pending",
        "shippingAddress": {
          "city": "คลองหลวง",
          "email": "testuser@lumina.com",
          "phone": "0891234567",
          "address": "99/9 หมู่ 9 ถนนพหลโยธิน",
          "province": "ปทุมธานี",
          "lastName": "ใจดี",
          "firstName": "สมชาย",
          "postalCode": "12120"
        },
        "paymentSlipImage": null,
        "createdAt": "2026-07-12T14:22:23Z",
        "updatedAt": "2026-07-12T14:22:23Z",
        "items": [
          {
            "id": 8,
            "orderId": 5,
            "bookId": 1,
            "quantity": 2,
            "price": 350,
            "book": {
              "id": 1,
              "title": "ความลับแห่งแสงจันทร์",
              ...
            }
          }
        ]
      }
    ]
    ```

#### 4.3 อัปโหลดหลักฐานการโอนเงิน (Upload Payment Slip)
- **Method:** `POST`
- **Path:** `/api/orders/:orderId/payment` (เปลี่ยน `:orderId` เป็น ID ของคำสั่งซื้อ เช่น `/api/orders/5/payment`)
- **Body (JSON):**
  ```json
  {
    "base64Image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIA..."
  }
  ```
  *(เมื่ออัปโหลดสำเร็จ สถานะออเดอร์จะเปลี่ยนจาก `pending` เป็น `paid`)*
- **Responses:**
  - `200 OK` (อัปเดตสำเร็จ):
    ```json
    {
      "success": true,
      "message": "อัปโหลดสลิปการชำระเงินเรียบร้อยแล้ว"
    }
    ```

#### 4.4 ยกเลิกคำสั่งซื้อ (Cancel Order)
- **Method:** `POST`
- **Path:** `/api/orders/:orderId/cancel` (เปลี่ยน `:orderId` เป็น ID ของคำสั่งซื้อ)
  *(หมายเหตุ: ยกเลิกได้เฉพาะออเดอร์ที่เป็นสถานะ `pending` หรือ `paid` เท่านั้น)*
- **Responses:**
  - `200 OK` (ยกเลิกสำเร็จ):
    ```json
    {
      "success": true,
      "message": "ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว"
    }
    ```

---

### 5. Admin Panel (บริการส่วนของผู้ดูแลระบบ - *ต้องล็อกอินเป็นสิทธิ์ admin เท่านั้น*)

#### 5.1 เพิ่มหนังสือใหม่เข้าแคตตาล็อก (Admin Add Book)
- **Method:** `POST`
- **Path:** `/api/admin/books`
- **Body (JSON):**
  ```json
  {
    "title": "หนังสือคู่มือสร้างเว็บบอร์ด",
    "author": "แอดมินไอที",
    "description": "คู่มือโปรแกรมมิ่งพัฒนาเว็บไซต์ตั้งแต่ต้นจนจบ",
    "price": 350,
    "originalPrice": 400,
    "categoryId": 3,
    "stock": 15,
    "isBestSeller": false,
    "coverImage": "data:image/jpeg;base64,..."
  }
  ```
- **Responses:**
  - `200 OK` (เพิ่มสำเร็จ):
    ```json
    {
      "success": true,
      "message": "เพิ่มหนังสือเรียบร้อยแล้ว",
      "book": {
        "id": 8,
        "title": "หนังสือคู่มือสร้างเว็บบอร์ด",
        ...
      }
    }
    ```
  - `403 Forbidden` (ไม่มีสิทธิ์แอดมิน):
    ```json
    {
      "error": "ไม่มีสิทธิ์เข้าถึง (สำหรับผู้ดูแลระบบเท่านั้น)"
    }
    ```

#### 5.2 ลบหนังสือออกจากแคตตาล็อก (Admin Delete Book)
- **Method:** `DELETE`
- **Path:** `/api/admin/books/:id` (เปลี่ยน `:id` เป็นรหัสหนังสือ)
- **Responses:**
  - `200 OK` (ลบสำเร็จ):
    ```json
    {
      "success": true,
      "message": "ลบหนังสือเรียบร้อยแล้ว"
    }
    ```

#### 5.3 ยืนยันสลิปการโอนเงิน (Admin Confirm Order Payment)
- **Method:** `POST`
- **Path:** `/api/admin/orders/:orderId/confirm` (เปลี่ยน `:orderId` เป็น ID ของคำสั่งซื้อ)
  *(ปรับสถานะออเดอร์เป็น `confirmed`)*
- **Responses:**
  - `200 OK` (อนุมัติสำเร็จ):
    ```json
    {
      "success": true,
      "message": "ยืนยันสลิปการชำระเงินเรียบร้อยแล้ว"
    }
    ```

#### 5.4 ปฏิเสธสลิปการโอนเงิน / ให้โอนเงินใหม่ (Admin Reject Order Payment)
- **Method:** `POST`
- **Path:** `/api/admin/orders/:orderId/reject` (เปลี่ยน `:orderId` เป็น ID ของคำสั่งซื้อ)
  *(ปรับสถานะออเดอร์กลับไปเป็น `pending` และลบสลิปรูปเดิมออกเพื่อให้ส่งใหม่)*
- **Responses:**
  - `200 OK` (ปฏิเสธสำเร็จ):
    ```json
    {
      "success": true,
      "message": "ปฏิเสธสลิปการชำระเงินเรียบร้อยแล้ว (สถานะกลับเป็นรอดำเนินการ)"
    }
    ```

#### 5.5 อัปเดตสถานะออเดอร์โดยตรง (Admin Update Order Status)
- **Method:** `PUT`
- **Path:** `/api/admin/orders/:orderId/status` (เปลี่ยน `:orderId` เป็น ID ของคำสั่งซื้อ)
- **Body (JSON):**
  ```json
  {
    "status": "shipped"
  }
  ```
  *(ค่าสถานะที่อนุญาต: `pending`, `paid`, `confirmed`, `shipped`, `completed`, `cancelled`)*
- **Responses:**
  - `200 OK` (อัปเดตสำเร็จ):
    ```json
    {
      "success": true,
      "message": "อัปเดตสถานะคำสั่งซื้อเป็น shipped เรียบร้อยแล้ว"
    }
    ```

---

## 🗂️ เทมเพลต Postman Collection สำหรับคัดลอกและนำเข้า (Import)

บันทึกโค้ด JSON ด้านล่างนี้เป็นไฟล์ `LuminaBooks_REST_API.postman_collection.json` จากนั้นคลิก **Import** ในโปรแกรม Postman เพื่อเริ่มทำการทดสอบได้ทันที

```json
{
	"info": {
		"_postman_id": "3b2e5a7b-8ff2-4bc3-95b8-1cf02a3a5f8d",
		"name": "Lumina Books - REST API Verification",
		"description": "คอลเลกชันสำหรับทดสอบ REST API ของระบบ Lumina Books E-Commerce",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
	},
	"item": [
		{
			"name": "1. Authentication",
			"item": [
				{
					"name": "Signup (ลงทะเบียนผู้ใช้งาน)",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"testuser@lumina.com\",\n  \"password\": \"password123\",\n  \"confirmPassword\": \"password123\"\n}"
						},
						"url": {
							"raw": "{{base_url}}/api/auth/signup",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"auth",
								"signup"
							]
						}
					},
					"response": []
				},
				{
					"name": "Login (เข้าสู่ระบบทั่วไป)",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"email\": \"testuser@lumina.com\",\n  \"password\": \"password123\"\n}"
						},
						"url": {
							"raw": "{{base_url}}/api/auth/login",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"auth",
								"login"
							]
						}
					},
					"response": []
				},
				{
					"name": "Login as Admin (เข้าสู่ระบบแอดมิน)",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"email\": \"admin@lumina.com\",\n  \"password\": \"admin123\"\n}"
						},
						"url": {
							"raw": "{{base_url}}/api/auth/login",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"auth",
								"login"
							]
						}
					},
					"response": []
				},
				{
					"name": "Logout (ออกจากระบบ)",
					"request": {
						"method": "POST",
						"header": [],
						"url": {
							"raw": "{{base_url}}/api/auth/logout",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"auth",
								"logout"
							]
						}
					},
					"response": []
				}
			]
		},
		{
			"name": "2. Books & Catalog",
			"item": [
				{
					"name": "Get Books (ดูรายการหนังสือทั้งหมด)",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}/api/books",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"books"
							]
						}
					},
					"response": []
				},
				{
					"name": "Get Books with Filters (ค้นหาและจัดเรียง)",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}/api/books?search=ความลับ&category=fiction&sort=price-asc",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"books"
							],
							"query": [
								{
									"key": "search",
									"value": "ความลับ"
								},
								{
									"key": "category",
									"value": "fiction"
								},
								{
									"key": "sort",
									"value": "price-asc"
								}
							]
						}
					},
					"response": []
				},
				{
					"name": "Get Book Details (ดูข้อมูลรายเล่ม)",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}/api/books/1",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"books",
								"1"
							]
						}
					},
					"response": []
				}
			]
		},
		{
			"name": "3. Cart Services",
			"item": [
				{
					"name": "Get Cart Items (ดูสินค้าในตะกร้า)",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}/api/cart",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"cart"
							]
						}
					},
					"response": []
				},
				{
					"name": "Add to Cart (เพิ่มหนังสือลงตะกร้า)",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"bookId\": 1,\n  \"quantity\": 2\n}"
						},
						"url": {
							"raw": "{{base_url}}/api/cart",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"cart"
							]
						}
					},
					"response": []
				},
				{
					"name": "Update Cart Item Quantity (ปรับจำนวนสินค้า)",
					"request": {
						"method": "PUT",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"quantity\": 3\n}"
						},
						"url": {
							"raw": "{{base_url}}/api/cart/1",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"cart",
								"1"
							]
						}
					},
					"response": []
				},
				{
					"name": "Remove Cart Item (ลบออกจากตะกร้า)",
					"request": {
						"method": "DELETE",
						"header": [],
						"url": {
							"raw": "{{base_url}}/api/cart/1",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"cart",
								"1"
							]
						}
					},
					"response": []
				},
				{
					"name": "Clear Cart (ล้างตะกร้าทั้งหมด)",
					"request": {
						"method": "DELETE",
						"header": [],
						"url": {
							"raw": "{{base_url}}/api/cart",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"cart"
							]
						}
					},
					"response": []
				}
			]
		},
		{
			"name": "4. Order & Checkout",
			"item": [
				{
					"name": "Checkout (สร้างคำสั่งซื้อ)",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"email\": \"testuser@lumina.com\",\n  \"firstName\": \"Test\",\n  \"lastName\": \"User\",\n  \"address\": \"99/9 Paholyothin Road\",\n  \"city\": \"Klong Luang\",\n  \"province\": \"Pathumthani\",\n  \"postalCode\": \"12120\",\n  \"phone\": \"0891234567\"\n}"
						},
						"url": {
							"raw": "{{base_url}}/api/orders",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"orders"
							]
						}
					},
					"response": []
				},
				{
					"name": "Get Orders (ดึงประวัติสั่งซื้อ)",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}/api/orders",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"orders"
							]
						}
					},
					"response": []
				},
				{
					"name": "Upload Payment Slip (ส่งสลิปหลักฐาน)",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"base64Image\": \"data:image/png;base64,iVBORw0KGgoAAAANS...\"\n}"
						},
						"url": {
							"raw": "{{base_url}}/api/orders/1/payment",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"orders",
								"1",
								"payment"
							]
						}
					},
					"response": []
				},
				{
					"name": "Cancel Order (ยกเลิกคำสั่งซื้อ)",
					"request": {
						"method": "POST",
						"header": [],
						"url": {
							"raw": "{{base_url}}/api/orders/1/cancel",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"orders",
								"1",
								"cancel"
							]
						}
					},
					"response": []
				}
			]
		},
		{
			"name": "5. Admin Services",
			"item": [
				{
					"name": "Add Book (เพิ่มหนังสือเข้าระบบ)",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"title\": \"หนังสือใหม่โดยแอดมิน\",\n  \"author\": \"แอดมินใจดี\",\n  \"description\": \"คู่มือโปรแกรมมิ่งพัฒนาเว็บไซต์\",\n  \"price\": 350,\n  \"originalPrice\": 400,\n  \"categoryId\": 1,\n  \"stock\": 20,\n  \"isBestSeller\": false\n}"
						},
						"url": {
							"raw": "{{base_url}}/api/admin/books",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"admin",
								"books"
							]
						}
					},
					"response": []
				},
				{
					"name": "Delete Book (ลบหนังสือ)",
					"request": {
						"method": "DELETE",
						"header": [],
						"url": {
							"raw": "{{base_url}}/api/admin/books/1",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"admin",
								"books",
								"1"
							]
						}
					},
					"response": []
				},
				{
					"name": "Confirm Payment (แอดมินยืนยันยอดโอน)",
					"request": {
						"method": "POST",
						"header": [],
						"url": {
							"raw": "{{base_url}}/api/admin/orders/1/confirm",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"admin",
								"orders",
								"1",
								"confirm"
							]
						}
					},
					"response": []
				},
				{
					"name": "Reject Payment (แอดมินสั่งยกเลิกสลิปให้ส่งใหม่)",
					"request": {
						"method": "POST",
						"header": [],
						"url": {
							"raw": "{{base_url}}/api/admin/orders/1/reject",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"admin",
								"orders",
								"1",
								"reject"
							]
						}
					},
					"response": []
				},
				{
					"name": "Update Order Status (เปลี่ยนสถานะออเดอร์โดยตรง)",
					"request": {
						"method": "PUT",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"status\": \"shipped\"\n}"
						},
						"url": {
							"raw": "{{base_url}}/api/admin/orders/1/status",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"api",
								"admin",
								"orders",
								"1",
								"status"
							]
						}
					},
					"response": []
				}
			]
		}
	],
	"event": [
		{
			"listen": "prerequest",
			"script": {
				"type": "text/javascript",
				"exec": [
					""
				]
			}
		},
		{
			"listen": "test",
			"script": {
				"type": "text/javascript",
				"exec": [
					""
				]
			}
		}
	],
	"variable": [
		{
			"key": "base_url",
			"value": "http://localhost:3000",
			"type": "string"
		}
	]
}
```
