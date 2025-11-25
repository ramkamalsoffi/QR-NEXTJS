# QR-NEXTJS - Merged QR Demo Application

This is a unified Next.js application that combines the frontend, backend API, and admin dashboard into a single codebase.

## Project Structure

```
QR-NEXTJS/
├── app/
│   ├── page.tsx                    # Frontend: QR submission form (/)
│   ├── pdf/page.tsx                # Frontend: PDF viewer (/pdf)
│   ├── admin/
│   │   ├── page.tsx                # Redirect to admin login
│   │   ├── login/page.tsx          # Admin login (/admin/login)
│   │   └── dashboard/              # Admin dashboard (/admin/dashboard/*)
│   │       ├── page.tsx            # Dashboard home
│   │       ├── products/page.tsx   # Products management
│   │       ├── customers/page.tsx  # Customers management
│   │       └── qr-scan/page.tsx    # QR scanner
│   └── api/                        # Backend API routes
│       ├── products/               # Product CRUD operations
│       ├── customers/              # Customer CRUD operations
│       ├── submissions/            # Form submission endpoint
│       └── s3-upload/              # S3 file upload
├── components/                     # Shared React components
├── lib/
│   ├── prisma.ts                   # Prisma client singleton
│   ├── models/                     # Database models
│   ├── services/                   # Business logic services
│   ├── utils/                      # Utility functions
│   ├── frontend/                   # Frontend-specific utilities
│   └── admin/                      # Admin-specific utilities
├── prisma/
│   └── schema.prisma               # Database schema
└── providers/                      # React context providers

```

## Features

### Frontend (Root Routes)
- **QR Submission Form** (`/`) - Users can submit their email and batch number
- **PDF Viewer** (`/pdf`) - View and download PDF documents

### Admin Dashboard (`/admin/*`)
- **Login** (`/admin/login`) - Admin authentication
- **Dashboard** (`/admin/dashboard`) - Overview and statistics
- **Products Management** (`/admin/dashboard/products`) - Create, edit, delete products
- **Customers Management** (`/admin/dashboard/customers`) - View and manage customer submissions
- **QR Scanner** (`/admin/dashboard/qr-scan`) - Scan QR codes

### Backend API (`/api/*`)
- **Products API** - CRUD operations for products
  - `GET /api/products` - List all products
  - `POST /api/products` - Create product (with PDF upload)
  - `GET /api/products/:id` - Get product by ID
  - `PUT /api/products/:id` - Update product
  - `DELETE /api/products/:id` - Delete product
  - `GET /api/products/batch/:batchNo` - Get product by batch number

- **Customers API** - Manage customer data
  - `GET /api/customers` - List all customers
  - `POST /api/customers` - Create customer
  - `GET /api/customers/:id` - Get customer by ID
  - `DELETE /api/customers/:id` - Delete customer

- **Submissions API** - Handle form submissions
  - `POST /api/submissions` - Submit form with email and batch number

- **S3 Upload API** - File upload to S3/DigitalOcean Spaces
  - `POST /api/s3-upload` - Upload files

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="your_database_url"
DIRECT_URL="your_direct_database_url"

# S3/DigitalOcean Spaces
BUCKET_NAME="your_bucket_name"
NEW_REGION="your_region"
NEW_ACCESS_KEY="your_access_key"
SECRET_ACCESS_KEY="your_secret_key"
S3_ENDPOINT="https://your-region.digitaloceanspaces.com"
S3_FORCE_PATH_STYLE="false"
S3_MAKE_PUBLIC="true"
```

## Getting Started

### Installation

```bash
npm install
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (if needed)
npx prisma migrate dev

# Open Prisma Studio (optional)
npx prisma studio
```

### Development

```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin
- API: http://localhost:3000/api

### Build for Production

```bash
npm run build
npm start
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **File Storage**: S3/DigitalOcean Spaces
- **HTTP Client**: Axios
- **State Management**: React Query (@tanstack/react-query)
- **Icons**: Lucide React
- **QR Code**: html5-qrcode

## Migration Notes

This project was created by merging three separate applications:
1. **QR_demo_frontend** (port 3000) → Root routes (`/`, `/pdf`)
2. **QR_demo_backend** (port 5000) → API routes (`/api/*`)
3. **QR_demo_admin** (port 4000) → Admin routes (`/admin/*`)

All functionality has been preserved, and the API endpoints have been updated to use relative paths since everything now runs on a single port (3000).

## Key Changes from Original Projects

1. **Single Port**: Everything runs on port 3000 instead of separate ports
2. **API Routes**: Express.js backend converted to Next.js API routes
3. **Admin Routes**: Admin pages moved from root to `/admin` prefix
4. **API Client**: Updated to use relative paths (`/api`) instead of `http://localhost:5000`
5. **Environment**: Single `.env` file for all configurations

## License

ISC
