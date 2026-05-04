# 📄 E-Commerce Web Application PRD (React + Node.js + Supabase)

## 1. Product Overview

**Product Name:** E-Commerce Web Platform  
**Frontend:** React.js  
**Backend:** Node.js (Express.js)  
**Database:** Supabase (PostgreSQL + Auth + Storage)

### Purpose
Build a scalable e-commerce platform where users can browse products, purchase items, and manage orders, while admins manage the system.

---

## 2. Goals & Objectives

- Seamless shopping experience  
- Scalable backend architecture  
- Secure authentication and payments (mock initially)  
- Efficient admin control  

---

## 3. User Roles

### Customer
- Browse, search, filter products  
- Add to cart and checkout  
- Manage profile and orders  

### Admin
- Manage products  
- Manage orders  
- Monitor users  

---

## 4. System Architecture

Frontend (React)
   ↓
Backend (Node.js API)
   ↓
Supabase (PostgreSQL + Auth + Storage)

---

## 5. Frontend (React.js)

### Pages
- Home  
- Product Listing  
- Product Detail  
- Cart  
- Checkout  
- Login/Register  
- Profile  

### Components
- Navbar  
- Product Card  
- Cart Item  

### State Management
- Context API or Redux  

---

## 6. Backend (Node.js)

### Services
- Auth Service  
- Product Service  
- Cart Service  
- Order Service  

### APIs

Auth:
- POST /register  
- POST /login  

Products:
- GET /products  
- GET /products/:id  
- POST /products  
- PUT /products/:id  
- DELETE /products/:id  

Cart:
- GET /cart  
- POST /cart  
- DELETE /cart/:id  

Orders:
- POST /orders  
- GET /orders  
- PUT /orders/:id  

---

## 7. Database (Supabase)

Tables:

users:
- id  
- name  
- email  
- password  

products:
- id  
- name  
- description  
- price  
- stock  
- category  
- image_url  

cart:
- id  
- user_id  
- product_id  
- quantity  

orders:
- id  
- user_id  
- total_price  
- status  
- created_at  

order_items:
- id  
- order_id  
- product_id  
- quantity  

---

## 8. Functional Flow

User → Browse → Cart → Checkout → Order  

Admin → Manage Products → Update → Live  

---

## 9. Non-Functional Requirements

- API response < 500ms  
- Page load < 2s  
- Secure authentication  
- HTTPS enabled  

---

## 10. Security

- JWT authentication  
- Role-based access  
- Input validation  
- Password hashing  

---

## 11. Deployment

Frontend: Vercel  
Backend: Node.js (Render / Railway)  
Database: Supabase  

---

## 12. MVP Scope

- Product listing  
- Cart  
- Checkout  
- Admin panel  

---

## 13. Future Enhancements

- Payments  
- Reviews  
- Wishlist  
- Coupons  

---

## 14. Summary

Full-stack scalable e-commerce system using React, Node.js, and Supabase.
