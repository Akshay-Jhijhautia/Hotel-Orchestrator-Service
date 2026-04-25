# Hotel Offer Orchestrator

A production-grade hotel offer aggregation service built with **Node.js**, **TypeScript**, **Express**, **Temporal.io**, **Redis**, **Docker**, and **Docker Compose**.

The system calls two mock supplier hotel APIs in parallel, deduplicates hotels by name, selects the cheapest offer for each hotel, caches results in Redis, and supports Redis-native price filtering.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Node.js + TypeScript (strict mode) |
| Framework | Express.js |
| Orchestration | Temporal.io |
| Cache / Store | Redis (Hash + Sorted Set) |
| Infrastructure | Docker + Docker Compose |
| Quality | ESLint, Prettier |
| Security | Helmet, CORS, express-rate-limit |

---

## Architecture

```
Client / Postman
   │
   ▼
Express API (:3000)
   │
   ├── GET /api/hotels ──────► Temporal Client
   │                              │
   │                         hotelOfferWorkflow
   │                              │
   │                    ┌─────────┴──────────┐
   │                    ▼                    ▼
   │             fetchSupplierA       fetchSupplierB
   │                    │                    │
   │                    └─────────┬──────────┘
   │                              ▼
   │                   dedupeAndSelectBest
   │                              │
   │                              ▼
   │                     saveHotelsToRedis
   │                              │
   │                              ▼
   │                           Redis
   │
   ├── GET /supplierA/hotels (mock)
   ├── GET /supplierB/hotels (mock)
   └── GET /health
```

---

## Temporal Workflow

The `hotelOfferWorkflow` is the core orchestration unit:

1. **Fetch suppliers in parallel** — Two activities (`fetchSupplierAHotels`, `fetchSupplierBHotels`) run concurrently via `Promise.all`.
2. **Deduplicate** — The `dedupeAndSelectBestOffers` activity merges both lists, keeping the cheapest offer per hotel name.
3. **Cache to Redis** — The `saveHotelsToRedis` activity writes the deduplicated list to both a Redis Hash (full data) and a Sorted Set (prices).
4. **Return** — The workflow returns the final deduplicated list.

All side effects (HTTP, Redis) happen inside **activities**, keeping the workflow **deterministic** and replayable.

---

## Redis Storage & Filtering

### Two keys per city

| Key | Type | Purpose |
|---|---|---|
| `hotels:{city}:data` | Hash | `field = hotel name`, `value = JSON hotel object` |
| `hotels:{city}:prices` | Sorted Set | `member = hotel name`, `score = price` |

### Price filtering

Price filtering uses **Redis-native commands**, not JavaScript:

```
ZRANGEBYSCORE hotels:delhi:prices 5000 7000  →  returns hotel names in range
HMGET hotels:delhi:data Holtin Radison       →  returns full hotel objects
```

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2+)
- [Node.js](https://nodejs.org/) (v20+) — for local development only
- [Postman](https://www.postman.com/downloads/) — for API testing (optional)

---

## Environment Variables

Copy the example file and modify if needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Express server port |
| `NODE_ENV` | `development` | Environment mode |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `TEMPORAL_ADDRESS` | `localhost:7233` | Temporal server address |
| `TEMPORAL_NAMESPACE` | `default` | Temporal namespace |
| `TEMPORAL_TASK_QUEUE` | `hotel-offer-queue` | Temporal task queue name |
| `SUPPLIER_A_URL` | `http://localhost:3000/supplierA/hotels` | Supplier A endpoint |
| `SUPPLIER_B_URL` | `http://localhost:3000/supplierB/hotels` | Supplier B endpoint |

---

## Docker Compose Setup (Recommended)

### Start all services

```bash
docker-compose up --build
```

This starts 6 containers:

| Service | Port | Description |
|---|---|---|
| `app` | 3000 | Express API server |
| `worker` | — | Temporal worker (no external port) |
| `redis` | 6379 | Redis cache |
| `temporal` | 7233 | Temporal server |
| `temporal-postgres` | 5432 | PostgreSQL for Temporal |
| `temporal-ui` | 8080 | Temporal web dashboard |

### Stop services

```bash
docker-compose down
```

### Stop and clean all data

```bash
docker-compose down -v
```

---

## Local Development Setup

If you prefer running without Docker:

### 1. Install dependencies

```bash
npm install
```

### 2. Start Redis locally

```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### 3. Start Temporal locally

```bash
docker run -d --name temporal \
  -p 7233:7233 \
  temporalio/auto-setup:latest
```

### 4. Start the Express API

```bash
npm run dev
```

### 5. Start the Temporal worker (separate terminal)

```bash
npm run worker
```

---

## API Documentation

### GET /api/hotels

Fetch deduplicated hotel offers for a city.

**Query Parameters:**

| Param | Required | Type | Description |
|---|---|---|---|
| `city` | Yes | string | City name (e.g., `delhi`) |
| `minPrice` | No | number | Minimum price filter |
| `maxPrice` | No | number | Maximum price filter |

**Without price filters** — runs the Temporal workflow:

```bash
curl http://localhost:3000/api/hotels?city=delhi
```

```json
{
  "success": true,
  "data": [
    { "name": "Holtin", "price": 5340, "supplier": "Supplier B", "commissionPct": 20 },
    { "name": "Radison", "price": 5900, "supplier": "Supplier A", "commissionPct": 13 },
    { "name": "Taj Palace", "price": 9000, "supplier": "Supplier A", "commissionPct": 15 },
    { "name": "The Grand", "price": 7200, "supplier": "Supplier B", "commissionPct": 18 }
  ]
}
```

**With price filters** — uses Redis `ZRANGEBYSCORE`:

```bash
curl "http://localhost:3000/api/hotels?city=delhi&minPrice=5000&maxPrice=7000"
```

```json
{
  "success": true,
  "data": [
    { "name": "Holtin", "price": 5340, "supplier": "Supplier B", "commissionPct": 20 },
    { "name": "Radison", "price": 5900, "supplier": "Supplier A", "commissionPct": 13 }
  ]
}
```

---

### GET /supplierA/hotels

Returns mock Supplier A hotel data.

```bash
curl http://localhost:3000/supplierA/hotels?city=delhi
```

---

### GET /supplierB/hotels

Returns mock Supplier B hotel data.

```bash
curl http://localhost:3000/supplierB/hotels?city=delhi
```

---

### GET /health

Returns health status of all services.

```bash
curl http://localhost:3000/health
```

```json
{
  "status": "ok",
  "services": {
    "api": "ok",
    "redis": "ok",
    "supplierA": "ok",
    "supplierB": "ok"
  }
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "error description"
}
```

| Scenario | Status | Message |
|---|---|---|
| Missing city | 400 | `city is required` |
| Invalid minPrice | 400 | `minPrice must be a valid non-negative number` |
| Invalid maxPrice | 400 | `maxPrice must be a valid non-negative number` |
| minPrice > maxPrice | 400 | `minPrice cannot be greater than maxPrice` |
| Unknown route | 404 | `Route not found` |
| Server error | 500 | `Internal Server Error` |

---

## Postman Collection

Import the collection into Postman:

1. Open Postman.
2. Click **Import**.
3. Select the file: `postman/Hotel_Offer_Orchestrator.postman_collection.json`.
4. The collection uses a `{{baseUrl}}` variable defaulting to `http://localhost:3000`.

### Included requests

| # | Request | Expected |
|---|---|---|
| 1 | Health Check | 200 — all services ok |
| 2 | Supplier A — Delhi | 200 — 3 hotels |
| 3 | Supplier B — Delhi | 200 — 3 hotels |
| 4 | Hotels — Valid City | 200 — 4 deduplicated hotels |
| 5 | Hotels — Price Filter | 200 — filtered by range |
| 6 | Hotels — Mumbai | 200 — Mumbai hotels |
| 7 | Hotels — Missing City | 400 — validation error |
| 8 | Hotels — Invalid Price | 400 — validation error |
| 9 | Hotels — Invalid Range | 400 — validation error |

---

## Project Structure

```
hotel-offer-orchestrator/
├── src/
│   ├── app.ts                          # Express app with middleware
│   ├── server.ts                       # HTTP server entry
│   ├── config/
│   │   ├── env.ts                      # Environment config
│   │   └── redis.ts                    # Redis client
│   ├── controllers/
│   │   ├── health.controller.ts        # Health check
│   │   ├── hotel.controller.ts         # Hotel API
│   │   └── supplier.controller.ts      # Supplier mock API
│   ├── middlewares/
│   │   ├── errorHandler.ts             # Centralized error handler
│   │   ├── notFoundHandler.ts          # 404 handler
│   │   └── rateLimiter.ts              # Rate limiter
│   ├── mocks/
│   │   ├── supplierA.mock.ts           # Supplier A data
│   │   └── supplierB.mock.ts           # Supplier B data
│   ├── routes/
│   │   ├── health.routes.ts
│   │   ├── hotel.routes.ts
│   │   └── supplier.routes.ts
│   ├── services/
│   │   ├── hotelDedupe.service.ts      # Dedup algorithm
│   │   ├── hotelWorkflow.service.ts    # Temporal workflow starter
│   │   ├── redisHotelReader.service.ts # Redis read + filtering
│   │   ├── redisHotelWriter.service.ts # Redis write
│   │   └── supplier.service.ts         # Supplier data access
│   ├── temporal/
│   │   ├── activities.ts               # Temporal activities
│   │   ├── client.ts                   # Temporal client
│   │   ├── worker.ts                   # Temporal worker
│   │   └── workflows.ts               # Temporal workflow
│   ├── types/
│   │   ├── hotel.types.ts              # Domain types
│   │   └── response.types.ts           # API response types
│   └── utils/
│       ├── AppError.ts                 # Custom error class
│       ├── apiResponse.ts              # Response helpers
│       ├── asyncHandler.ts             # Async wrapper
│       ├── logger.ts                   # Winston logger
│       └── redisKeys.ts               # Redis key builder
├── postman/
│   └── Hotel_Offer_Orchestrator.postman_collection.json
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── .dockerignore
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

---

## Troubleshooting

### Temporal worker fails to connect

The Temporal server takes 15–30 seconds to initialize. The worker has `restart: on-failure` in Docker Compose, so it will auto-retry. Check logs:

```bash
docker-compose logs worker
```

### Redis connection refused

Ensure Redis is running and the `REDIS_HOST` matches the container name (`redis` in Docker Compose, `localhost` for local development).

```bash
docker-compose logs redis
```

### Port already in use

If port 3000 is occupied:

```bash
# Find the process
lsof -i :3000

# Or change the port in .env
PORT=3001
```

### Temporal UI not loading

Temporal UI runs on port 8080. Ensure no other service is using that port:

```bash
docker-compose logs temporal-ui
```

### Workflow stuck or failed

Check the Temporal Web UI at `http://localhost:8080` to inspect workflow history, activity retries, and error details.

### Clean restart

```bash
docker-compose down -v
docker-compose up --build
```

---

## Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `ts-node-dev src/server.ts` | Start API in dev mode |
| `npm run worker` | `ts-node-dev src/temporal/worker.ts` | Start worker in dev mode |
| `npm run build` | `tsc` | Compile TypeScript |
| `npm start` | `node dist/server.js` | Start compiled API |
| `npm run worker:start` | `node dist/temporal/worker.js` | Start compiled worker |
| `npm run lint` | `eslint src/**/*.ts` | Lint code |
| `npm run format` | `prettier --write src/**/*.ts` | Format code |

---

## License

ISC
