# E-Commerce Platform

<div align="center">

**A production-oriented full-stack e-commerce system built with Express 5, PostgreSQL 16, Prisma 7, Redis 7, and React 19.**

**Live Demo:** [e-commerce-ecru-tau-95.vercel.app](https://e-commerce-ecru-tau-95.vercel.app) · **Source:** [GitHub](https://github.com/Ngo-Viet-Hoang1/e-commerce)

[![Express](https://img.shields.io/badge/Express-5.0-black?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

> **Portfolio project.** This platform demonstrates core retail backend engineering: multi-dimensional product cataloging (SPU/SKU), atomic concurrency control to prevent overselling, strict order state lifecycles, and idempotent payment webhooks.

---

## Table of Contents

- [Live Demo & Test Accounts](#live-demo--test-accounts)
- [Project Structure](#project-structure)
- [Core Engineering Highlights](#core-engineering-highlights)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Engineering Trade-offs](#engineering-trade-offs)

---

## Live Demo & Test Accounts

> **Live Deployment:** [e-commerce-ecru-tau-95.vercel.app](https://e-commerce-ecru-tau-95.vercel.app)

| Role | Email | Password | Access & Testing Flow |
| --- | --- | --- | --- |
| **Admin** | `admin@example.com` | `Admin@123` | Dashboard metrics, product/variant management, order dispatching, PDF invoicing |
| **Customer** | `johndoe@gmail.com` | `Admin@123` | Catalog browsing, multi-attribute selection, cart operations, checkout, 1-hour cancellation |

---

## Project Structure

The project is organized as a monorepo containing decoupled backend and frontend codebases:

```
e-commerce/
├── backend/                  # Express 5 REST API (Modular Architecture)
│   ├── prisma/               # Multi-file Prisma schemas (models, migrations, seeds)
│   └── src/api/v1/
│       ├── modules/          # Domain modules (order, product, payment, cart, auth, user)
│       │                     # Each module encapsulates routes, controllers, services, schemas
│       └── shared/           # Shared utilities (middlewares, database configs, error handlers)
│
├── frontend/                 # React 19 SPA (Feature-Sliced Design)
│   └── src/
│       ├── app/              # Application providers, routers, and global styles
│       ├── pages/            # View pages (catalog, product detail, checkout, admin dashboard)
│       ├── widgets/          # Self-contained UI compositions (header, cart drawer)
│       ├── features/         # User interactions & flows (auth, wishlist, payment)
│       ├── entities/         # Business domain models & UI cards (product, order, brand)
│       └── shared/           # Reusable UI primitives, API Axios clients, and hooks
│
└── deploy/                   # Container orchestration (docker-compose, Nginx configs)
```

---

## Core Engineering Highlights

### 1. Multi-Variant Catalog (SPU/SKU)
- **Separation of Concerns**: Decouples abstract products (`Product`) from purchasable inventory items (`ProductVariant`).
- **Dynamic Attributes**: Variants link to normalized `AttributeValue` entities (e.g., Color: *Titanium*, Storage: *256GB*), enabling independent pricing and stock tracking per SKU without database schema modifications.

### 2. Concurrency Control & Stock Reservation
- **Atomic Conditional Updates**: Prevents overselling under concurrent checkout spikes by pushing validation directly into PostgreSQL's update statement without table-level locks:
  ```typescript
  // Fails fast if remaining stock is insufficient
  await tx.productVariant.updateMany({
    where: { id: variantId, stockQuantity: { gte: quantity }, deletedAt: null },
    data: { stockQuantity: { decrement: quantity } },
  });
  ```
- **15-Minute Stock Hold**: Online checkout holds inventory temporarily (`StockReservation`). A background `node-cron` worker automatically releases expired holds and restores inventory if the payment is abandoned.

### 3. Deterministic Order Lifecycle
- **State Machine Matrix**: Restricts status changes through an authorized transition table (`PENDING` $\rightarrow$ `PROCESSING` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED`).
- **1-Hour Customer Cancellation**: Customers can cancel orders only within 60 minutes of placement.
- **Compensating Rollbacks**: Moving an order to `CANCELLED` executes atomic side-effects inside a database transaction: restoring stock and cascading payment status to `REFUNDED` if already paid.

### 4. Idempotent Payment Webhooks
- **Cryptographic Checksum**: Verifies HMAC-SHA512 signatures on all incoming callbacks from VNPay before inspecting payloads.
- **Deduplication & State Guard**: Enforces database-level unique constraints on `Payment.transactionId` and checks order status, preventing duplicate processing when gateways retry webhooks upon network delays.
- **Self-Healing**: Automatically heals partial failures if a previous callback recorded payment but failed before updating the order status.

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Backend** | Express 5, TypeScript 5.7, Prisma ORM 7, Zod, Winston |
| **Frontend** | React 19, Vite 7, Tailwind CSS, TanStack Query v5, Zustand v5 |
| **Databases** | PostgreSQL 16 (19 relational tables), Redis 7 (carts, token store) |
| **Infrastructure** | Docker Compose, node-cron, Puppeteer (PDF Invoicing) |
| **Third-Party** | VNPay Gateway Sandbox, Cloudinary CDN, Stream Chat |

---

## Quick Start

### Prerequisites
- Node.js (v20+) & npm
- Docker (for PostgreSQL & Redis)

### Setup & Run

```bash
# 1. Clone repository
git clone https://github.com/Ngo-Viet-Hoang1/e-commerce.git
cd e-commerce

# 2. Start PostgreSQL & Redis via Docker
docker run -d --name ecom-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine
docker run -d --name ecom-redis -p 6379:6379 redis:7-alpine

# 3. Setup & start Backend
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma db seed
npm run dev

# 4. Setup & start Frontend (in a new terminal)
cd ../frontend
npm install
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000/api/v1`

---

## Engineering Trade-offs

1. **In-Memory node-cron vs. Distributed Queues**:
   - *Current Design*: Expired holds are scanned via an in-process `node-cron` worker.
   - *Trade-off*: Simple single-instance implementation, but running multiple backend replicas causes redundant database polling. In production, this should be offloaded to **BullMQ / RabbitMQ** with Redis distributed locks.

2. **Redis Cart Consistency**:
   - *Current Design*: Active shopping carts are stored in Redis with a 30-day TTL to minimize relational write I/O.
   - *Trade-off*: Variant price updates made by administrators are not reflected immediately in active carts, but final prices are re-validated against PostgreSQL at checkout.

---

<div align="center">

**Developed by [Ngo Viet Hoang](https://github.com/Ngo-Viet-Hoang1)**

[Live Demo](https://e-commerce-ecru-tau-95.vercel.app) · [Report Bug](https://github.com/Ngo-Viet-Hoang1/e-commerce/issues)

</div>
