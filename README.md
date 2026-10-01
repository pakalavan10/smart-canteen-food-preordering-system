# Smart Canteen Food Pre-Ordering System

A full-stack web application for university canteens that lets students order food ahead of
time, gives vendors a way to manage their menu and incoming orders, and gives administrators
control over users, vendors, food items and orders.

---

## Overview

The system replaces the walk-up canteen counter with a simple online ordering flow. Students
browse the menu, add items to a cart, choose a pickup slot and pay either cash at the counter
or through a payment gateway. Vendors receive orders in real time, update their menu and move
orders through the preparation lifecycle. Administrators oversee the platform through
dashboards, analytics and activity logs.

---

## Problem Statement

A traditional campus canteen runs on a physical queue:

- Long waiting lines during the lunch break window.
- Manual ordering at the counter, which slows down every transaction.
- No clear indication of whether an item is available before walking over.
- Students cannot tell whether their order was placed, accepted or is ready.
- Vendors manage stock and orders on paper, so mistakes are common.
- Administrators have no visibility into daily activity or revenue.

The result is wasted time for students, avoidable food waste for vendors, and very little
data for anyone to make decisions with.

---

## Solution

This application turns the canteen into a browser-based ordering system:

- Students get a menu, a cart, pickup-slot selection, online tracking and a QR code on pickup.
- Vendors get a dashboard with incoming orders, menu management and revenue views.
- Administrators get user management, vendor approvals, order monitoring and reports.
- Order status updates are pushed to the browser over Socket.IO instead of requiring a refresh.

---

## Features

### Student Module

- Registration and login with JWT authentication
- OTP-based password reset over email
- Menu browsing with search, category filters, price range and veg/non-veg tags
- Food detail page with ratings and reviews
- Cart with quantity update, item removal and item total
- Pickup time slot selection and special instructions
- Payment: cash on pickup, or online payment through Cashfree (UPI / card)
- Order history and live order tracking with a status timeline
- QR code pickup display
- Favourites list
- Profile update, password change and avatar upload
- Notifications, including payment confirmation

### Vendor Module

- Vendor registration with admin approval required before login
- Vendor dashboard with order and revenue summary
- Add, edit and delete food items, including image upload
- Toggle item availability (ON/OFF stock control)
- Price, preparation time and category management
- Order management: accept, reject, start preparing, mark ready, complete pickup
- Rejection reason handling
- Revenue analytics by day, week and month
- Review and feedback view
- Shop profile update with shop image upload
- Notifications

### Admin Module

- Admin dashboard with platform-wide metrics
- Student management: view, activate/deactivate, delete
- Vendor management: view, approve/reject, activate/deactivate, delete
- Food item oversight: view all items, toggle availability, delete
- Category management: create, edit, delete, toggle and sort categories
- Order monitoring across all vendors
- Revenue analytics and peak ordering hours
- Sales report export to PDF and Excel
- Broadcast announcements to users
- Activity logs of system events
- System settings screen

---

## Technology Stack

**Frontend**

- React 18
- Vite 5
- Tailwind CSS 3
- React Router DOM 6
- Axios
- Socket.IO Client
- Recharts (analytics charts)
- Framer Motion (animations)
- React Hot Toast (notifications)
- QRCode.react (pickup QR)
- React Icons

**Backend**

- Node.js
- Express.js 4
- Socket.IO
- Mongoose 8 / MongoDB
- jsonwebtoken (JWT access + refresh tokens)
- bcryptjs (password hashing)
- helmet (security headers)
- cors
- express-rate-limit (API, auth and OTP rate limiting)
- express-validator (request validation)
- multer (image uploads)
- nodemailer (OTP emails)
- pdfkit and exceljs (report exports)
- puppeteer-core (PDF generation)

**Payment**

- Cashfree (server SDK `cashfree-pg`, frontend drop-in `@cashfreepayments/cashfree-js`)

---

## System Architecture

```
Student / Vendor / Admin
            |
        Browser (React SPA)
            |
     HTTPS / Socket.IO connection
            |
   Node.js + Express REST API
     |          |            |
  MongoDB   Cashfree   Socket.IO server
            |
      Email (Nodemailer)
```

The frontend calls the backend through a single `/api` base path. During development, Vite
proxies `/api` and `/uploads` to `http://localhost:5000`. Authentication uses JWT access
tokens with refresh tokens, and protected routes are enforced by role middleware on the
server, not only in the UI.

Payment credentials exist only on the backend. The browser receives a short-lived
`payment_session_id` and opens the Cashfree drop-in; the server independently verifies the
payment status and amount before marking an order as paid.

---

## Project Structure

```
.
├── client/                     # React frontend (Vite)
│   ├── public/                 # favicon and icon assets
│   ├── src/
│   │   ├── api/axios.js        # axios instance, auth + refresh interceptors
│   │   ├── assets/             # images
│   │   ├── components/
│   │   │   ├── common/         # layout, table, modal, pagination, etc.
│   │   │   ├── student/        # cart item, menu card, timeline, QR code
│   │   │   └── vendor/         # menu form, order card, revenue chart
│   │   ├── context/            # auth, cart, socket, theme, notifications
│   │   ├── hooks/              # useAuth, useCart, useCashfreeCheckout, useFetch
│   │   ├── layouts/            # student, vendor and admin layouts
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── student/
│   │   │   ├── vendor/
│   │   │   └── admin/
│   │   └── utils/              # constants and helpers
│   ├── vite.config.js          # dev server and API proxy
│   └── package.json
│
├── server/                     # Node.js + Express backend
│   ├── config/                 # database, email, Cashfree configuration
│   ├── controllers/            # request handlers per resource
│   ├── middleware/             # auth, error handling, rate limiting, uploads
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express routers
│   ├── services/               # Cashfree payment service
│   ├── utils/                  # tokens, socket, email, validators
│   ├── uploads/                # runtime image uploads (git-ignored)
│   ├── .env.example            # environment template
│   ├── seed.js                 # initial admins and categories
│   └── server.js               # app entry point
│
├── .gitignore
└── README.md
```

---

## Installation

### Prerequisites

- Node.js 18 or later
- MongoDB installed and running (local or Atlas)
- npm

### Steps

```bash
git clone https://github.com/pakalavan10/smart-canteen-food-preordering-system.git
cd smart-canteen-food-preordering-system

# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
```

---

## Environment Setup

The backend reads configuration from `server/.env`. Create it from the template:

```bash
cd server
cp .env.example .env      # Windows PowerShell: copy .env.example .env
```

`server/.env` is git-ignored and must never be committed.

### Backend variables (`server/.env.example`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | Express server port (default `5000`) |
| `NODE_ENV` | No | Runtime mode |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Signing secret for access tokens |
| `JWT_REFRESH_SECRET` | Yes | Signing secret for refresh tokens |
| `JWT_EXPIRE` | No | Access token lifetime (default `1d`) |
| `JWT_REFRESH_EXPIRE` | No | Refresh token lifetime (default `7d`) |
| `EMAIL_USER` | For OTP email | Nodemailer sender account |
| `EMAIL_PASS` | For OTP email | Nodemailer app password |
| `CLIENT_URL` | Yes | Frontend origin, used for CORS and payment redirects |
| `CASHFREE_APP_ID` | For online payment | Cashfree application ID |
| `CASHFREE_SECRET_KEY` | For online payment | Cashfree secret key (backend only) |
| `CASHFREE_ENVIRONMENT` | For online payment | `SANDBOX` or `PRODUCTION` |
| `CASHFREE_RETURN_URL` | No | Override for the post-payment redirect |
| `CASHFREE_WEBHOOK_URL` | No | Public webhook URL registered with Cashfree |

Use long random strings for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

### Frontend variables

The frontend needs no environment file for local development. The axios client uses the
relative `/api` path, which Vite proxies to the backend. If you need to point the Socket.IO
client at a different host, you may optionally set `VITE_API_URL` in `client/.env`.

---

## Database Setup

1. Start MongoDB locally, or use a MongoDB Atlas connection string.
2. Set `MONGO_URI` in `server/.env`, for example:
   `mongodb://localhost:27017/campus_canteen`
3. Optionally seed initial data. This creates two demo admin accounts and four default food
   categories (Breakfast, Lunch, Snacks, Drinks):

   ```bash
   cd server
   npm run seed
   ```

   The seed script creates admin accounts with the passwords hardcoded in `server/seed.js`.
   Change or remove those accounts before using this on any shared or public deployment.

Food items and vendor accounts are created through the application UI, so a fresh install
starts with no menu until a vendor adds items.

---

## Running the Project

Use two terminals.

**Terminal 1 — backend (port 5000):**

```bash
cd server
npm run dev
```

**Terminal 2 — frontend (port 5173):**

```bash
cd client
npm run dev
```

Open `http://localhost:5173`.

Other useful scripts:

```bash
cd client && npm run build     # production build into client/dist
cd client && npm run lint      # ESLint
cd client && npm run preview   # serve the production build locally
cd server && npm start         # run the backend without nodemon
```

---

## Payment Integration

Cashfree is integrated for online payment. Cash on pickup remains the default and is fully
functional.

**How it works**

1. The student selects UPI, card or online gateway at checkout.
2. The backend creates a Cashfree order using the amount stored in MongoDB for that order. The
   amount sent by the browser is never trusted.
3. The backend returns a `payment_session_id`, and the frontend opens the Cashfree drop-in.
4. Cashfree redirects the student to `/student/payment-status`.
5. The status page calls the backend, which fetches the payment status from Cashfree and
   confirms the paid amount matches the order total before marking the order as paid.
6. Unpaid or abandoned online orders stay pending, and the student can retry payment from the
   order tracking page.

A webhook endpoint exists at `POST /api/payments/webhook`. It verifies the Cashfree
signature against the raw request body and applies payment updates idempotently.

**Status of verification — please read**

- Verified: real Cashfree **sandbox** session creation, session resumption for an unpaid
  order, and server-side verification returning `PENDING` before payment.
- Not fully verified: completing an actual sandbox payment inside the browser drop-in, and
  live webhook delivery. Webhook delivery requires a publicly reachable HTTPS URL configured in
  the Cashfree dashboard, which is an external setup step.
- This integration has not been verified against Cashfree production mode and should be
  treated as sandbox-ready, not production-verified.

Sandbox credentials are available from the Cashfree dashboard under
`https://merchant.cashfree.com/devstudio/home` → API Keys. Never commit them.

---

## API Overview

All endpoints are prefixed with `/api`. Protected routes require
`Authorization: Bearer <access token>`.

| Area | Endpoints |
| --- | --- |
| Health | `GET /api/health` |
| Auth | `POST /api/auth/student/register`, `POST /api/auth/student/login`, `POST /api/auth/vendor/register`, `POST /api/auth/vendor/login`, `POST /api/auth/admin/login`, `POST /api/auth/refresh-token`, `POST /api/auth/*/forgot-password`, `POST /api/auth/*/verify-otp`, `POST /api/auth/*/reset-password`, `GET /api/auth/me` |
| Student | `GET /api/students/dashboard`, `PUT /api/students/profile`, `PUT /api/students/change-password` |
| Vendor | `GET /api/vendors/dashboard`, `PUT /api/vendors/profile`, `GET /api/vendors/revenue`, `GET /api/vendors/feedback` |
| Admin | `GET /api/admin/dashboard`, `GET /api/admin/students`, `PATCH /api/admin/students/:id/toggle`, `DELETE /api/admin/students/:id`, `GET /api/admin/vendors`, `PATCH /api/admin/vendors/:id/approve`, `PATCH /api/admin/vendors/:id/toggle`, `DELETE /api/admin/vendors/:id`, `POST /api/admin/announcements`, `GET /api/admin/activity-logs` |
| Food | `GET /api/foods`, `GET /api/foods/:id`, `POST /api/foods`, `PUT /api/foods/:id`, `DELETE /api/foods/:id`, `PATCH /api/foods/:id/toggle`, `GET /api/foods/vendor/my-foods`, `PATCH /api/foods/admin/:id/toggle`, `DELETE /api/foods/admin/:id` |
| Categories | `GET /api/categories`, `GET /api/categories/:id`, `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id`, `PATCH /api/categories/:id/toggle` |
| Orders | `POST /api/orders`, `GET /api/orders/my-orders`, `GET /api/orders/:id`, `GET /api/orders/vendor-orders`, `GET /api/orders/all`, `PATCH /api/orders/:id/accept`, `PATCH /api/orders/:id/reject`, `PATCH /api/orders/:id/preparing`, `PATCH /api/orders/:id/ready`, `PATCH /api/orders/:id/complete` |
| Payments | `POST /api/payments/create-session`, `POST /api/payments/verify`, `POST /api/payments/webhook` |
| Reviews | `GET /api/reviews/food/:foodId`, `POST /api/reviews`, `DELETE /api/reviews/:id` |
| Favorites | `GET /api/favorites`, `POST /api/favorites`, `DELETE /api/favorites/:foodId`, `GET /api/favorites/check/:foodId` |
| Notifications | `GET /api/notifications`, `GET /api/notifications/unread-count`, `PATCH /api/notifications/mark-all-read`, `PATCH /api/notifications/:id/read`, `DELETE /api/notifications/:id` |
| Analytics | `GET /api/analytics/admin`, `GET /api/analytics/vendor` |
| Reports | `GET /api/reports`, `GET /api/reports/export/pdf`, `GET /api/reports/export/excel` |

Order status flow: `pending` → `accepted` → `preparing` → `ready` → `completed`, with
`rejected` and `cancelled` as terminal alternatives.

---

## Security Notes

- Passwords are hashed with bcrypt and are never returned in API responses.
- JWT access and refresh tokens are used, and protected routes are enforced server-side by role.
- `helmet` sets security headers, including a Content Security Policy that allows the Cashfree
  checkout iframe.
- Rate limiting is applied globally on `/api`, with stricter limits on authentication and OTP
  endpoints.
- Request bodies are validated with `express-validator`.
- Uploads are restricted by MIME type and size (5 MB) and stored with random filenames.
- Payment secrets are read from environment variables on the backend only; no payment
  credential appears in the frontend bundle.
- `.env` files are git-ignored. Only `.env.example` placeholders are committed.
- The demo admin passwords in `server/seed.js` are hardcoded for convenience and must be
  changed or removed for any real deployment.

---

## Known Limitations

- Online payment has not been verified against Cashfree production mode.
- Webhook delivery requires external public URL setup and has not been verified end to end.
- There is no automated test suite. Verification was done by building the frontend, running the
  backend, and exercising the API and payment session flows manually.
- `server/seed.js` contains hardcoded demo admin credentials.
- In-memory rate limiters reset whenever the server restarts and are not shared across
  instances, so they are not suitable for a multi-instance deployment.

---

## Future Enhancements

These are ideas, not implemented features:

- Push or email notifications for order status changes
- Inventory forecasting based on order history
- QR-based or NFC-based pickup verification at the counter
- A native mobile application
- Scheduled or recurring orders
- Coupon codes and promotional pricing
- Multi-language support
- Production deployment with HTTPS, a process manager and centralized logging
- Containerized deployment with Docker
- Automated test suite for the API and critical flows

---

## License

Released under the MIT License.