# Admin Guide

## Access

1. Navigate to `/admin/login`
2. Sign in with a super-admin account (seeded: `admin@novaex.ai`)

## Dashboards

| Section | Path | Capabilities |
|---------|------|--------------|
| Overview | `/admin` | Revenue, orders, customers, AI insights |
| Products | `/admin/products` | Catalog management |
| Orders | `/admin/orders` | Order lifecycle, fulfillment |
| Customers | `/admin/customers` | Account management |
| Vendors | `/admin/vendors` | Marketplace onboarding |
| Marketing | `/admin/marketing` | Coupons, campaigns, gift cards |
| Content | `/admin/content` | CMS pages, blogs, FAQs |
| SEO | `/admin/seo` | Coverage metrics, sitemap health |
| Analytics | `/admin/analytics` | Platform metrics |
| System | `/admin/system` | Roles, feature flags, audit logs |

## Content approval

Publish CMS pages, blogs, and landing pages from draft to published via the growth admin API (`POST /admin/growth/*/approval`).

## Monitoring

- Health: `/api/v1/health/ready`
- Architecture reference: `/api/v1/admin/monitoring/architecture`

## Security

- Use MFA for admin accounts in production
- Rotate credentials after initial seed deployment
- Review audit logs under System
