# ERP System - Deployment & Production Readiness Guide

## Overview

This ERP system is built with Next.js 16, Neon PostgreSQL, Better Auth, and Drizzle ORM. It includes comprehensive authentication, RBAC, soft-delete architecture, and audit logging.

## Pre-Deployment Checklist

### Environment Variables

Set these in your Vercel project settings:

```env
# Database
DATABASE_URL=postgresql://...  # From Neon integration

# Authentication
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
BETTER_AUTH_URL=https://your-domain.com

# Optional: Custom domain
VERCEL_PROJECT_PRODUCTION_URL=https://your-domain.com
```

### Database Setup

1. Neon PostgreSQL is already connected and provisioned
2. All schema tables have been created via SQL migrations
3. Indexes are in place for performance optimization
4. Soft-delete architecture is implemented across all business entities

### Code Quality

```bash
# Type checking
pnpm tsc

# Linting  
pnpm lint

# Build production
pnpm build
```

## Architecture Overview

### Database Schema

**Authentication (Better Auth):**
- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth accounts
- `verification` - Email verification tokens

**Authorization:**
- `role` - User roles
- `permission` - Fine-grained permissions
- `rolePermission` - Role-permission mapping
- `userRole` - User-role assignment

**Audit & Compliance:**
- `auditLog` - Complete audit trail with JSONB changes

**Business Entities:**
- `product` - Product master data
- `supplier` - Supplier information
- `warehouse` - Warehouse/location management
- `inventory` - Current stock levels
- `stockMovement` - Complete inventory history
- `purchaseOrder` + `purchaseOrderLineItem` - Inbound orders
- `salesOrder` + `salesOrderLineItem` - Outbound orders

### Authentication Flow

1. User signs up at `/sign-up` with email and password
2. Better Auth stores hashed password in `account` table
3. Session is created and stored in `session` table
4. Authentication middleware checks session on protected routes
5. User redirected to `/sign-in` if no valid session

### API Architecture

**Request Flow:**
1. Client → API Route (`/api/[resource]`)
2. Route checks authentication via `auth.api.getSession()`
3. Route calls Service layer (`ProductService`, etc.)
4. Service calls Repository layer (`ProductRepository`, etc.)
5. Repository executes Drizzle ORM queries
6. Audit logging is automatic via service layer

**Example: Create Product**
```
POST /api/products → ProductService.createProduct() 
→ productRepository.create() + auditRepository.create()
```

### Data Fetching (Frontend)

Use the TanStack Query hooks:

```typescript
// Get all products
const { data: products } = useProducts()

// Get single product
const { data: product } = useProduct(id)

// Create product
const createMutation = useCreateProduct()
createMutation.mutate({ name: 'Widget', sku: 'SKU-001' })

// Update product
const updateMutation = useUpdateProduct()
updateMutation.mutate({ id, data: { name: 'Updated' } })

// Delete product (soft or permanent)
const deleteMutation = useDeleteProduct()
deleteMutation.mutate({ id, permanent: false })
```

## Deployment Steps

### 1. Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "ERP system production ready"
git push origin main

# Vercel will auto-deploy from GitHub
# Or deploy via CLI:
pnpm vercel deploy --prod
```

### 2. Set Environment Variables in Vercel

1. Go to Project Settings → Environment Variables
2. Add `DATABASE_URL` from Neon
3. Add `BETTER_AUTH_SECRET` (generate with `openssl rand -base64 32`)
4. Verify `BETTER_AUTH_URL` is set to production domain

### 3. Test Production Deployment

```bash
# Test authentication
curl -X POST https://your-domain.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test product API
curl https://your-domain.com/api/products \
  -H "Cookie: <session-cookie>"

# Test audit logs
curl https://your-domain.com/api/audit?type=stats \
  -H "Cookie: <session-cookie>"
```

## Security Considerations

### Authentication
- Passwords hashed with Better Auth's bcrypt implementation
- Sessions use secure, httpOnly cookies
- CSRF protection built-in to Better Auth
- Session timeout after 30 days of inactivity

### Authorization
- RBAC system prevents unauthorized access
- Every API route checks `auth.api.getSession()`
- User data is always scoped by `userId`

### Database Security
- Soft-delete prevents accidental data loss
- Audit logging tracks all changes
- Row-level security via `userId` scoping (no SQL RLS needed)

### API Security
- All API routes require authentication
- POST/PUT/DELETE require valid session
- IP addresses and user agents logged for audit trails
- Rate limiting recommended (implement in production)

## Monitoring & Logging

### Audit Logs

Access at `/api/audit`:

```typescript
// Get user's audit logs
GET /api/audit?type=user&filter=user-id

// Get module audit logs  
GET /api/audit?type=module&filter=products

// Get failure logs
GET /api/audit?type=failures

// Get statistics
GET /api/audit?type=stats
```

### Error Handling

- All errors are logged with context
- Production errors don't expose stack traces to clients
- Check server logs via `pnpm dev` or Vercel Logs

## Scaling Considerations

### Database
- Neon supports horizontal scaling
- Indexes are optimized for common queries
- Consider connection pooling for high traffic

### Caching
- React Query caches data client-side (5min default)
- Can enable Redis caching for hot data

### Performance
- All business tables have `userId` index
- Audit table indexed by `entityType` and `createdAt`
- Consider materialized views for dashboard stats

## Troubleshooting

### Session Issues
- Check `BETTER_AUTH_SECRET` is set in Vercel env
- Verify `BETTER_AUTH_URL` matches domain
- Clear cookies and try signing in again

### Database Connection
- Verify `DATABASE_URL` is correct in env vars
- Check Neon project is not paused
- Verify IP allowlist includes Vercel deployment IP

### Audit Logging Not Working
- Check `auditLog` table exists: `SELECT * FROM "auditLog" LIMIT 1;`
- Verify `userId` is being passed to service layer
- Check browser console for API errors

## Next Steps

1. Create seeding script with sample data
2. Implement rate limiting on public endpoints
3. Set up error tracking (Sentry, etc.)
4. Configure backup strategy for Neon
5. Add API documentation (Swagger/OpenAPI)
6. Implement caching layer for dashboard
7. Create admin dashboard for audit log review

## Support

For issues or questions:
- Check this documentation
- Review server logs in Vercel dashboard
- Check database in Neon console
- Verify all environment variables are set correctly
