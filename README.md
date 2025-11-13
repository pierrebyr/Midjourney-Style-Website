# 🎨 Midjourney Style Library

A full-stack web application for discovering, organizing, and sharing Midjourney style references with **AI-powered prompt parsing**, **3-tier subscription system**, and **secure payment processing**.

![](https://img.shields.io/badge/React-19.0-blue)
![](https://img.shields.io/badge/TypeScript-5.8-blue)
![](https://img.shields.io/badge/Node.js-20%2B-green)
![](https://img.shields.io/badge/Prisma-6.1-2D3748)
![](https://img.shields.io/badge/Express-4.21-lightgrey)
![](https://img.shields.io/badge/Stripe-Latest-blueviolet)

---

## ✨ Features

### 🎯 Core Features
- 🎨 **Browse Styles** - Grid view with search, filtering, and sorting
- 📦 **Collections** - Organize favorites into custom collections
- 🔍 **Advanced Filters** - Filter by aspect ratio, model, stylize, chaos
- 💬 **Comments & Likes** - Engage with the community
- 👥 **User Profiles** - Follow creators and view their work
- 🏆 **Leaderboard** - Top users ranked by total likes
- 🌓 **Dark Mode** - Automatic system preference detection
- 📱 **Responsive** - Mobile-first design

### 🆕 **NEW! Subscription System**
- 💎 **3-Tier Access** - Visitor, Free, Premium
- 💳 **Stripe Integration** - Secure payments with Stripe Checkout
- 📊 **Usage Quotas** - Smart rate limiting per tier
- 🔒 **Premium Content** - Exclusive styles for paid subscribers
- 📈 **Usage Tracking** - Analytics and limits management
- 📧 **Email Notifications** - Subscription updates and alerts

### 🔐 Security & Performance
- ✅ **JWT Authentication** - Secure login with bcrypt password hashing
- ✅ **Rate Limiting** - Multi-tier protection against API abuse
- ✅ **Stripe Webhooks** - Real-time subscription status updates
- ✅ **File Upload** - Secure avatar and image uploads (5MB-50MB)
- ✅ **Email Verification** - Optional email confirmation
- ✅ **2FA Ready** - Two-factor authentication infrastructure
- ✅ **Input Validation** - Zod schemas on all endpoints
- ✅ **Error Handling** - Centralized logging with Winston
- ✅ **SQL Injection Protection** - Prisma ORM parameterized queries

---

## 💎 Subscription Tiers

| Feature | 🔓 Visitor | 🔑 Free (Registered) | 💎 Premium |
|---------|-----------|---------------------|-----------|
| **Browse Styles** | 5 styles | 20 styles | ✅ Unlimited |
| **Create Styles** | ❌ | 5 per month | ✅ Unlimited |
| **Upload Size** | ❌ | 5MB | 50MB |
| **Collections** | ❌ | 10 max | ✅ Unlimited |
| **Premium Content** | ❌ | ❌ | ✅ Full Access |
| **Priority Support** | ❌ | ❌ | ✅ |
| **Early Features** | ❌ | ❌ | ✅ |
| **Price** | Free | Free | **$9.99/mo** or **$99.99/yr** |

---

## 🚀 Local Installation Guide

### Prerequisites

Before you begin, ensure you have:
- ✅ **Node.js 20+** ([Download](https://nodejs.org/))
- ✅ **npm** or **yarn**
- ✅ **Git**
- ✅ **Stripe Account** (for payments - [Sign Up](https://dashboard.stripe.com/register))
- ⚙️ **SMTP Email** (optional, for emails - Gmail works)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/pierrebyr/Midjourney-Style-Website.git
cd Midjourney-Style-Website
```

---

### Step 2: Backend Setup

#### 2.1 Install Dependencies

```bash
cd server
npm install
```

#### 2.2 Configure Environment Variables

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `server/.env` with your actual values:

```env
# ======================
# SERVER CONFIGURATION
# ======================
PORT=3001
NODE_ENV=development

# ======================
# DATABASE
# ======================
DATABASE_URL="file:./dev.db"

# ======================
# JWT AUTHENTICATION (REQUIRED)
# ======================
# Generate a strong secret: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-CHANGE-THIS-IN-PRODUCTION
JWT_EXPIRES_IN=7d

# ======================
# GEMINI AI API (REQUIRED for prompt parsing)
# ======================
# Get your key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# ======================
# STRIPE (REQUIRED for payments)
# ======================
# Get these from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_51xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Create products in Stripe Dashboard, then paste Price IDs here
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_xxxxx

# ======================
# CORS (Frontend URL)
# ======================
CORS_ORIGIN=http://localhost:3000

# ======================
# FILE UPLOAD
# ======================
UPLOAD_DIR=uploads
MAX_FILE_SIZE=52428800

# ======================
# EMAIL (OPTIONAL - for notifications)
# ======================
# For Gmail: Use App Password (https://support.google.com/accounts/answer/185833)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@midjourney-library.com
EMAIL_FROM_NAME=Midjourney Style Library

# ======================
# URLS (for emails & webhooks)
# ======================
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001

# ======================
# RATE LIMITING
# ======================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ======================
# FEATURES (Optional)
# ======================
ENABLE_2FA=false
ENABLE_EMAIL_VERIFICATION=false
```

#### 2.3 Setup Stripe (for Payments)

**Important:** You need Stripe configured for subscriptions to work.

1. **Create Stripe Account**
   - Go to https://dashboard.stripe.com/register
   - Use **Test Mode** for development (toggle in dashboard)

2. **Get API Keys**
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy **Secret key** → `STRIPE_SECRET_KEY`
   - Copy **Publishable key** → `STRIPE_PUBLISHABLE_KEY`

3. **Create Products**
   - Go to https://dashboard.stripe.com/test/products
   - Click **+ Add Product**

   **Product 1: Premium Monthly**
   - Name: `Premium Monthly`
   - Price: `$9.99`
   - Billing: `Recurring` → `Monthly`
   - Click **Save** → Copy the **Price ID** (starts with `price_`)
   - Paste into `STRIPE_PREMIUM_MONTHLY_PRICE_ID`

   **Product 2: Premium Yearly**
   - Name: `Premium Yearly`
   - Price: `$99.99`
   - Billing: `Recurring` → `Yearly`
   - Click **Save** → Copy the **Price ID**
   - Paste into `STRIPE_PREMIUM_YEARLY_PRICE_ID`

4. **Setup Webhook (for production)**
   - Go to https://dashboard.stripe.com/test/webhooks
   - Click **+ Add endpoint**
   - URL: `http://localhost:3001/api/webhooks/stripe` (or your production URL)
   - Events to listen:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

#### 2.4 Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate

# Optional: View database in browser
npm run prisma:studio
```

**Note:** The first migration will create all tables including:
- User (with subscription fields)
- Style (with premium flags)
- SubscriptionHistory
- Payment
- UsageLog

#### 2.5 Start Backend Server

```bash
npm run dev
```

✅ Backend should now be running on **http://localhost:3001**

Check the health endpoint: http://localhost:3001/health

---

### Step 3: Frontend Setup

Open a **new terminal** window:

#### 3.1 Install Dependencies

```bash
# From project root (not server folder)
cd ..
npm install
```

#### 3.2 Configure Environment (Optional)

Frontend works with defaults, but you can customize:

```bash
cp .env.example .env.local
```

Edit `.env.local` if needed:

```env
# Backend API URL
VITE_API_URL=http://localhost:3001/api
```

#### 3.3 Start Frontend

```bash
npm run dev
```

✅ Frontend should now be running on **http://localhost:3000**

---

### Step 4: Test the Application

1. **Open browser** → http://localhost:3000
2. **Register a new account** → Click "Register"
3. **You'll be a FREE user** by default
4. **Test creating a style** (limited to 5/month)
5. **Test upgrade flow**:
   - Click "Upgrade to Premium" button
   - Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
6. **After payment**, you should have **Premium access**!

---

## 📁 Project Structure

```
Midjourney-Style-Website/
├── server/                           # Backend (Node.js/Express)
│   ├── prisma/
│   │   └── schema.prisma             # Database schema with subscriptions
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts           # Prisma client
│   │   │   ├── stripe.ts             # 🆕 Stripe configuration
│   │   │   └── upload.ts             # 🆕 File upload config
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts    # Auth endpoints
│   │   │   ├── styles.controller.ts  # Styles with permissions
│   │   │   ├── users.controller.ts   # User management
│   │   │   └── collections.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT verification
│   │   │   ├── errorHandler.ts       # Error handling with Winston
│   │   │   └── rateLimiter.ts        # Multi-tier rate limiting
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── styles.routes.ts
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── email.service.ts      # 🆕 Email notifications
│   │   ├── utils/
│   │   │   ├── jwt.ts                # JWT helpers
│   │   │   ├── password.ts           # Bcrypt helpers
│   │   │   ├── validation.ts         # Zod schemas
│   │   │   ├── logger.ts             # Winston logger
│   │   │   └── permissions.ts        # 🆕 Permission & quota system
│   │   └── index.ts                  # Server entry
│   └── uploads/                      # 🆕 Uploaded files (avatars, images)
│
├── components/                       # React components
├── context/                          # React contexts
│   ├── AuthContext.tsx               # Auth + subscription state
│   └── StyleContext.tsx              # Styles management
├── pages/                            # Route pages
├── services/
│   └── api.ts                        # API client with retry logic
├── hooks/                            # Custom hooks
├── utils/                            # Frontend utilities
└── types.ts                          # TypeScript interfaces
```

---

## 🛠️ Development

### Running Both Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Database Management

```bash
cd server

# View database in browser (Prisma Studio)
npm run prisma:studio

# Create a new migration after schema changes
npm run prisma:migrate dev --name your_migration_name

# Reset database (WARNING: Deletes all data!)
npx prisma migrate reset

# Seed database with test data
npx prisma db seed
```

### Testing Stripe Locally

Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to test webhooks:

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Windows: scoop install stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Copy the webhook signing secret to .env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

Test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

---

## 📡 API Documentation

### Authentication Endpoints

```http
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login
GET    /api/auth/me                # Get current user (with subscription info)
POST   /api/auth/logout            # Logout (client-side)
```

### Subscription Endpoints (🆕)

```http
GET    /api/subscription/plans     # Get available plans
GET    /api/subscription/current   # Get current subscription
POST   /api/subscription/checkout  # Create Stripe checkout session
POST   /api/subscription/portal    # Get Stripe customer portal URL
POST   /api/subscription/cancel    # Cancel subscription
GET    /api/subscription/history   # Subscription history
```

### Payment Endpoints (🆕)

```http
GET    /api/payments               # User payment history
GET    /api/payments/:id           # Payment details
POST   /api/webhooks/stripe        # Stripe webhook handler
```

### Styles Endpoints (Updated with Permissions)

```http
GET    /api/styles                 # List styles (filtered by tier)
GET    /api/styles/:slug           # Get single style (permission check)
POST   /api/styles                 # Create style (quota check)
POST   /api/styles/:id/like        # Toggle like
GET    /api/styles/:id/comments    # Get comments
POST   /api/styles/:id/comments    # Add comment
```

### Upload Endpoints (🆕)

```http
POST   /api/upload/avatar          # Upload avatar (5MB FREE, 50MB PREMIUM)
POST   /api/upload/image           # Upload image
DELETE /api/upload/:fileId         # Delete file
```

### Example: Create Checkout Session

```bash
curl -X POST http://localhost:3001/api/subscription/checkout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_xxxxx",
    "successUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/cancel"
  }'
```

---

## 🔧 Tech Stack

### Frontend
- **React 19.0** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router 7** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **React Query** - Server state management

### Backend
- **Node.js / Express** - Server framework
- **TypeScript** - Type safety
- **Prisma 6.1** - ORM (SQLite/PostgreSQL)
- **Stripe** - Payment processing
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Winston** - Logging
- **Nodemailer** - Email service
- **Multer + Sharp** - File upload & processing
- **Zod** - Runtime validation
- **Google Gemini AI** - Prompt parsing

---

## 📝 Environment Variables Reference

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `JWT_SECRET` | JWT signing key | Generate: `openssl rand -base64 32` |
| `GEMINI_API_KEY` | Gemini AI API key | https://makersuite.google.com/app/apikey |
| `STRIPE_SECRET_KEY` | Stripe secret key | https://dashboard.stripe.com/apikeys |
| `STRIPE_PREMIUM_MONTHLY_PRICE_ID` | Monthly plan price ID | Create product in Stripe |
| `STRIPE_PREMIUM_YEARLY_PRICE_ID` | Yearly plan price ID | Create product in Stripe |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend port |
| `DATABASE_URL` | `file:./dev.db` | Database connection |
| `CORS_ORIGIN` | `http://localhost:3000` | Frontend URL |
| `SMTP_HOST` | - | Email server (optional) |
| `UPLOAD_DIR` | `uploads` | Upload directory |

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Cannot connect to backend"
- ✅ Ensure backend is running on port 3001
- ✅ Check `VITE_API_URL` in frontend `.env.local`
- ✅ Verify CORS settings in `server/.env`
- ✅ Test health endpoint: http://localhost:3001/health

#### 2. "Prisma migration errors"
```bash
# Reset database and re-run migrations
cd server
npx prisma migrate reset
npm run prisma:generate
npm run prisma:migrate
```

#### 3. "Stripe checkout not working"
- ✅ Check `STRIPE_SECRET_KEY` is set in `server/.env`
- ✅ Verify you're using **test mode** keys (start with `sk_test_`)
- ✅ Ensure price IDs are correct (`STRIPE_PREMIUM_MONTHLY_PRICE_ID`)
- ✅ Check browser console for errors

#### 4. "Webhooks not firing (local)"
- Use Stripe CLI to forward webhooks:
  ```bash
  stripe listen --forward-to localhost:3001/api/webhooks/stripe
  ```
- Copy the webhook secret to `.env`

#### 5. "Email not sending"
- Emails are **logged to console** in development if SMTP is not configured
- For Gmail: Create an [App Password](https://support.google.com/accounts/answer/185833)
- For testing: Use [Mailtrap.io](https://mailtrap.io)

#### 6. "File upload fails"
- ✅ Check `UPLOAD_DIR` exists (created automatically)
- ✅ Verify file size limits (5MB FREE, 50MB PREMIUM)
- ✅ Check file type (only images allowed)

#### 7. "Permission denied errors"
- ✅ Ensure user is authenticated (JWT token present)
- ✅ Check subscription tier and status
- ✅ Verify quotas not exceeded (5 creations/month for FREE)

---

## 📊 Database Schema

Key models:

- **User** - Extended with subscription fields, preferences, security
- **Style** - With visibility and premium flags
- **SubscriptionHistory** - Track subscription changes
- **Payment** - Payment records with Stripe IDs
- **UsageLog** - Track actions for quotas

View full schema: `server/prisma/schema.prisma`

---

## 🚀 Production Deployment

### Backend (Railway/Render)

1. **Create PostgreSQL database**
2. **Set environment variables** (all from `.env`)
3. **Run migrations**: `npx prisma migrate deploy`
4. **Deploy**: `npm run build && npm start`

### Frontend (Vercel/Netlify)

1. **Set `VITE_API_URL`** to your backend URL
2. **Build**: `npm run build`
3. **Deploy `dist/` folder**

### Stripe Production

1. Switch to **Live Mode** in Stripe Dashboard
2. Update `.env` with **live keys** (`sk_live_`, `pk_live_`)
3. Create **live products** and update price IDs
4. Configure **live webhook** endpoint

---

## 📄 License

MIT License

---

## 🙏 Acknowledgments

- [Stripe](https://stripe.com) - Payment infrastructure
- [Prisma](https://prisma.io) - Database toolkit
- [Google Gemini AI](https://ai.google.dev/) - AI-powered features
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Heroicons](https://heroicons.com/) - Icons

---

## 📞 Support

- 📧 **Email**: support@midjourney-library.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/pierrebyr/Midjourney-Style-Website/issues)
- 📚 **Documentation**: [Wiki](https://github.com/pierrebyr/Midjourney-Style-Website/wiki)

---

**⭐ If you found this helpful, please star the repo!**

**🎨 Built with ❤️ for the Midjourney community**
