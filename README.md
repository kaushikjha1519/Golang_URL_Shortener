# URL Shortener Application

A full-stack URL shortener application built with Go (Fiber) backend and React (TypeScript + Vite) frontend, using Redis as the database.

## Prerequisites

- Docker and Docker Compose (for easy setup)
- OR Go 1.19+ and Node.js 18+ (for manual setup)
- Redis (if running manually)

## Quick Start with Docker Compose (Recommended)

1. **Create a `.env` file in the `api` directory** with the following variables:

```env
APP_PORT=:3000
DB_ADDR=db:6379
DB_PASS=
API_QUOTA=30
DOMAIN=http://localhost:3000
```

2. **Build and run all services:**

```bash
docker-compose up --build
```

This will start:
- **API**: http://localhost:3000
- **Redis**: localhost:6379

3. **Run the frontend** (in a separate terminal):

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173 (or the port Vite assigns).

## Manual Setup (Development)

### 1. Start Redis

Make sure Redis is running on `localhost:6379`:

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or using Homebrew (macOS)
brew services start redis
```

### 2. Setup Backend API

1. **Navigate to the API directory:**

```bash
cd api
```

2. **Create a `.env` file** in the `api` directory:

```env
APP_PORT=:3000
DB_ADDR=localhost:6379
DB_PASS=
API_QUOTA=30
DOMAIN=http://localhost:3000
```

3. **Install dependencies:**

```bash
go mod download
```

4. **Run the API:**

```bash
go run main.go
```

The API will be available at http://localhost:3000

### 3. Setup Frontend

1. **Navigate to the frontend directory:**

```bash
cd frontend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create a `.env` file** (optional, defaults to http://localhost:3000):

```env
VITE_API_BASE=http://localhost:3000
```

4. **Run the development server:**

```bash
npm run dev
```

The frontend will be available at http://localhost:5173

## API Endpoints

- **POST** `/api/v1` - Shorten a URL
  ```json
  {
    "url": "https://example.com",
    "short": "custom-id",  // optional
    "expiry": 24  // hours, optional, defaults to 24
  }
  ```

- **GET** `/:url` - Resolve a shortened URL (redirects to original URL)

## Environment Variables

### Backend (`.env` in `api/` directory)

- `APP_PORT` - Port for the API server (e.g., `:3000`)
- `DB_ADDR` - Redis address (e.g., `localhost:6379` or `db:6379` for Docker)
- `DB_PASS` - Redis password (leave empty for local development)
- `API_QUOTA` - Rate limit quota per IP (e.g., `30`)
- `DOMAIN` - Base domain for shortened URLs (e.g., `http://localhost:3000`)

### Frontend (`.env` in `frontend/` directory, optional)

- `VITE_API_BASE` - API base URL (defaults to `http://localhost:3000`)

## Building for Production

### Backend

```bash
cd api
go build -o main .
./main
```

### Frontend

```bash
cd frontend
npm run build
```

The built files will be in the `frontend/dist` directory.

## Project Structure

```
.
├── api/                 # Go backend API
│   ├── database/        # Redis database connection
│   ├── helpers/         # Helper functions
│   ├── routes/          # API route handlers
│   ├── main.go          # Application entry point
│   └── Dockerfile       # Docker image for API
├── db/                  # Redis Docker configuration
├── frontend/            # React frontend
│   ├── src/            # Source files
│   └── dist/           # Built production files
└── docker-compose.yml  # Docker Compose configuration
```

## Troubleshooting

- **Connection refused errors**: Make sure Redis is running and accessible at the configured address
- **CORS errors**: The backend already has CORS configured to allow all origins
- **Port already in use**: Change the `APP_PORT` in the `.env` file or stop the process using that port

