# PayEasy Frontend

Production-grade React frontend for the PayEasy VTU platform.

## Tech Stack

- **React 18** + **Vite 5**
- **Tailwind CSS** for custom styling
- **Material UI** (available for complex components)
- **TanStack Query** for server state / caching
- **Zustand** for auth state
- **Recharts** for analytics charts
- **React Router v6** for routing
- **Axios** with interceptors for HTTP
- **React Hot Toast** for notifications

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env: set VITE_API_URL to your backend URL

# 3. Run development server
npm run dev

# 4. Build for production
npm run build
```

## Folder Structure

```
src/
├── api/
│   ├── client.js        # Axios instances (user + admin)
│   ├── user.js          # User API methods
│   └── admin.js         # Admin API methods
├── store/
│   └── auth.js          # Zustand auth stores
├── components/
│   └── shared/
│       └── UI.jsx       # Reusable UI components
├── user/
│   ├── components/
│   │   └── UserLayout.jsx
│   └── pages/
│       ├── LoginPage.jsx
│       ├── RegisterPage.jsx
│       ├── DashboardPage.jsx
│       ├── WalletPage.jsx
│       ├── AirtimePage.jsx
│       ├── DataPage.jsx
│       ├── ElectricityPage.jsx
│       ├── CablePage.jsx
│       ├── TransactionsPage.jsx
│       └── ProfilePage.jsx
├── admin/
│   ├── components/
│   │   └── AdminLayout.jsx
│   └── pages/
│       ├── AdminLoginPage.jsx
│       ├── AdminForgotPasswordPage.jsx
│       ├── AdminResetPasswordPage.jsx
│       ├── AdminDashboard.jsx
│       ├── AdminUsersPage.jsx
│       ├── AdminTransactionsPage.jsx
│       ├── AdminWalletsPage.jsx
│       ├── AdminAnalyticsPage.jsx
│       └── AdminsManagementPage.jsx
├── App.jsx              # Routes + guards
├── main.jsx             # Entry point
├── index.css            # Tailwind + design system
└── utils.js             # Formatters, constants
```

## Routes

### User App
| Route | Description |
|-------|-------------|
| `/login` | User login |
| `/register` | User registration |
| `/dashboard` | Home dashboard with balance + quick actions |
| `/wallet` | Fund wallet, verify payment, transaction history |
| `/airtime` | Buy airtime (MTN, Glo, Airtel, 9Mobile) |
| `/data` | Buy data bundles |
| `/electricity` | Pay electricity (IKEDC, EKEDC, etc.) |
| `/cable` | Cable TV subscriptions (DStv, GOtv, StarTimes) |
| `/transactions` | Full transaction history with filters |
| `/profile` | Profile management + change password |

### Admin Panel
| Route | Description |
|-------|-------------|
| `/admin/login` | Admin login |
| `/admin/forgot-password` | Forgot password |
| `/admin/reset-password` | Reset password |
| `/admin/dashboard` | Stats, charts, recent transactions |
| `/admin/users` | User list, status management, wallet funding |
| `/admin/transactions` | Transaction management, status updates |
| `/admin/wallets` | Wallet credit/debit operations |
| `/admin/analytics` | Volume charts, service breakdown |
| `/admin/admins` | Admin account management (Super Admin only) |

## Auth Flow

- **Users**: JWT stored in `localStorage` as `user_token`
- **Admins**: JWT stored as `admin_token`, refresh token as `admin_refresh_token`
- Route guards redirect to login if unauthenticated
- 401 responses automatically clear tokens and redirect

## Design System

Dark fintech theme with:
- **Font**: Syne (display) + DM Sans (body)  
- **Colors**: Navy `#0A0F1E` background, Electric green `#00E676` accent
- **Admin colors**: Amber `#F59E0B` accent for admin panel
- Glass morphism cards with subtle borders
- Smooth animations and transitions
