# 🎨 Midjourney Style Library

A full-stack web application for discovering, organizing, and sharing Midjourney style references with AI-powered prompt parsing.

![](https://img.shields.io/badge/React-19.0-blue)
![](https://img.shields.io/badge/TypeScript-5.8-blue)
![](https://img.shields.io/badge/Node.js-20%2B-green)
![](https://img.shields.io/badge/Prisma-6.1-2D3748)
![](https://img.shields.io/badge/Express-4.21-lightgrey)

## ✨ Features

### Frontend
- 🎨 **Browse Styles** - Grid view with search, filtering, and sorting
- 📦 **Collections** - Organize favorites into custom collections
- 🔍 **Advanced Filters** - Filter by aspect ratio, model, stylize, chaos
- 💬 **Comments** - Discuss and share feedback on styles
- ❤️ **Likes & Views** - Track popular styles
- 👥 **User Profiles** - Follow creators and view their work
- 🏆 **Leaderboard** - Top users ranked by total likes
- 🌓 **Dark Mode** - Automatic system preference detection
- 📱 **Responsive** - Mobile-first design

### Backend ✅ **NOW SECURE!**
- 🔐 **JWT Authentication** - Secure login with bcrypt password hashing
- 🛡️ **Rate Limiting** - Protection against API abuse
- 🤖 **Gemini AI Proxy** - Server-side AI prompt parsing
- 📊 **Prisma ORM** - Type-safe database queries
- ✅ **Input Validation** - Zod schemas for all endpoints
- 🚨 **Error Handling** - Centralized error management
- 📦 **SQLite/PostgreSQL** - Easy development, production-ready

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ ([Download](https://nodejs.org/))
- npm or yarn
- Git

### 1. Clone Repository

```bash
git clone https://github.com/pierrebyr/Midjourney-Style-Website.git
cd Midjourney-Style-Website
```

### 2. Setup Backend

```bash
cd server

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Edit .env and add your credentials:
# - JWT_SECRET (generate with: openssl rand -base64 32)
# - GEMINI_API_KEY (get from https://makersuite.google.com/app/apikey)

# Setup database
npm run prisma:generate
npm run prisma:migrate

# Start backend server
npm run dev
```

Backend will run on **http://localhost:3001**

### 3. Setup Frontend (New Terminal)

```bash
# From project root
npm install

# Setup environment (optional - uses defaults)
cp .env.example .env.local

# Start frontend
npm run dev
```

Frontend will run on **http://localhost:3000**

## 📁 Project Structure

```
Midjourney-Style-Website/
├── server/                    # Backend (Node.js/Express)
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth, rate limiting, errors
│   │   ├── routes/            # API routes
│   │   ├── utils/             # JWT, validation, password
│   │   └── index.ts           # Server entry
│   ├── package.json
│   └── README.md              # Backend documentation
│
├── components/                # React components
├── context/                   # React contexts (Auth, Styles)
├── pages/                     # Route pages
├── services/                  # API client, Gemini (deprecated)
│   └── api.ts                 # ✨ NEW: Backend API client
├── hooks/                     # Custom hooks (useDarkMode, useDebounce)
├── utils/                     # Validation, error handling
├── data/                      # Mock data (for initial seeding)
├── types.ts                   # TypeScript interfaces
└── README.md                  # This file
```

## 🔐 Security Features

### ✅ Implemented (NEW!)
- [x] **Bcrypt Password Hashing** - 10 salt rounds, industry standard
- [x] **JWT Authentication** - Secure, stateless sessions
- [x] **API Key Protection** - Gemini key never exposed to client
- [x] **Rate Limiting** - Prevents brute force and API abuse
- [x] **Input Validation** - Zod schemas on all endpoints
- [x] **SQL Injection Protection** - Prisma ORM parameterized queries
- [x] **CORS Configuration** - Restricts cross-origin requests
- [x] **Error Handling** - Doesn't leak sensitive information
- [x] **XSS Prevention** - Input sanitization
- [x] **Helmet Security Headers** - HTTP security headers

## 🛠️ Development

### Run Both Servers

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Database Management

```bash
cd server

# View database
npm run prisma:studio

# Create migration
npm run prisma:migrate

# Reset database (WARNING: Deletes data!)
npx prisma migrate reset
```

## 📡 API Documentation

Full API documentation available in [`server/README.md`](server/README.md)

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

#### Styles
- `GET /api/styles` - List all styles
- `POST /api/styles` - Create style (auth required)
- `POST /api/styles/:id/like` - Toggle like (auth required)

#### Collections
- `GET /api/collections` - Get user collections (auth required)
- `POST /api/collections` - Create collection (auth required)

#### Gemini AI
- `POST /api/gemini/parse-prompt` - Parse Midjourney prompt (auth required)

**Example:**
```bash
curl -X POST http://localhost:3001/api/gemini/parse-prompt \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"a dog --ar 16:9 --sref 123 --stylize 250"}'
```

## 🚀 Production Deployment

### Backend

1. **Choose a hosting service:**
   - Railway (recommended - free tier)
   - Render
   - Heroku
   - VPS (DigitalOcean, Linode)

2. **Database:**
   - Railway PostgreSQL (free)
   - Supabase
   - Neon

3. **Environment variables:**
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   JWT_SECRET=<strong-secret-32-chars>
   GEMINI_API_KEY=<your-key>
   CORS_ORIGIN=https://yourdomain.com
   ```

4. **Deploy:**
   ```bash
   cd server
   npm run build
   npm start
   ```

### Frontend

1. **Choose a hosting service:**
   - Vercel (recommended - free)
   - Netlify
   - Cloudflare Pages

2. **Environment variables:**
   ```env
   VITE_API_URL=https://your-backend.railway.app/api
   ```

3. **Build:**
   ```bash
   npm run build
   ```

4. **Deploy `dist/` folder**

## 🔧 Tech Stack

### Frontend
- **React 19.0** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router 7** - Routing
- **Tailwind CSS** - Styling (build-time)

### Backend
- **Node.js / Express** - Server framework
- **TypeScript** - Type safety
- **Prisma** - ORM (SQLite/PostgreSQL)
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Zod** - Runtime validation
- **Google Gemini AI** - Prompt parsing

## 📝 Scripts

### Root (Frontend)
- `npm run dev` - Start frontend dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Server (Backend)
- `npm run dev` - Start backend dev server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run prisma:studio` - Open database GUI

## 🐛 Troubleshooting

### "Cannot connect to backend"
- Ensure backend is running on port 3001
- Check `VITE_API_URL` in frontend `.env.local`
- Verify CORS settings in `server/.env`

### "Gemini API not working"
- Check `GEMINI_API_KEY` in `server/.env`
- Verify key at https://makersuite.google.com/app/apikey
- Check rate limits (10 req/min)

### "Database errors"
- Run `cd server && npm run prisma:migrate`
- Check `DATABASE_URL` in `server/.env`

### "CORS errors"
- Backend `CORS_ORIGIN` must match frontend URL
- Include credentials: `credentials: true` in fetch

## 📄 License

MIT License

## 🙏 Acknowledgments

- Built with [Google AI Studio](https://aistudio.google.com)
- Powered by [Google Gemini AI](https://ai.google.dev/)
- Icons from [Heroicons](https://heroicons.com/)
- Avatars from [Pravatar](https://pravatar.cc/)

---

**⭐ Star this repo if you found it helpful!**

View this app in AI Studio: https://ai.studio/apps/drive/1vnFDb2qsvAYeBPmevIPaAErv5pCdflk9
