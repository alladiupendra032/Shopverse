# 🚀 E-Commerce Web Application — Development Phases

> **Goal:** A structured, step-by-step development roadmap based on the PRD and Design System. Each phase acts as a prerequisite for the next, ensuring a smooth, logical, and incremental build process.

---

## 🏗️ Phase 1: Project Setup & Foundation
**Focus:** Establishing the skeletal structure of both frontend and backend.

*   **Frontend (React):**
    *   Initialize React app (Vite recommended).
    *   Implement folder structure (`assets/`, `components/`, `pages/`, `context/`, `hooks/`, `styles/`, etc.).
    *   Set up global CSS: Import Google Fonts (`Outfit`, `JetBrains Mono`), define color palettes, spacing variables, and glassmorphism utility classes from `design.md`.
    *   Set up React Router for navigation.
*   **Backend (Node.js/Express):**
    *   Initialize Node.js project.
    *   Set up Express server with basic middleware (CORS, Express JSON).
    *   Establish folder structure (`controllers/`, `routes/`, `middleware/`, `config/`).
*   **Database (Supabase):**
    *   Create Supabase project.
    *   Connect Node.js to Supabase using the official client.

---

## 🗄️ Phase 2: Database Schema & Authentication Setup
**Focus:** Creating the data layer and securing access. *Requires Phase 1 DB connection.*

*   **Supabase Tables:**
    *   Create tables defined in PRD: `users`, `products`, `cart`, `orders`, `order_items`.
    *   Set up Foreign Key relationships (e.g., `cart.user_id` -> `users.id`).
    *   Set up Row Level Security (RLS) policies for secure access.
*   **Authentication (Backend & Supabase):**
    *   Configure Supabase Auth (Email/Password & Google OAuth as per design).
    *   Create backend routes for Auth (if needed as a proxy, or handle directly on frontend).
*   **Authentication (Frontend):**
    *   Build `Login.jsx` and `Register.jsx` using the glassmorphism design.
    *   Create an `AuthContext` to manage global user state.
    *   Implement Protected Routes.

---

## 🧩 Phase 3: Core UI Component Library
**Focus:** Building reusable blocks to speed up page creation. *Requires Phase 1 CSS setup.*

*   **Atoms:**
    *   Create `Button` component (Primary, Ghost, Danger variants with glow effects).
    *   Create `Input` component (Glass style with focus states).
    *   Create `Badge` component (Success, Warning, Error, Primary).
*   **Molecules:**
    *   Create `Skeleton` loader components using the shimmer animation.
    *   Build the `Navbar` (Sticky, glass background, responsive).
*   **Icons:**
    *   Install and configure `lucide-react`.

---

## 🛍️ Phase 4: Product Catalog (Backend & Frontend)
**Focus:** Displaying products to users. *Requires Phase 2 DB & Phase 3 UI.*

*   **Backend:**
    *   Implement Product APIs (`GET /products`, `GET /products/:id`).
*   **Frontend:**
    *   Build `Home.jsx` (Hero section with animations).
    *   Create `ProductCard` component (Hover lifts, glass shadow).
    *   Build `Products.jsx` (Listing page with grid layout and filter sidebar).
    *   Build `ProductDetail.jsx` (Image gallery, price, Add to Cart UI).
    *   Implement fetch logic using custom hooks (e.g., `useProducts`).

---

## 🛒 Phase 5: Shopping Cart & State Management
**Focus:** Allowing users to collect items for purchase. *Requires Phase 4 Products & Phase 2 Auth.*

*   **State Management:**
    *   Create `CartContext` or use Redux/Zustand to handle cart state locally before syncing.
*   **Backend:**
    *   Implement Cart APIs (`GET /cart`, `POST /cart`, `DELETE /cart/:id`).
*   **Frontend:**
    *   Build `CartItem` component.
    *   Build `Cart.jsx` page (List items, calculate subtotal/total, sticky summary card).
    *   Sync local cart state with Supabase database when a user is logged in.

---

## 💳 Phase 6: Checkout & Order Processing
**Focus:** Converting cart items into confirmed orders. *Requires Phase 5 Cart.*

*   **Frontend:**
    *   Build `Checkout.jsx` (Multi-step form: Address -> Payment -> Review).
    *   Implement form validation.
*   **Backend:**
    *   Implement Order APIs (`POST /orders`). This should take cart items, create an entry in `orders`, create entries in `order_items`, and clear the user's `cart`.
*   **Integration:**
    *   Mock payment success flow.
    *   Redirect to order confirmation or User Profile.

---

## 👤 Phase 7: User Profile & Dashboard
**Focus:** User account management. *Requires Phase 6 Orders & Phase 2 Auth.*

*   **Backend:**
    *   Implement API to fetch user's specific orders (`GET /orders?user_id=xyz`).
*   **Frontend:**
    *   Build `Profile.jsx` (User details, avatar).
    *   Build `OrderRow` component to display past orders with status badges.
    *   Implement tab switching (Profile, Orders, Settings).

---

## 👑 Phase 8: Admin Control Panel
**Focus:** System management for privileged users. *Requires Phase 4 & Phase 6.*

*   **Security:**
    *   Update Auth context and Backend middleware to handle Role-Based Access Control (RBAC) ensuring only `admins` can access this area.
*   **Backend:**
    *   Implement Admin APIs (e.g., `POST /products`, `PUT /products/:id`, `DELETE /products/:id`, `PUT /orders/:id` to change status).
*   **Frontend (Admin Area):**
    *   Build Admin `Sidebar` (gradient, collapsible).
    *   Build `Dashboard.jsx` (Stat cards for Revenue, Users, Orders).
    *   Build `ManageProducts.jsx` (Data table with edit/delete glass action buttons).
    *   Build `ManageOrders.jsx` (Update order status functionality).

---

## ✨ Phase 9: Polish & Animations
**Focus:** Bringing the app to life according to `design.md`. *Requires all previous functional phases.*

*   **Micro-interactions:**
    *   Apply staggered `fadeInUp` animations to lists (Products, Cart items, Admin tables).
    *   Add page transition animations.
    *   Ensure hover states (glows, lifts) are perfectly aligned with design tokens.
*   **Performance & SEO:**
    *   Optimize image loading.
    *   Add semantic HTML tags and meta descriptions.
*   **Testing:**
    *   End-to-end testing of the core flow: Login -> Browse -> Cart -> Checkout.

---

## 🚀 Phase 10: Deployment
**Focus:** Going live. *Requires Phase 9.*

*   **Frontend:** Deploy React app to Vercel.
*   **Backend:** Deploy Node.js server to Render or Railway.
*   **Database:** Ensure Supabase production environments are secure (RLS strictly enforced, no public API keys leaked).
*   **Environment Variables:** Wire up production URLs and keys between Frontend, Backend, and Database.
