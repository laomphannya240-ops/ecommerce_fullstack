# API Documentation

Base URL (local): `http://localhost:8000/api`

All responses are JSON. Most endpoints return:

```json
{
  "success": true,
  "message": "...",
  "data": ...
}
```

Errors:

```json
{
  "success": false,
  "message": "...",
  "errors": { ... }
}
```

Paginated responses use Laravel pagination objects inside `data` (e.g. `data.data`, `data.current_page`, `data.last_page`, etc.).

## Authentication

- **Type:** Laravel Sanctum Bearer token
- **Header:** `Authorization: Bearer <token>`
- **Roles:** `customer`, `admin`
- Admin routes require `auth:sanctum` + admin middleware.

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register customer. Body: `name, email, phone?, password, password_confirmation` |
| POST | `/login` | No | Login. Body: `email, password`. Returns `user` and `token` |
| POST | `/logout` | Yes | Revoke current access token |
| GET | `/user` | Yes | Get authenticated user |
| PUT | `/user/profile` | Yes | Update profile. Body: `name?, phone?, avatar?` |
| PUT | `/user/password` | Yes | Change password. Body: `current_password, password, password_confirmation` |
| POST | `/forgot-password` | No | Request password reset link. Body: `email` |
| POST | `/reset-password` | No | Reset password. Body: `token, email, password, password_confirmation` |

## Public Catalog

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/products` | No | List active products (paginated). Query: `search, category_id, category(slug), brand_id, featured, min_price, max_price, sort(price_asc|price_desc|newest|name_asc|name_desc), page, per_page` |
| GET | `/products/{id}` | No | Product details with images, reviews summary |
| GET | `/categories` | No | Active categories with product counts |
| GET | `/categories/{id}` | No | Category details |
| GET | `/brands` | No | Active brands |
| GET | `/banners` | No | Active banners by position/schedule |
| GET | `/products/{id}/reviews` | No | Approved reviews for a product (paginated) |
| GET | `/home` | No | Storefront aggregate data (banners, categories, featured/new/best sellers) |
| GET | `/settings` | No | Public store/payment settings summary |

## Customer (Authenticated)

### Cart
| Method | Endpoint | Description |
|---|---|---|
| GET | `/cart` | Get current user's cart with items, subtotal, items_count |
| POST | `/cart/items` | Add item. Body: `product_id, quantity?` |
| PUT | `/cart/items/{item}` | Update quantity. Body: `quantity` |
| DELETE | `/cart/items/{item}` | Remove item |
| DELETE | `/cart` | Clear cart |

### Wishlist
| Method | Endpoint | Description |
|---|---|---|
| GET | `/wishlist` | Get wishlist with items |
| POST | `/wishlist/items` | Add product. Body: `product_id` |
| DELETE | `/wishlist/items/{item}` | Remove item |

### Addresses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/addresses` | List user's addresses |
| POST | `/addresses` | Create address. Body: `label?, recipient_name, phone, line1, line2?, city, state?, postal_code?, country?, is_default?` |
| PUT | `/addresses/{id}` | Update address (owner only) |
| DELETE | `/addresses/{id}` | Delete address (owner only) |

### Coupons
| Method | Endpoint | Description |
|---|---|---|
| POST | `/coupons/apply` | Validate/apply coupon. Body: `code, subtotal`. Returns coupon and `discount_amount` |

### Orders & Checkout
| Method | Endpoint | Description |
|---|---|---|
| GET | `/orders` | List current user's orders (paginated) |
| POST | `/orders` | Place order/checkout. Body: `address_id, payment_method(khqr|cod), coupon_code?, notes?`. Creates order, order items, payment; validates stock; calculates totals server-side; decrements stock in transaction |
| GET | `/orders/{id}` | Order details (owner or admin) |
| POST | `/orders/{id}/cancel` | Cancel eligible order (owner). Restores stock for eligible cancellations |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/payments` | Get existing payment for an order. Body: `order_id` |
| GET | `/payments/{id}` | Payment details (owner or admin) |
| POST | `/payments/verify` | Explicit verification. Body: `payment_id, transaction_id?, provider_reference?, status?(paid|failed)`.<br>**Mock mode:** allowed for development/testing; updates status only when explicitly called.<br>**Live mode:** returns error unless official provider verification is configured/integrated (no simulated success). |

### Reviews
| Method | Endpoint | Description |
|---|---|---|
| POST | `/products/{id}/reviews` | Submit/update review for product. Body: `rating(1-5), title?, comment?, order_id?` |

## Admin Endpoints (Admin role required)

Base prefix: `/admin`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/dashboard` | Dashboard stats, revenue-by-day, orders-by-status, recent orders/customers, best sellers, low stock |
| GET | `/admin/reports` | Sales/order/product reports. Query: `from?, to?` |

### Resource CRUD
- `/admin/products` – `apiResource` (index, store, show, update, destroy)
- `/admin/categories` – `apiResource`
- `/admin/brands` – `apiResource`
- `/admin/coupons` – `apiResource`
- `/admin/banners` – `apiResource`

### Customers
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/customers` | List customers (paginated). Query: `search, per_page` |
| GET | `/admin/customers/{user}` | Customer details with recent orders |
| PUT | `/admin/customers/{user}` | Update customer. Body: `name?, phone?, is_active?` |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/orders` | List all orders (paginated). Query: `status, payment_status, search, per_page` |
| GET | `/admin/orders/{order}` | Order details |
| PUT | `/admin/orders/{order}/status` | Update order/payment status. Body: `status, payment_status?`. Handles stock restoration on cancellation logic |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/payments` | List payments (paginated). Query: `status, payment_method, per_page` |
| GET | `/admin/payments/{payment}` | Payment details |
| PUT | `/admin/payments/{payment}/status` | Update payment status and sync order payment state. Body: `status, transaction_id?` |

### Reviews (Admin moderation)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/reviews` | List reviews. Query: `status(approved|pending), per_page` |
| PUT | `/admin/reviews/{review}` | Approve/unapprove. Body: `is_approved` |
| DELETE | `/admin/reviews/{review}` | Delete review |

## Example: Login

Request:
```http
POST /api/login
Content-Type: application/json

{ "email": "customer@example.com", "password": "password" }
```

Response:
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": { "id": 2, "name": "Test Customer", "email": "customer@example.com", "role": "customer" },
    "token": "<sanctum-token>"
  }
}
```

## Notes

- Checkout/payment amounts are authoritative on the backend.
- KHQR live verification requires official API integration; mock mode is for development only and must remain clearly separated.
- CORS must allow the frontend origin (see backend `config/cors.php` and `FRONTEND_URL`).
- For production, secure secrets, enable HTTPS, configure mail/queue/storage, and implement provider-specific payment verification/webhooks as required by Bakong.
