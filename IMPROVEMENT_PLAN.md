# 🚀 Plan d'Amélioration - User Management & Subscription System

## 📋 Vue d'ensemble

### Objectifs
1. **Amélioration du système utilisateur** - Profil complet avec avatar upload
2. **Système de permissions par niveau** - Accès différencié selon authentification
3. **Système d'abonnement payant** - Monétisation avec Stripe

### Niveaux d'accès
- 🔓 **Visiteur** (non connecté) - Accès limité (ex: 5 styles)
- 🔑 **Utilisateur gratuit** (connecté) - Accès moyen (ex: 20 styles + création limitée)
- 💎 **Utilisateur Premium** (abonné payant) - Accès illimité

---

## 🗄️ PARTIE 1 : BASE DE DONNÉES (Prisma Schema)

### 1.1 Modifications du modèle `User`

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String   // Hashed with bcrypt

  // ✅ EXISTANT
  avatar    String?
  bio       String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 🆕 NOUVEAU - Informations personnelles
  firstName      String?
  lastName       String?
  dateOfBirth    DateTime?
  phone          String?
  country        String?
  city           String?
  timezone       String?       @default("UTC")
  language       String?       @default("en")

  // 🆕 NOUVEAU - Avatar local (upload)
  avatarPath     String?       // Chemin fichier local
  avatarMimeType String?       // image/jpeg, image/png, etc.
  avatarSize     Int?          // Taille en bytes

  // 🆕 NOUVEAU - Subscription
  subscriptionTier       SubscriptionTier @default(FREE)
  subscriptionStatus     SubscriptionStatus @default(INACTIVE)
  subscriptionStartDate  DateTime?
  subscriptionEndDate    DateTime?
  stripeCustomerId       String?   @unique
  stripeSubscriptionId   String?   @unique

  // 🆕 NOUVEAU - Preferences
  emailNotifications     Boolean   @default(true)
  marketingEmails        Boolean   @default(false)
  showEmail              Boolean   @default(false)
  showDateOfBirth        Boolean   @default(false)
  profileVisibility      ProfileVisibility @default(PUBLIC)

  // 🆕 NOUVEAU - Security
  lastPasswordChange     DateTime?
  passwordResetToken     String?
  passwordResetExpires   DateTime?
  emailVerified          Boolean   @default(false)
  emailVerificationToken String?
  twoFactorEnabled       Boolean   @default(false)
  twoFactorSecret        String?

  // 🆕 NOUVEAU - Usage tracking
  stylesCreatedCount     Int       @default(0)
  lastLoginAt            DateTime?
  loginCount             Int       @default(0)

  // Relations (existantes)
  styles      Style[]
  collections Collection[]
  comments    Comment[]
  likes       Like[]
  followers   Follow[] @relation("UserFollowers")
  following   Follow[] @relation("UserFollowing")

  // 🆕 NOUVEAU - Relations
  subscriptionHistory SubscriptionHistory[]
  payments            Payment[]
  usageLog            UsageLog[]

  @@index([email])
  @@index([subscriptionTier, subscriptionStatus])
}
```

### 1.2 Nouveaux Enums

```prisma
enum SubscriptionTier {
  FREE      // Utilisateur gratuit
  PREMIUM   // Abonnement payant
  LIFETIME  // Accès à vie (si promo)
}

enum SubscriptionStatus {
  INACTIVE   // Pas d'abonnement actif
  ACTIVE     // Abonnement actif
  PAST_DUE   // Paiement en retard
  CANCELED   // Annulé
  TRIALING   // En période d'essai
}

enum ProfileVisibility {
  PUBLIC     // Visible par tous
  PRIVATE    // Visible uniquement par l'utilisateur
  FOLLOWERS  // Visible par les followers
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
}

enum UsageLogAction {
  VIEW_STYLE
  CREATE_STYLE
  LIKE_STYLE
  COMMENT
  DOWNLOAD
}
```

### 1.3 Nouveaux Modèles

```prisma
// Historique des abonnements
model SubscriptionHistory {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  tier        SubscriptionTier
  status      SubscriptionStatus
  startDate   DateTime
  endDate     DateTime?

  amount      Float?
  currency    String?  @default("usd")

  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([userId, createdAt])
}

// Paiements
model Payment {
  id                String        @id @default(uuid())
  userId            String
  user              User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  amount            Float
  currency          String        @default("usd")
  status            PaymentStatus @default(PENDING)

  stripePaymentId   String?       @unique
  stripeInvoiceId   String?

  description       String?
  metadata          String?       // JSON

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

// Log d'utilisation (pour limiter les actions)
model UsageLog {
  id        String          @id @default(uuid())
  userId    String?
  user      User?           @relation(fields: [userId], references: [id], onDelete: Cascade)

  action    UsageLogAction
  resourceId String?        // Style ID, Collection ID, etc.
  ipAddress  String?
  userAgent  String?

  createdAt DateTime        @default(now())

  @@index([userId, action, createdAt])
  @@index([ipAddress, action, createdAt])
}
```

### 1.4 Modifications du modèle `Style`

```prisma
model Style {
  // ... existant ...

  // 🆕 NOUVEAU - Gestion des permissions
  visibility        StyleVisibility @default(PUBLIC)
  isPremiumOnly     Boolean         @default(false)
  previewImageUrl   String?         // Image preview pour non-abonnés

  // ... reste inchangé ...

  @@index([isPremiumOnly, visibility])
}

enum StyleVisibility {
  PUBLIC      // Visible par tous (selon tier)
  PRIVATE     // Visible uniquement par le créateur
  UNLISTED    // Visible uniquement avec le lien
}
```

---

## 🔧 PARTIE 2 : BACKEND (API & Controllers)

### 2.1 Nouveaux fichiers à créer

```
server/src/
├── config/
│   ├── stripe.ts                    # 🆕 Configuration Stripe
│   └── upload.ts                    # 🆕 Configuration Multer/Upload
├── controllers/
│   ├── subscription.controller.ts   # 🆕 Gestion abonnements
│   ├── payment.controller.ts        # 🆕 Gestion paiements
│   └── upload.controller.ts         # 🆕 Upload fichiers
├── middleware/
│   ├── subscription.ts              # 🆕 Vérification abonnement
│   ├── rateLimit.ts                 # 🆕 Rate limiting par tier
│   └── upload.ts                    # 🆕 Middleware upload
├── routes/
│   ├── subscription.routes.ts       # 🆕 Routes abonnements
│   ├── payment.routes.ts            # 🆕 Routes paiements
│   └── upload.routes.ts             # 🆕 Routes upload
├── services/
│   ├── stripe.service.ts            # 🆕 Service Stripe
│   ├── email.service.ts             # 🆕 Service email (notifications)
│   └── storage.service.ts           # 🆕 Service stockage fichiers
└── utils/
    ├── permissions.ts               # 🆕 Vérification permissions
    └── fileValidation.ts            # 🆕 Validation fichiers
```

### 2.2 Endpoints à créer/modifier

#### **Auth & User Management**

```typescript
// 🆕 NOUVEAUX
POST   /api/auth/verify-email              // Vérification email
POST   /api/auth/resend-verification       // Renvoyer email vérification
POST   /api/auth/forgot-password           // Mot de passe oublié
POST   /api/auth/reset-password            // Réinitialiser mot de passe
POST   /api/auth/change-password           // Changer mot de passe (authentifié)

// 🆕 NOUVEAUX - 2FA
POST   /api/auth/2fa/enable                // Activer 2FA
POST   /api/auth/2fa/disable               // Désactiver 2FA
POST   /api/auth/2fa/verify                // Vérifier code 2FA

// ✏️ MODIFIÉS
PUT    /api/users/me                       // Modifier profil (+ nouveaux champs)
PUT    /api/users/me/avatar                // Upload avatar
DELETE /api/users/me/avatar                // Supprimer avatar
GET    /api/users/me/settings              // Récupérer settings
PUT    /api/users/me/settings              // Modifier settings
PUT    /api/users/me/privacy               // Modifier paramètres vie privée
GET    /api/users/me/usage                 // Statistiques d'utilisation
DELETE /api/users/me                       // Supprimer compte
```

#### **Subscription & Payment**

```typescript
// 🆕 NOUVEAUX - Subscription
GET    /api/subscription/plans             // Liste des plans
GET    /api/subscription/current           // Abonnement actuel
POST   /api/subscription/checkout          // Créer session checkout Stripe
POST   /api/subscription/portal            // Lien portail client Stripe
POST   /api/subscription/cancel            // Annuler abonnement
GET    /api/subscription/history           // Historique abonnements

// 🆕 NOUVEAUX - Payment
GET    /api/payments                       // Liste paiements utilisateur
GET    /api/payments/:id                   // Détails paiement
POST   /api/webhooks/stripe                // Webhook Stripe (events)
```

#### **Styles (Modifiés pour permissions)**

```typescript
// ✏️ MODIFIÉS
GET    /api/styles                         // + filtrage selon tier utilisateur
GET    /api/styles/:slug                   // + vérification permissions
POST   /api/styles                         // + vérification quota
PUT    /api/styles/:id/visibility          // 🆕 Changer visibilité
```

#### **Upload**

```typescript
// 🆕 NOUVEAUX
POST   /api/upload/avatar                  // Upload avatar
POST   /api/upload/image                   // Upload image générique
DELETE /api/upload/:fileId                 // Supprimer fichier
```

---

## 🎨 PARTIE 3 : FRONTEND

### 3.1 Nouvelles pages à créer

```
pages/
├── SettingsPage.tsx                  # 🆕 Page paramètres principale
├── AccountSettingsPage.tsx           # 🆕 Infos compte
├── PrivacySettingsPage.tsx           # 🆕 Paramètres vie privée
├── SecuritySettingsPage.tsx          # 🆕 Sécurité (mot de passe, 2FA)
├── SubscriptionPage.tsx              # 🆕 Gestion abonnement
├── BillingPage.tsx                   # 🆕 Historique paiements
├── PricingPage.tsx                   # 🆕 Page tarifs
└── EmailVerificationPage.tsx         # 🆕 Vérification email
```

### 3.2 Nouveaux composants

```
components/
├── settings/
│   ├── SettingsLayout.tsx            # 🆕 Layout settings avec sidebar
│   ├── SettingsNav.tsx               # 🆕 Navigation settings
│   ├── AccountForm.tsx               # 🆕 Formulaire infos compte
│   ├── PasswordChangeForm.tsx        # 🆕 Changement mot de passe
│   ├── AvatarUpload.tsx              # 🆕 Upload avatar avec crop
│   ├── TwoFactorSetup.tsx            # 🆕 Configuration 2FA
│   └── DeleteAccountModal.tsx        # 🆕 Confirmation suppression compte
├── subscription/
│   ├── PricingCard.tsx               # 🆕 Carte tarif
│   ├── SubscriptionStatus.tsx        # 🆕 Statut abonnement
│   ├── PaymentHistory.tsx            # 🆕 Historique paiements
│   └── UpgradePrompt.tsx             # 🆕 Prompt upgrade premium
└── common/
    ├── UpgradeModal.tsx              # 🆕 Modal upgrade (limite atteinte)
    ├── ProgressBar.tsx               # 🆕 Barre progression quota
    └── PremiumBadge.tsx              # 🆕 Badge premium
```

### 3.3 Contexts à modifier/créer

```typescript
// ✏️ MODIFIÉ
context/AuthContext.tsx
// Ajouter:
// - subscriptionTier
// - subscriptionStatus
// - canAccessStyle()
// - canCreateStyle()
// - getRemainingQuota()

// 🆕 NOUVEAU
context/SubscriptionContext.tsx
// Fonctions:
// - getCurrentPlan()
// - upgradeToPremium()
// - cancelSubscription()
// - getUsageStats()
```

### 3.4 Hooks personnalisés

```typescript
hooks/
├── useSubscription.ts                # 🆕 Hook gestion abonnement
├── useUpload.ts                      # 🆕 Hook upload fichiers
├── usePermissions.ts                 # 🆕 Hook vérification permissions
└── useQuota.ts                       # 🆕 Hook gestion quotas
```

---

## 🔐 PARTIE 4 : SÉCURITÉ & PERMISSIONS

### 4.1 Système de permissions

```typescript
// server/src/utils/permissions.ts

enum Permission {
  VIEW_LIMITED_STYLES,    // Visiteur
  VIEW_STYLES,            // Gratuit
  VIEW_ALL_STYLES,        // Premium
  CREATE_STYLES_LIMITED,  // Gratuit (5/mois)
  CREATE_STYLES,          // Premium (illimité)
  UPLOAD_AVATAR,          // Tous connectés
  CREATE_COLLECTIONS,     // Tous connectés
}

const TIER_PERMISSIONS = {
  VISITOR: [Permission.VIEW_LIMITED_STYLES],
  FREE: [
    Permission.VIEW_STYLES,
    Permission.CREATE_STYLES_LIMITED,
    Permission.UPLOAD_AVATAR,
    Permission.CREATE_COLLECTIONS,
  ],
  PREMIUM: [
    Permission.VIEW_ALL_STYLES,
    Permission.CREATE_STYLES,
    Permission.UPLOAD_AVATAR,
    Permission.CREATE_COLLECTIONS,
  ],
};
```

### 4.2 Quotas par tier

```typescript
const QUOTAS = {
  VISITOR: {
    viewStyles: 5,          // 5 styles visibles
    viewStylesPerDay: 5,    // Max par jour
  },
  FREE: {
    viewStyles: 20,         // 20 styles visibles
    createStyles: 5,        // 5 créations/mois
    uploadSize: 5 * 1024 * 1024,  // 5MB
  },
  PREMIUM: {
    viewStyles: Infinity,   // Illimité
    createStyles: Infinity, // Illimité
    uploadSize: 50 * 1024 * 1024, // 50MB
  },
};
```

---

## 💳 PARTIE 5 : INTÉGRATION STRIPE

### 5.1 Plans d'abonnement

```typescript
const STRIPE_PLANS = {
  PREMIUM_MONTHLY: {
    name: 'Premium Monthly',
    price: 9.99,
    interval: 'month',
    features: [
      'Unlimited style views',
      'Unlimited style creation',
      'Priority support',
      '50MB upload limit',
      'No ads',
    ],
  },
  PREMIUM_YEARLY: {
    name: 'Premium Yearly',
    price: 99.99,
    interval: 'year',
    features: [
      'All Monthly features',
      '2 months free',
      'Early access to new features',
    ],
  },
};
```

### 5.2 Webhooks Stripe à gérer

```typescript
// Events Stripe à écouter:
- checkout.session.completed       // Abonnement créé
- customer.subscription.updated    // Abonnement modifié
- customer.subscription.deleted    // Abonnement annulé
- invoice.payment_succeeded        // Paiement réussi
- invoice.payment_failed           // Paiement échoué
```

---

## 📦 PARTIE 6 : UPLOAD & STOCKAGE

### 6.1 Configuration Multer

```typescript
// Stockage local ou S3
const storage = multer.diskStorage({
  destination: 'uploads/avatars/',
  filename: (req, file, cb) => {
    const uniqueName = `${req.user.id}-${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});
```

### 6.2 Traitement images

```typescript
// Avec Sharp pour optimisation
import sharp from 'sharp';

const processAvatar = async (filePath: string) => {
  return sharp(filePath)
    .resize(300, 300, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toFile(`${filePath}-processed.jpg`);
};
```

---

## 📧 PARTIE 7 : NOTIFICATIONS EMAIL

### 7.1 Templates email nécessaires

```typescript
- welcome.html                  // Bienvenue
- email-verification.html       // Vérification email
- password-reset.html           // Réinitialisation mot de passe
- subscription-activated.html   // Abonnement activé
- subscription-canceled.html    // Abonnement annulé
- payment-failed.html           // Paiement échoué
- usage-limit-reached.html      // Limite atteinte
```

### 7.2 Service email (NodeMailer ou SendGrid)

```typescript
// server/src/services/email.service.ts
import nodemailer from 'nodemailer';

const sendEmail = async (to: string, subject: string, html: string) => {
  // Implementation
};
```

---

## 🧪 PARTIE 8 : TESTS

### 8.1 Tests backend

```typescript
// Tests à créer
test/
├── auth.test.ts
│   ├── Password change
│   ├── Email verification
│   └── 2FA
├── subscription.test.ts
│   ├── Checkout flow
│   ├── Webhook handling
│   └── Permission checks
├── upload.test.ts
│   ├── Avatar upload
│   ├── File validation
│   └── Size limits
└── permissions.test.ts
    ├── Tier-based access
    └── Quota enforcement
```

### 8.2 Tests E2E

```typescript
e2e/
├── subscription-flow.spec.ts     // Parcours complet abonnement
├── settings.spec.ts              // Tests settings
└── upload.spec.ts                // Tests upload
```

---

## 📊 PARTIE 9 : MIGRATIONS & DONNÉES

### 9.1 Ordre des migrations

```bash
1. Ajouter nouveaux champs User
2. Créer enums
3. Créer tables SubscriptionHistory, Payment, UsageLog
4. Ajouter champs Style (isPremiumOnly, visibility)
5. Migrer données existantes (assigner FREE tier)
6. Créer indexes performance
```

### 9.2 Seed data

```typescript
// Créer utilisateurs test
- free-user@test.com (FREE tier)
- premium-user@test.com (PREMIUM tier)

// Créer styles test avec différentes visibilités
```

---

## 📝 PARTIE 10 : VARIABLES D'ENVIRONNEMENT

### 10.1 Nouvelles variables

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_...

# Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxx
EMAIL_FROM=noreply@yourdomain.com

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001

# Features
ENABLE_2FA=true
ENABLE_EMAIL_VERIFICATION=true
```

---

## 🎯 PARTIE 11 : DÉPENDANCES NPM

### 11.1 Backend

```bash
npm install --save
  stripe                    # Stripe SDK
  multer                    # Upload fichiers
  @types/multer             # Types Multer
  sharp                     # Traitement images
  nodemailer                # Envoi emails
  @types/nodemailer         # Types Nodemailer
  speakeasy                 # 2FA (TOTP)
  qrcode                    # QR Code pour 2FA
  @types/qrcode             # Types QR Code
  rate-limiter-flexible     # Rate limiting avancé
```

### 11.2 Frontend

```bash
npm install --save
  @stripe/stripe-js         # Stripe client
  @stripe/react-stripe-js   # Stripe React
  react-dropzone            # Upload drag & drop
  react-image-crop          # Crop avatar
  react-avatar-editor       # Éditeur avatar
  date-fns                  # Manipulation dates
  recharts                  # Graphiques usage
```

---

## 🚦 PARTIE 12 : ORDRE D'IMPLÉMENTATION

### Phase 1 : Fondations (Semaine 1-2)
1. ✅ Mise à jour Prisma schema
2. ✅ Migrations base de données
3. ✅ Configuration Stripe (test mode)
4. ✅ Configuration upload fichiers
5. ✅ Service email de base

### Phase 2 : Backend Core (Semaine 2-3)
1. ✅ Middleware permissions
2. ✅ Controllers subscription
3. ✅ Controllers payment
4. ✅ Controllers upload
5. ✅ Webhooks Stripe
6. ✅ Modification auth controller (password change, etc.)

### Phase 3 : Frontend Core (Semaine 3-4)
1. ✅ SubscriptionContext
2. ✅ Pages settings
3. ✅ Composants upload avatar
4. ✅ Page pricing
5. ✅ Intégration Stripe checkout

### Phase 4 : Permissions & Quotas (Semaine 4-5)
1. ✅ Filtrage styles par tier
2. ✅ Rate limiting par tier
3. ✅ Usage tracking
4. ✅ Upgrade prompts
5. ✅ Gestion quotas

### Phase 5 : Sécurité & Email (Semaine 5-6)
1. ✅ Email verification
2. ✅ Password reset
3. ✅ 2FA (optionnel)
4. ✅ Templates email
5. ✅ Notifications

### Phase 6 : Tests & Polish (Semaine 6-7)
1. ✅ Tests unitaires
2. ✅ Tests E2E
3. ✅ Documentation API
4. ✅ Optimisations performance
5. ✅ UX improvements

---

## 📈 PARTIE 13 : MÉTRIQUES & ANALYTICS

### 13.1 Données à tracker

```typescript
- Conversions free → premium
- Taux de rétention par tier
- Usage moyen par tier
- Taux d'abandon checkout
- Revenue mensuel récurrent (MRR)
- Lifetime value (LTV)
```

### 13.2 Dashboard admin

```
admin/
├── users.tsx              // Gestion utilisateurs
├── subscriptions.tsx      // Vue abonnements
├── analytics.tsx          // Métriques
└── revenue.tsx            // Revenue tracking
```

---

## ⚠️ PARTIE 14 : POINTS D'ATTENTION

### 14.1 Sécurité
- ✅ Validation stricte uploads (taille, type, contenu)
- ✅ Scan antivirus pour uploads (optionnel)
- ✅ Rate limiting agressif sur endpoints sensibles
- ✅ CSRF protection pour paiements
- ✅ Stripe webhook signature verification
- ✅ PCI compliance (délégué à Stripe)

### 14.2 Performance
- ✅ Caching plans d'abonnement
- ✅ CDN pour avatars/images
- ✅ Lazy loading images
- ✅ Optimisation queries avec nouveaux indexes
- ✅ Background jobs pour webhooks

### 14.3 UX
- ✅ Messages clairs limites atteintes
- ✅ Preview avant upgrade
- ✅ Onboarding nouveaux utilisateurs
- ✅ Feedback visuel upload
- ✅ Confirmations actions sensibles

### 14.4 Légal
- ✅ Conditions générales de vente (CGV)
- ✅ Politique de confidentialité
- ✅ Politique de remboursement
- ✅ RGPD compliance (export données)
- ✅ Mentions légales

---

## 🎁 PARTIE 15 : FEATURES BONUS (Nice to have)

```
- 🎁 Codes promo / Coupons
- 🎁 Parrainage (referral program)
- 🎁 Essai gratuit 7 jours
- 🎁 Mode hors-ligne (PWA)
- 🎁 Export données utilisateur (RGPD)
- 🎁 Historique activité
- 🎁 Notifications in-app
- 🎁 Dark/Light mode par utilisateur
- 🎁 Multi-langue
- 🎁 OAuth (Google, GitHub, etc.)
```

---

## 📊 ESTIMATION GLOBALE

### Temps de développement
- **Backend** : ~60-80 heures
- **Frontend** : ~50-70 heures
- **Tests** : ~20-30 heures
- **Documentation** : ~10-15 heures
- **Total** : **140-195 heures** (≈ 4-6 semaines solo)

### Complexité
- **Backend** : 🔴🔴🔴🔴⚪ (4/5) - Stripe + Permissions complexes
- **Frontend** : 🔴🔴🔴⚪⚪ (3/5) - Nombreuses pages mais standard
- **Tests** : 🔴🔴🔴⚪⚪ (3/5) - Paiements à mocker

---

## ✅ CHECKLIST FINALE

Avant de démarrer, valider :
- [ ] Compte Stripe créé (test mode)
- [ ] Service email configuré (SendGrid/Mailgun)
- [ ] Stockage fichiers décidé (local/S3)
- [ ] Plans tarifaires définis
- [ ] Quotas par tier définis
- [ ] Design/maquettes approuvés
- [ ] Budget serveur pour stockage
- [ ] Légal consulté (CGV, RGPD)

---

**Prêt à démarrer ? Dis-moi par quelle phase tu veux commencer !** 🚀
