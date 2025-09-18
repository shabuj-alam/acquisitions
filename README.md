# Acquisitions API

A Node.js Express API for acquisitions management with authentication, built with Drizzle ORM and PostgreSQL/Neon Database.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Neon Database account and API key
- Node.js 20+ (for local development without Docker)

### Getting Your Neon Credentials
1. Go to [Neon Console](https://console.neon.tech)
2. Get your **API Key** from Account Settings
3. Get your **Project ID** from Project Settings → General
4. Note your **main branch ID** (usually `main`)

## 🏗️ Docker Development Setup (Recommended)

### 1. Environment Configuration
Copy the development environment template:
```bash
cp .env.development .env
```

Update `.env` with your Neon credentials:
```env
# Neon Local Configuration
NEON_API_KEY=your_neon_api_key_here
NEON_PROJECT_ID=your_neon_project_id_here
PARENT_BRANCH_ID=main

# JWT Configuration
JWT_SECRET=dev-secret-key-change-in-production
```

### 2. Start Development Environment
```bash
# Start with Neon Local (creates ephemeral database branches)
docker-compose -f docker-compose.dev.yml up --build

# Or run in background
docker-compose -f docker-compose.dev.yml up -d --build
```

This will:
- Start **Neon Local** proxy on port 5432
- Create an **ephemeral database branch** automatically
- Start your app on http://localhost:3000 with hot reload
- Clean up the ephemeral branch when stopped

### 3. Database Operations in Development
```bash
# Generate new migrations (after model changes)
docker-compose -f docker-compose.dev.yml exec app npm run db:generate

# Apply migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Open Drizzle Studio
docker-compose -f docker-compose.dev.yml exec app npm run db:studio
```

### 4. Stop Development Environment
```bash
docker-compose -f docker-compose.dev.yml down
```

## 🚢 Production Deployment

### 1. Environment Configuration
Create production environment file:
```bash
cp .env.production .env.prod
```

Update `.env.prod` with production values:
```env
# Database Config - Use your actual Neon Cloud URL
DATABASE_URL=postgresql://neondb_owner:your_password@ep-green-frog-ab3wz40h-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require

# JWT Configuration - Use secure secrets
JWT_SECRET=your_secure_production_jwt_secret_here
JWT_EXPIRES_IN=1h

# Server Config
NODE_ENV=production
LOG_LEVEL=info
```

### 2. Deploy to Production
```bash
# Deploy with production configuration
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app

# Check health
curl http://localhost:3000/health
```

### 3. Production Environment Variables
**⚠️ Important**: In production deployments (AWS, Azure, etc.), set these as environment variables instead of using files:

```bash
export DATABASE_URL="postgresql://..."
export JWT_SECRET="your-secure-secret"
export JWT_EXPIRES_IN="1h"
export NODE_ENV="production"
```

## 📋 Available Commands

### Docker Development Commands
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# Run migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Generate migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:generate

# Open database studio
docker-compose -f docker-compose.dev.yml exec app npm run db:studio

# Run linting
docker-compose -f docker-compose.dev.yml exec app npm run lint

# Format code
docker-compose -f docker-compose.dev.yml exec app npm run format
```

### Production Commands
```bash
# Deploy production
docker-compose -f docker-compose.prod.yml up -d --build

# Scale application
docker-compose -f docker-compose.prod.yml up -d --scale app=3

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Update deployment
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🏛️ Architecture Overview

### Development vs Production Database Setup

#### Development (Neon Local)
- **Neon Local Proxy**: Creates ephemeral PostgreSQL branches
- **Database URL**: `postgres://neon:npg@neon-local:5432/neondb`
- **Benefits**: 
  - Fresh database on each startup
  - No manual cleanup required
  - Isolated development environment
  - Automatic branch creation/deletion

#### Production (Neon Cloud)
- **Neon Cloud**: Direct connection to production database
- **Database URL**: Your actual Neon connection string
- **Benefits**:
  - Production-grade managed PostgreSQL
  - Built-in connection pooling
  - Automatic backups and scaling

### Application Structure
```
src/
├── config/         # Database & logger configuration
├── controllers/    # Request handlers
├── middleware/     # Express middleware
├── models/         # Drizzle ORM models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utilities (JWT, cookies, etc.)
├── validations/    # Zod validation schemas
├── app.js         # Express app setup
├── index.js       # Entry point
└── server.js      # Server startup
```

## 🔧 Local Development (Without Docker)

If you prefer to run without Docker:

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.development .env
# Update .env with your Neon credentials
```

### 3. Start Development Server
```bash
# You'll need to run Neon Local separately
docker run --name neon-local -p 5432:5432 \
  -e NEON_API_KEY=your_key \
  -e NEON_PROJECT_ID=your_project_id \
  -e PARENT_BRANCH_ID=main \
  neondatabase/neon_local:latest

# Then start your app
npm run dev
```

## 📡 API Endpoints

### Health Check
- `GET /health` - Application health status

### Authentication
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login (coming soon)
- `POST /api/auth/sign-out` - User logout (coming soon)

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **JWT**: Secure authentication tokens
- **HTTP-only cookies**: Secure token storage
- **bcrypt**: Password hashing
- **Input validation**: Zod schemas
- **Non-root container**: Production security

## 🔍 Monitoring & Logs

### Development
- **Console logs**: Colorized output
- **File logs**: `logs/combined.log` and `logs/error.log`
- **Request logs**: Morgan middleware

### Production
- **Structured logging**: JSON format
- **Log levels**: Configurable via `LOG_LEVEL`
- **Health checks**: Built-in Docker health checks

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check Neon Local status
   docker-compose -f docker-compose.dev.yml logs neon-local
   
   # Verify environment variables
   docker-compose -f docker-compose.dev.yml exec app env | grep DATABASE_URL
   ```

2. **Port Conflicts**
   ```bash
   # Check what's using port 5432
   netstat -tulpn | grep :5432
   
   # Stop conflicting services
   docker-compose -f docker-compose.dev.yml down
   ```

3. **Migration Issues**
   ```bash
   # Reset database (development only)
   docker-compose -f docker-compose.dev.yml down
   docker-compose -f docker-compose.dev.yml up --build
   ```

4. **Neon Local Configuration**
   - Ensure your `NEON_API_KEY` has sufficient permissions
   - Verify `NEON_PROJECT_ID` is correct
   - Check that `PARENT_BRANCH_ID` exists in your project

### Docker on Windows
If you're using Docker Desktop on Windows:
- Ensure WSL2 backend is enabled
- Make sure line endings are LF (not CRLF)
- Use PowerShell or WSL terminal for commands

## 📚 Additional Resources

- [Neon Documentation](https://neon.com/docs)
- [Neon Local Guide](https://neon.com/docs/local/neon-local)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Express.js Documentation](https://expressjs.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Use the Docker development setup
4. Run tests and linting
5. Submit a pull request

## 📄 License

ISC License - see the LICENSE file for details.