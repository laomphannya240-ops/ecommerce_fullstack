# Modern Full-Stack E-commerce Website

A production-structured e-commerce application built as **two separate projects**:

- **`ecommerce-backend/`** – Laravel REST API, Sanctum auth, MySQL-ready database, business logic
- **`ecommerce-frontend/`** – React + Vite SPA, Tailwind CSS, customer storefront and admin dashboard

The frontend and backend run independently and communicate through RESTful APIs.

## Technology Stack

**Frontend**
- React (Vite)
- Tailwind CSS v4
- React Router DOM
- Axios
- React Context API (auth, cart, theme, language)
- Lucide React icons
- Sonner toasts

**Backend**
- PHP Laravel
- Laravel Sanctum authentication
- Eloquent ORM
- RESTful API controllers, middleware, validation
- MySQL (primary) / SQLite (quick local dev)

**Payment**
- KHQR / Bakong integration structure (real mode requires official API credentials & verification integration)
- Cash on Delivery (COD)
- Safe development mock payment mode (`PAYMENT_MODE=mock`) – explicit verification only, no automatic/simulated live success
- Transaction ID tracking and payment status records

## Project Structure

```text
ecommerce/
├── ecommerce-backend/      # Laravel API (independent)
├── ecommerce-frontend/     # React + Vite app (independent)
├── docs/
│   ├── ERD.md              # Database ERD and schema notes
│   └── API.md              # API endpoint documentation
└── README.md
```

> **Important:** React files are only in `ecommerce-frontend`. Laravel files are only in `ecommerce-backend`.

## Prerequisites

- PHP 8.3+
- Composer
- Node.js 18+ and npm
- MySQL 8+ (recommended) or SQLite
- Git

## Backend Setup (`ecommerce-backend`)

1. **Install dependencies**
   ```bash
   cd ecommerce-backend
   composer install
   ```

2. **Environment configuration**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   Edit `.env` and configure:
   - `APP_URL=http://localhost:8001`
   - `FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173`
   - Database (MySQL recommended):
     ```env
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3309
     DB_DATABASE=ecommerce
     DB_USERNAME=root
     DB_PASSWORD=
     ```
   - Port `3309` is used because another MySQL instance already occupies `3306` on this machine. Port `8001` is used because `8000` is occupied by another app.
   - Payment (safe defaults):
     ```env
     PAYMENT_MODE=mock
     KHQR_API_BASE_URL=
     KHQR_MERCHANT_ID=
     KHQR_MERCHANT_NAME=
     KHQR_API_TOKEN=
     COD_ENABLED=true
     ```

3. **Create database** (MySQL)
   ```sql
   CREATE DATABASE ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Run migrations and seed demo data**
   ```bash
   php artisan migrate --seed
   ```
   This creates tables and seeds demo data including:
   - **Admin:** `admin@lumen.test` / `password`
   - **Customer:** `customer@lumen.test` / `password`
   - Sample categories, brands, products, banner, coupon (`WELCOME10`)

5. **Storage link (for uploaded/public files)**
   ```bash
   php artisan storage:link
   ```

6. **Start the API server**
   ```bash
   php artisan serve --port=8001
   ```
   API base URL: `http://localhost:8001/api`

## Frontend Setup (`ecommerce-frontend`)

1. **Install dependencies**
   ```bash
   cd ecommerce-frontend
   npm install
   ```

2. **Environment configuration**
   ```bash
   cp .env.example .env
   ```
   Set the backend API URL:
   ```env
   VITE_API_BASE_URL=http://localhost:8001/api
   VITE_APP_NAME=Lumen Store
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   App URL: `http://localhost:5173`

4. **Production build**
   ```bash
   npm run build
   npm run preview
   ```

## CORS & API Connection

- Backend CORS is configured in `ecommerce-backend/config/cors.php` to allow frontend origins (including `FRONTEND_URL`).
- Frontend Axios client uses `VITE_API_BASE_URL` and sends Sanctum Bearer tokens from `localStorage`.
- Ensure both servers run simultaneously and `FRONTEND_URL`/origins match your frontend host.

## Payment Behavior

- **COD:** Creates order and pending payment; settlement/status managed by admin/store workflow.
- **KHQR / Bakong:**
  - `PAYMENT_MODE=mock` (default dev): generates mock QR payload for display and supports **explicit** verification endpoint for testing. No real money is processed.
  - `PAYMENT_MODE=live`: requires official Bakong/KHQR credentials and a proper verification integration. The system **does not simulate successful payments** in live mode; verification must be performed through the supported provider mechanism before marking paid.
- Payment secrets/tokens must remain in backend environment variables and never be exposed in frontend code.
- Checkout totals, discounts, and stock validation are calculated/validated on the backend inside database transactions.

## Key Features Implemented

- **Customer:** registration/login/logout, profile/password, product browsing/search/filter/sort, categories, cart, wishlist, addresses, checkout, coupon application, order history/details/cancellation (eligible orders), KHQR mock payment flow & COD, reviews
- **Admin:** protected dashboard with stats, products/categories/brands CRUD, orders list/detail/status updates, customers management, coupons, banners, payments, sales reports
- **Cross-cutting:** role-based access control, responsive UI, dark mode, EN/KH translation toggle, API pagination/search/filtering, consistent JSON responses

## Security Notes

- Passwords hashed via Laravel.
- Private APIs protected by Sanctum (`auth:sanctum`) and admin middleware.
- Input validation on API requests.
- Product prices/totals computed server-side; stock validated before checkout.
- Database transactions used for checkout/payment-critical operations.
- Use environment variables for secrets and credentials.

## Documentation

- [Database ERD](docs/ERD.md)
- [API Documentation](docs/API.md)

## Development Notes

- Both projects are independent; install/run them separately.
- Default seeded credentials are for local development only.
- For production, configure MySQL, secure env secrets, implement official KHQR/Bakong live verification callbacks/API checks, and review deployment hardening (HTTPS, queues, mail, storage, monitoring).
