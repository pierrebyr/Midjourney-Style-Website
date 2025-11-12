# Midjourney Style Library - Backend API

Secure Node.js/Express backend with TypeScript, Prisma ORM, and JWT authentication.

## 🚀 Features

- ✅ **Secure Authentication** - JWT tokens with bcrypt password hashing
- ✅ **Database** - Prisma ORM with SQLite (easily swap to PostgreSQL/MySQL)
- ✅ **Rate Limiting** - Protection against brute force and API abuse
- ✅ **Input Validation** - Zod schemas for runtime validation
- ✅ **Error Handling** - Centralized error handling with custom error classes
- ✅ **Gemini AI Proxy** - Secure server-side API calls to Google Gemini
- ✅ **CORS** - Configured for frontend communication
- ✅ **TypeScript** - Full type safety throughout the codebase

## 📦 Prerequisites

- Node.js 18+ (recommended: 20+)
- npm or yarn

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"

# JWT Secret (IMPORTANT: Change this!)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# CORS
CORS_ORIGIN=http://localhost:3000
```

**IMPORTANT**: Generate a strong JWT secret:
```bash
openssl rand -base64 32
```

### 3. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3001`

## 🏗️ Project Structure

```
server/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   └── database.ts        # Prisma client setup
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── gemini.controller.ts
│   │   ├── styles.controller.ts
│   │   ├── collections.controller.ts
│   │   └── users.controller.ts
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication
│   │   ├── errorHandler.ts   # Global error handling
│   │   └── rateLimiter.ts    # Rate limiting
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── gemini.routes.ts
│   │   ├── styles.routes.ts
│   │   ├── collections.routes.ts
│   │   └── users.routes.ts
│   ├── utils/
│   │   ├── jwt.ts             # JWT utilities
│   │   ├── password.ts        # Password hashing
│   │   └── validation.ts      # Zod schemas
│   └── index.ts               # Server entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Styles
- `GET /api/styles` - Get all styles (with filtering/sorting)
- `GET /api/styles/:slug` - Get single style
- `POST /api/styles` - Create style (requires auth)
- `POST /api/styles/:styleId/like` - Toggle like (requires auth)
- `GET /api/styles/:styleId/comments` - Get comments
- `POST /api/styles/:styleId/comments` - Add comment (requires auth)

### Collections
- `GET /api/collections` - Get user's collections (requires auth)
- `GET /api/collections/:id` - Get single collection
- `POST /api/collections` - Create collection (requires auth)
- `PUT /api/collections/:id` - Update collection (requires auth)
- `DELETE /api/collections/:id` - Delete collection (requires auth)
- `POST /api/collections/:id/styles/:styleId` - Add style (requires auth)
- `DELETE /api/collections/:id/styles/:styleId` - Remove style (requires auth)

### Users
- `GET /api/users/leaderboard` - Get top users by likes
- `GET /api/users/:userId` - Get user profile
- `GET /api/users/:userId/styles` - Get user's styles
- `POST /api/users/:userId/follow` - Toggle follow (requires auth)
- `PUT /api/users/me` - Update profile (requires auth)

### Gemini AI
- `POST /api/gemini/parse-prompt` - Parse Midjourney prompt (requires auth)

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Example: Register & Login

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"SecurePass123"}'

# Response:
{
  "message": "User registered successfully",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# Use the token for authenticated requests
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 🗄️ Database

### SQLite (Development)
The default configuration uses SQLite for easy setup. Database file: `prisma/dev.db`

### PostgreSQL (Production)
For production, switch to PostgreSQL:

1. Update `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/midjourney_styles"
```

2. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

3. Run migrations:
```bash
npm run prisma:migrate
```

## 🚦 Rate Limiting

- **General API**: 100 requests / 15 minutes
- **Authentication**: 5 requests / 15 minutes
- **Gemini AI**: 10 requests / minute

## 🔧 Production Deployment

### Build

```bash
npm run build
```

### Start

```bash
npm start
```

### Environment Variables

Ensure these are set in production:
- `NODE_ENV=production`
- Strong `JWT_SECRET`
- Production database URL
- CORS origin set to your frontend domain

### Recommended Services

- **Hosting**: Railway, Render, Heroku, or VPS
- **Database**: Railway PostgreSQL, Supabase, or Neon
- **Monitoring**: Sentry for error tracking

## 🧪 Development

### Watch Mode

```bash
npm run dev  # Auto-restarts on file changes
```

### Database Management

```bash
# View/edit database
npm run prisma:studio

# Create new migration
npm run prisma:migrate

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

## 📝 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## 🔒 Security Best Practices

1. **Never commit `.env` file** - Use `.env.example` as template
2. **Use strong JWT secret** - Generate with `openssl rand -base64 32`
3. **HTTPS in production** - Always use SSL/TLS
4. **Environment variables** - Never hardcode sensitive data
5. **Rate limiting** - Already configured, adjust limits as needed
6. **Input validation** - All inputs are validated with Zod
7. **SQL injection protection** - Prisma ORM provides safety
8. **Password security** - Bcrypt hashing with 10 salt rounds

## 🐛 Troubleshooting

### "Gemini features will not work"
- Check that `GEMINI_API_KEY` is set in `.env`
- Verify the API key is valid at https://makersuite.google.com/app/apikey

### "Database not found"
- Run `npm run prisma:migrate` to create the database

### "CORS error"
- Check that `CORS_ORIGIN` in `.env` matches your frontend URL
- Ensure frontend uses correct API URL

### "Authentication failed"
- Verify JWT token is being sent in Authorization header
- Check token hasn't expired (default: 7 days)

## 📚 Learn More

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [JWT Best Practices](https://jwt.io/introduction)
- [Zod Validation](https://zod.dev/)

## 📄 License

MIT
