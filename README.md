# 🛍️ E-Commerce Platform

<div align="center">

**A production-oriented full-stack e-commerce system featuring a payment state machine, stock reservation flow, real-time customer support chat, and a fully containerized infrastructure.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Site-4F46E5?style=for-the-badge&logo=vercel&logoColor=white)](https://e-commerce-ecru-tau-95.vercel.app)
[![GitHub stars](https://img.shields.io/github/stars/Ngo-Viet-Hoang1/e-commerce?style=for-the-badge&logo=github)](https://github.com/Ngo-Viet-Hoang1/e-commerce/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Ngo-Viet-Hoang1/e-commerce?style=for-the-badge&logo=github)](https://github.com/Ngo-Viet-Hoang1/e-commerce/network)
[![GitHub issues](https://img.shields.io/github/issues/Ngo-Viet-Hoang1/e-commerce?style=for-the-badge)](https://github.com/Ngo-Viet-Hoang1/e-commerce/issues)
[![License](https://img.shields.io/github/license/Ngo-Viet-Hoang1/e-commerce?style=for-the-badge)](LICENSE)

</div>

---

## 📖 Overview

This repository contains a full-stack e-commerce platform built with a focus on **production-level engineering practices** rather than feature quantity. Key engineering highlights include:

- **Payment state machine** with idempotent VNPay callback handling
- **Stock reservation system** using optimistic concurrency control and a scheduled cron job for automatic expiry
- **JWT authentication** with access/refresh token rotation, device tracking, and Redis-backed token revocation
- **Real-time customer support chat** powered by Stream Chat (user ↔ admin)
- **PDF invoice generation** via Puppeteer
- **Containerized infrastructure** with Docker Compose (PostgreSQL, Redis, Nginx)
- **RBAC (Role-Based Access Control)** with granular permission management

---

## ✨ Features

### 🧑‍💻 Customer-Facing

| Feature | Details |
|---|---|
| **Product Browsing** | Browse by category, brand, and badge; view variants, images, and videos |
| **Product Search & Filter** | Filter by attributes, price range, brand, and category |
| **Product Detail** | Rich product descriptions (TipTap), variant selection with stock indicators |
| **Shopping Cart** | Add, update, and remove items with persistent state |
| **Checkout** | Multi-step checkout with address management and payment method selection |
| **VNPay Payment** | Online payment with real-time status tracking and redirect handling |
| **Order History** | View past orders with full line-item breakdown and status timeline |
| **Favorite Products** | Save and manage a personal wishlist |
| **Profile Management** | Update personal info and manage shipping addresses |
| **Support Chat** | Real-time chat channel with admin support (Stream Chat) |

### 🔐 Authentication & Security

| Feature | Details |
|---|---|
| **User Registration & Login** | Email/password with bcrypt hashing |
| **Access + Refresh Tokens** | Dual-token flow with Redis-backed revocation store |
| **Token Rotation** | Refresh token consumed on use (automatic rotation) |
| **Device & IP Tracking** | Mismatch detection on refresh |
| **Role-Based Access Control** | Admin and User roles with fine-grained permission system |
| **Rate Limiting** | Redis-backed rate limiter per IP in production |

### 🧑‍💼 Admin Panel

| Module | Capabilities |
|---|---|
| **Dashboard** | Overview metrics and analytics |
| **Product Management** | Full CRUD with rich text editor, image management, variant/attribute management |
| **Category Management** | Nested category structure |
| **Brand Management** | Brand CRUD with image support |
| **Badge Management** | Promotional badge assignment |
| **Order Management** | View and update order & payment status |
| **User Management** | View, activate/deactivate users |
| **Support Chat** | Real-time unified inbox for all customer conversations |

### ⚙️ Backend Engineering Highlights

- **Payment State Machine**: Orders move through `pending_payment → paid → processing → shipped → delivered / cancelled / refunded` with strict transition validation
- **Stock Reservation Flow**: Inventory is optimistically locked on checkout and automatically released via a `node-cron` job if payment expires within the TTL window
- **Idempotent VNPay Callback**: Webhook handler is safe to retry — checks existing payment status before processing, preventing double-processing
- **Structured Logging**: Winston with daily log rotation, request IDs, and structured JSON output
- **Request Validation**: All endpoints validated with Zod schemas
- **PDF Invoice Generation**: Puppeteer renders HTML invoice templates to PDF on demand

---

## 🛠️ Tech Stack

### Frontend

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router_v7-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

| Library | Purpose |
|---|---|
| **TanStack Query v5** | Server state management, caching, and background refetching |
| **Zustand** | Client-side global state (cart, auth) |
| **Radix UI + shadcn/ui** | Accessible, headless UI component primitives |
| **Framer Motion** | Page transitions and micro-animations |
| **React Hook Form + Zod** | Form management with schema-based validation |
| **TipTap** | Rich text editor for product descriptions (admin) |
| **Stream Chat React** | Real-time chat UI component library |
| **Embla Carousel** | Product image carousel |
| **Axios** | HTTP client with interceptors |

### Backend

![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis_7-DC382D?style=for-the-badge&logo=redis&logoColor=white)

| Library | Purpose |
|---|---|
| **Prisma ORM v7** | Type-safe database access, migrations, and seeding |
| **Passport.js + JWT** | Authentication strategy with access & refresh token support |
| **Zod** | Runtime request schema validation |
| **Winston** | Structured logging with daily file rotation |
| **ioredis** | Redis client for token store and rate limiting |
| **node-cron** | Scheduled job for stock reservation expiry |
| **Puppeteer** | Headless browser for PDF invoice rendering |
| **Stream Chat** | Real-time chat server-side token issuance and channel management |
| **VNPay SDK** | Vietnamese payment gateway integration |
| **Helmet + CORS** | HTTP security headers and origin control |
| **sanitize-html** | Input sanitization to prevent XSS |
| **compression** | Gzip response compression |

### Infrastructure & DevOps

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

| Technology | Purpose |
|---|---|
| **Docker Compose** | Multi-service orchestration (postgres, redis, backend, frontend, migrator) |
| **Nginx** | Frontend static file serving and reverse proxy |
| **Cloudinary** | Cloud image storage and delivery for product images |
| **PostgreSQL 16** | Primary relational database with production tuning |
| **Redis 7** | Refresh token store, rate limiting |

> **Note:** RabbitMQ is defined in the Docker Compose configuration as a planned infrastructure component for future async task processing (e.g., order confirmation emails), but is not yet integrated into application code.

---

## 🖥️ Screenshots

> Screenshots will be added after the project's UI stabilizes. The live demo is available at [e-commerce-ecru-tau-95.vercel.app](https://e-commerce-ecru-tau-95.vercel.app).

<!-- Homepage -->
<!-- ![Homepage](docs/screenshots/homepage.png) -->
<!-- Product Catalog -->
<!-- ![Product Catalog](docs/screenshots/catalog.png) -->
<!-- Shopping Cart -->
<!-- ![Cart](docs/screenshots/cart.png) -->
<!-- Admin Dashboard -->
<!-- ![Admin](docs/screenshots/admin-dashboard.png) -->

---

## 📁 Project Structure

```
e-commerce/
├── backend/                        # Express API (Bun runtime)
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema (models split into separate files)
│   │   ├── migrations/             # Prisma migration history
│   │   └── seed/                   # Database seeding scripts
│   ├── src/
│   │   ├── api/v1/
│   │   │   ├── modules/            # Feature modules (auth, product, order, payment, ...)
│   │   │   │   ├── auth/           # JWT auth, token rotation, admin auth
│   │   │   │   ├── order/          # Order state machine + stock reservation
│   │   │   │   ├── payment/        # Payment CRUD + VNPay webhook
│   │   │   │   ├── product/        # Product catalog with variants, images, videos
│   │   │   │   ├── invoice/        # PDF invoice generation (Puppeteer)
│   │   │   │   └── ...             # address, cart, brand, category, badge, user, ...
│   │   │   ├── routes/             # Top-level route registration
│   │   │   └── shared/             # Middleware, config, utils, base models
│   │   ├── app.ts                  # Express app setup (middleware stack)
│   │   └── server.ts               # Server entry point
│   ├── .env.example
│   └── package.json
├── frontend/                       # React SPA (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── user/               # Home, catalog, product detail, cart, checkout, profile
│   │   │   ├── admin/              # Dashboard, product/order/user management
│   │   │   └── common/             # Shared pages (about, error boundaries)
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn/ui base components
│   │   │   ├── commerce-ui/        # Domain-specific components
│   │   │   ├── cart/               # Cart-related components
│   │   │   ├── product/            # Product card, gallery, etc.
│   │   │   └── common/             # Layout, chat widget, shared components
│   │   ├── routes/                 # React Router config (user + admin + guards)
│   │   ├── store/                  # Zustand global state
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── api/                    # Axios instances and API call functions
│   │   ├── providers/              # Context providers (TanStack Query, Stream Chat, Theme)
│   │   └── schema/                 # Zod form validation schemas
│   ├── .env.example
│   └── package.json
└── deploy/                         # Docker Compose configuration
    ├── docker-compose.yml          # Production stack definition
    ├── docker-compose.dev.yml      # Development overrides
    ├── be/                         # Backend Dockerfile
    └── fe/                         # Frontend Dockerfile + Nginx config
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| **Bun** | 1.3+ |
| **Docker & Docker Compose** | Latest stable |
| **Node.js** | 20+ (for tooling only) |

### 1. Clone the repository

```bash
git clone https://github.com/Ngo-Viet-Hoang1/e-commerce.git
cd e-commerce
```

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Update `backend/.env` with your credentials (see [Environment Variables](#environment-variables)).

### 3. Start infrastructure services

```bash
docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.dev.yml up -d postgres redis
```

### 4. Install backend dependencies & run migrations

```bash
cd backend
bun install
bunx prisma migrate dev
bun run seed        # Optional: seed sample data
```

### 5. Start the backend server

```bash
bun run dev
```

Backend is available at: **http://localhost:3000** · API: **http://localhost:3000/api/v1**

### 6. Install frontend dependencies & start dev server

```bash
cd ../frontend
bun install
bun run dev
```

Frontend is available at: **http://localhost:5173**

---

## 🐳 Running the Full Stack with Docker

From the project root, build and start all services:

```bash
docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.dev.yml up --build
```

This starts:

| Service | Description |
|---|---|
| `postgres` | PostgreSQL 16 (production-tuned config) |
| `redis` | Redis 7 (AOF persistence + LRU eviction) |
| `migrator` | One-shot container that runs `prisma migrate deploy` then exits |
| `backend` | Express API on Bun runtime |
| `frontend` | React SPA served via Nginx |

> The `migrator` service runs migrations before the backend starts, preventing race conditions when scaling multiple backend replicas.

---

## ⚙️ Environment Variables

### `backend/.env`

| Variable | Description | Required |
|---|---|---|
| `PORT` | Backend server port (default: `3000`) | ✅ |
| `NODE_ENV` | `development` or `production` | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `REDIS_HOST` | Redis hostname | ✅ |
| `REDIS_PORT` | Redis port (default: `6379`) | ✅ |
| `REDIS_PASSWORD` | Redis authentication password | ✅ |
| `REDIS_DB` | Redis database index (default: `0`) | ✅ |
| `JWT_SECRET` | Secret for signing access tokens | ✅ |
| `JWT_EXPIRES_IN` | Access token TTL (e.g., `1h`) | ✅ |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | ✅ |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (e.g., `7d`) | ✅ |
| `JWT_MFA_SECRET` | Secret for MFA challenge tokens | ⬜ |
| `JWT_MFA_EXPIRES_IN` | MFA token TTL (e.g., `10m`) | ⬜ |
| `VNP_TMN_CODE` | VNPay terminal merchant code | ✅ |
| `VNP_HASH_SECRET` | VNPay hash secret key | ✅ |
| `VNP_URL` | VNPay payment gateway URL | ✅ |
| `VNP_RETURN_URL` | Callback URL after VNPay redirect | ✅ |
| `STREAM_API_KEY` | Stream Chat API key | ⬜ |
| `STREAM_API_SECRET` | Stream Chat API secret | ⬜ |
| `CLIENT_URL` | Frontend base URL (for CORS and redirects) | ✅ |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | ✅ |
| `RATE_LIMIT_MAX` | Max requests per window (default: `100`) | ⬜ |
| `LOG_LEVEL` | Winston log level (`info`, `debug`, `warn`) | ⬜ |

### `frontend/.env`

| Variable | Description | Required |
|---|---|---|
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for image uploads | ✅ |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned upload preset | ✅ |

---

## 🗄️ Database

The project uses Prisma ORM with PostgreSQL. The schema is split into model files under `backend/prisma/models/`.

```bash
# Apply migrations in development (creates migration file)
cd backend
bunx prisma migrate dev

# Apply migrations in production (safe, no dev features)
bunx prisma migrate deploy

# Seed sample data
bun run seed

# Reset database (development only — drops all data)
bun run db:reset

# Open Prisma Studio (visual database browser)
bunx prisma studio
```

---

## 🧰 Useful Scripts

### Backend (`cd backend`)

| Command | Description |
|---|---|
| `bun run dev` | Start with hot-reload (`--watch`) |
| `bun run start` | Start in production mode |
| `bun run lint` | Run ESLint |
| `bun run lint:fix` | Fix auto-fixable lint errors |
| `bun run format` | Format code with Prettier |
| `bun run type-check` | Run TypeScript type checker (`tsc --noEmit`) |
| `bun run seed` | Seed database with sample data |
| `bun run db:reset` | Reset and re-migrate database |

### Frontend (`cd frontend`)

| Command | Description |
|---|---|
| `bun run dev` | Start Vite dev server |
| `bun run build` | Build production bundle |
| `bun run lint` | Run ESLint |
| `bun run preview` | Preview production build locally |

---

## 🔌 API Overview

All endpoints are prefixed with `/api/v1`.

| Group | Endpoints |
|---|---|
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/logout-all`, `POST /auth/refresh-token`, `GET /auth/me` |
| **Admin Auth** | `POST /admin/auth/login`, `POST /admin/auth/logout`, `GET /admin/auth/me` |
| **Products** | `GET/POST /products`, `GET/PUT/DELETE /products/:id` (with variant, image, video sub-resources) |
| **Categories** | Full CRUD `/categories` |
| **Brands** | Full CRUD `/brands` |
| **Badges** | Full CRUD `/badges` |
| **Cart** | `GET/POST/PUT/DELETE /cart` |
| **Orders (User)** | `POST /me/orders`, `GET /me/orders/:id` |
| **Orders (Admin)** | `GET /orders`, `PUT /orders/:id` (status management) |
| **Payments** | `GET /payments`, `GET /payments/:id` |
| **VNPay** | `POST /payments/vnpay/create-url`, `GET /payments/vnpay-return` (webhook) |
| **Invoice** | `GET /invoice/:orderId` (PDF download) |
| **Addresses** | Full CRUD `/addresses` |
| **Provinces/Districts** | `GET /provinces`, `GET /districts` |
| **Chat** | `POST /chat/token` (Stream Chat token), `POST /chat/channel` (create support channel) |
| **Health** | `GET /health` |

---

## 🏗️ Architecture Notes

### Payment Flow

```
User places order
  → Stock reserved (optimistic decrement) + StockReservation created
  → VNPay payment URL generated
  → User redirected to VNPay
  → VNPay calls webhook (GET /payments/vnpay-return)
     → Signature verified
     → Idempotency check (skip if already processed)
     → DB transaction: update order status + commit reservation
  → User redirected to /payment/success or /payment/failed
  
If user does not complete payment:
  → Cron job (node-cron, every minute) scans expired reservations
  → Releases stock and marks order as FAILED
```

### Token Management

- **Access Token**: Short-lived JWT (1h), stateless
- **Refresh Token**: Stored in Redis, consumed on use (rotation), invalidated on logout
- `logout-all` endpoint revokes all tokens for a user across all devices

### Docker Network Architecture

- `internal` network: postgres, redis — **not exposed to host**, backend-only access
- `public` network: backend, frontend (via Nginx)
- Separate `migrator` service ensures migrations run exactly once before backend starts

---

## 📋 Important Notes

- VNPay requires `VNP_TMN_CODE` and `VNP_HASH_SECRET` to be valid credentials from the VNPay merchant portal. Use the sandbox environment for testing.
- Stream Chat features (support chat widget) require valid `STREAM_API_KEY` and `STREAM_API_SECRET`. Without them, the chat endpoints will fail gracefully.
- Cloudinary credentials are required for product image uploads from the admin panel.
- When running via Docker, ensure all required environment variables are passed to the containers via `deploy/.env.docker`.

---

## 🔭 Future Enhancements

| Feature | Status |
|---|---|
| RabbitMQ async email (order confirmation, password reset) | Planned — infrastructure ready |
| Google OAuth login | Schema ready (`googleId` field), endpoint not implemented |
| Two-Factor Authentication (TOTP) | Schema ready (`twoFactorSecret`, `isMfaActive`), endpoint not implemented |
| Stripe payment integration | Constants defined, not yet implemented |
| CI/CD pipeline (GitHub Actions) | Not implemented |
| Automated test suite | Not implemented |

---

## 🤝 Contributing

Contributions are always welcome! Here's how:

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/your-feature-name`
3. Commit following [Conventional Commits](https://www.conventionalcommits.org/): `git commit -m "feat: add feature"`
4. Push to your branch: `git push origin feat/your-feature-name`
5. Open a Pull Request against `main`

---

## 🙏 Acknowledgments

This project was built with the help of these excellent open-source tools and services:

- **[Bun](https://bun.sh)** — Incredibly fast JavaScript runtime and package manager
- **[Vite](https://vitejs.dev)** — Next-generation frontend build tooling
- **[Prisma](https://www.prisma.io)** — Type-safe ORM that makes database work enjoyable
- **[Radix UI](https://www.radix-ui.com)** — Accessible, unstyled UI primitives
- **[TanStack Query](https://tanstack.com/query)** — Powerful asynchronous state management
- **[Stream Chat](https://getstream.io)** — Real-time chat and activity feed infrastructure
- **[VNPay](https://vnpay.vn)** — Vietnamese electronic payment gateway

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Contact

- 🐛 **Found a bug?** Open an [issue](https://github.com/Ngo-Viet-Hoang1/e-commerce/issues)
- 💡 **Have a feature request?** Open a [discussion](https://github.com/Ngo-Viet-Hoang1/e-commerce/discussions)
- 👤 **Author:** [Ngo Viet Hoang](https://github.com/Ngo-Viet-Hoang1)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by [Ngo-Viet-Hoang1](https://github.com/Ngo-Viet-Hoang1)

</div>
