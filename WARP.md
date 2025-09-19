# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Docker Development (Recommended)

```bash
# Start development environment with Neon Local
docker-compose -f docker-compose.dev.yml up --build

# Start in background
docker-compose -f docker-compose.dev.yml up -d --build

# Stop development environment
docker-compose -f docker-compose.dev.yml down

# Run commands inside containers
docker-compose -f docker-compose.dev.yml exec app npm run [command]
```

### Database Operations

```bash
# Generate new migrations after model changes
npm run db:generate
docker-compose -f docker-compose.dev.yml exec app npm run db:generate

# Apply migrations to database
npm run db:migrate
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Open Drizzle Studio for database management
npm run db:studio
docker-compose -f docker-compose.dev.yml exec app npm run db:studio
```

### Code Quality

```bash
# Run ESLint
npm run lint
npm run lint:fix

# Format code with Prettier
npm run format
npm run format:check
```

### Local Development (Non-Docker)

```bash
# Install dependencies
npm install

# Start development server with watch mode
npm run dev

# Start production server
npm start
```

## Architecture Overview

This is a Node.js Express API for acquisitions management built with modern practices and security-first approach.

### Technology Stack

- **Runtime**: Node.js 20+ with ES Modules
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL via Neon Database with Drizzle ORM
- **Authentication**: JWT with HTTP-only cookies
- **Security**: Arcjet (rate limiting, bot detection, security headers)
- **Validation**: Zod schemas
- **Logging**: Winston with structured JSON logging
- **Development**: Docker with Neon Local for ephemeral database branches

### Project Structure

```
src/
├── config/         # Database, logger, and security configuration
├── controllers/    # Request handlers for API endpoints
├── middleware/     # Custom Express middleware (security, auth)
├── models/         # Drizzle ORM database models
├── routes/         # API route definitions
├── services/       # Business logic layer
├── utils/          # Utilities (JWT, cookies, formatting)
├── validations/    # Zod validation schemas
├── app.js          # Express app configuration
├── index.js        # Application entry point
└── server.js       # Server startup logic
```

### Import Aliases

The project uses Node.js import maps for cleaner imports:

- `#src/*` → `./src/*`
- `#config/*` → `./src/config/*`
- `#controllers/*` → `./src/controllers/*`
- `#middleware/*` → `./src/middleware/*`
- `#models/*` → `./src/models/*`
- `#routes/*` → `./src/routes/*`
- `#services/*` → `./src/services/*`
- `#utils/*` → `./src/utils/*`
- `#validations/*` → `./src/validations/*`

### Database Architecture

- **Development**: Uses Neon Local proxy that creates ephemeral PostgreSQL branches
- **Production**: Direct connection to Neon Cloud managed PostgreSQL
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Generated and managed via `drizzle-kit`

### Security Features

- **Arcjet Integration**: Bot detection, rate limiting, and security shield
- **Role-based Rate Limiting**: Different limits for admin (20/min), user (10/min), guest (5/min)
- **JWT Authentication**: Secure tokens stored in HTTP-only cookies
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Zod schemas for all endpoints
- **Security Headers**: Helmet middleware for standard security headers
- **Non-root Container**: Production containers run as non-privileged user

### Authentication Flow

1. User registration/login via `/api/auth/sign-up` and `/api/auth/sign-in`
2. Password validation through Zod schemas
3. bcrypt hashing for secure password storage
4. JWT token generation with user data
5. HTTP-only cookie storage for security
6. Role-based access control (user/admin)

### Environment Configuration

- **Development**: Uses `.env.development` with Neon Local configuration
- **Production**: Uses `.env.production` with actual Neon Cloud URLs
- **Required Variables**:
  - `DATABASE_URL` (Neon connection string)
  - `JWT_SECRET` (secure random string)
  - `NEON_API_KEY` (for development with Neon Local)
  - `NEON_PROJECT_ID` (for development)
  - `ARCJET_KEY` (for security middleware)

### Development vs Production

- **Development**: Ephemeral database branches, hot reload, console logging
- **Production**: Persistent database, structured JSON logging, health checks
- **Docker**: Multi-stage builds with optimized production images

### Code Style Standards

- ES Modules with modern JavaScript features
- ESLint configuration with 2-space indentation, single quotes, semicolons
- Prettier for consistent code formatting
- Error handling with structured logging
- Async/await pattern throughout
- Explicit parameter destructuring
- Arrow functions preferred for callbacks

### Testing and Quality

- ESLint rules enforce consistent code style
- Prettier for automated formatting
- Winston logging with different transports for dev/prod
- Docker health checks for production deployments

### Common Patterns

- Controller → Service → Model architecture
- Validation middleware using Zod schemas
- Consistent error handling with logger integration
- Security middleware applied globally
- JWT utilities for token management
- Cookie utilities for secure token storage
- Database operations use Drizzle ORM with proper error handling
