# Travia Frontend

Frontend application for Travia - Travel Tour Management System

## 🚀 Tech Stack

- **React 19** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **React Router** - Routing
- **Axios** - HTTP Client
- **Tailwind CSS** - Styling

## 📁 Project Structure

```
src/
├── components/        # Reusable components
│   ├── auth/         # Authentication components
│   ├── common/       # Common components (Loading, Toast, etc.)
│   └── layout/       # Layout components (Header, Footer, etc.)
├── contexts/         # React Context providers
│   └── AuthContext.tsx
├── hooks/            # Custom React hooks
│   └── useToast.ts
├── pages/            # Page components
│   ├── auth/         # Login pages (User, Admin, Supplier)
│   ├── public/       # Public pages (Home, Tours, Tour Detail)
│   ├── user/         # User dashboard
│   ├── admin/        # Admin dashboard
│   └── supplier/     # Supplier dashboard
├── services/         # API services
│   ├── api.ts        # Axios instance
│   ├── authService.ts
│   ├── tourService.ts
│   ├── bookingService.ts
│   └── adminService.ts
├── types/            # TypeScript types
│   └── index.ts
├── utils/            # Utility functions
│   └── formatters.ts
├── App.tsx           # Main app component with routes
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## ⚙️ Setup & Installation

### Prerequisites

- Node.js 18+
- Yarn or npm

### Installation

```bash
# Install dependencies
yarn install

# Copy environment file
cp .env.example .env

# Update .env with your API URL
# VITE_API_URL=http://localhost:8080/api
```

### Development

```bash
# Start development server
yarn dev

# Open http://localhost:5173
```

### Build

```bash
# Build for production
yarn build

# Preview production build
yarn preview
```

## 🔐 Authentication

The app supports 3 types of users with separate login pages:

### 1. Customer/User Login
- **URL:** `/login`
- **Role:** `khach_hang`
- **Features:** Browse tours, make bookings, view booking history

### 2. Admin Login
- **URL:** `/admin/login`
- **Role:** `quan_tri`
- **Features:** System management, analytics, user management

### 3. Supplier Login
- **URL:** `/supplier/login`
- **Role:** `nha_cung_cap`
- **Features:** Manage tours, view bookings, track revenue

## 📱 Pages

### Public Pages
- **Home** (`/`) - Landing page with featured tours
- **Tours** (`/tours`) - Browse all tours with filters
- **Tour Detail** (`/tours/:id`) - View detailed tour information

### Protected Pages
- **User Dashboard** (`/dashboard`) - User bookings and profile
- **Admin Dashboard** (`/admin/dashboard`) - Admin analytics and management
- **Supplier Dashboard** (`/supplier/dashboard`) - Supplier tour management

## 🎨 Styling

Using Tailwind CSS with custom components:

```tsx
// Button classes
<button className="btn-primary">Primary Button</button>
<button className="btn-secondary">Secondary Button</button>

// Input classes
<input className="input-field" />

// Card classes
<div className="card">Card content</div>
```

## 🔄 API Integration

All API calls are handled through service layers:

```typescript
// Example: Fetching tours
import { tourService } from './services/tourService';

const tours = await tourService.getAllTours();
```

## 🛡️ Protected Routes

Routes are protected using the `ProtectedRoute` component:

```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute allowedRoles={['khach_hang']}>
      <UserDashboard />
    </ProtectedRoute>
  }
/>
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8080/api` |
| `VITE_ENV` | Environment | `development` |

## 🧪 Testing

```bash
# Run linter
yarn lint

# Type check
yarn tsc
```

## 🚀 Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build
yarn build

# Deploy dist/ folder to Netlify
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build
EXPOSE 5173
CMD ["yarn", "preview", "--host"]
```

## 📄 License

MIT

## 👥 Team

Travia Development Team

## 📞 Support

For support, email support@travia.com
