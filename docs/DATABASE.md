# Database Documentation

## Schema location

`database/prisma/schema.prisma`

## Key domains

| Domain | Models |
|--------|--------|
| Auth | User, Session, RefreshToken, Role, Permission |
| Catalog | Product, ProductVariant, Category, Brand |
| Commerce | Cart, Order, Payment, Coupon, GiftCard |
| Fulfillment | Shipment, InventoryItem, Refund |
| Growth | CmsPage, Blog, MarketingCampaign, NewsletterSubscription |
| Vendor | Store, VendorProfile |

## Commands

```bash
cd database
npm run validate          # Prisma schema validation
npm run migrate:deploy    # Apply migrations
npm run seed              # Demo data
```

## Seed data

The seed script creates:

- Super admin, customers, vendors
- Sample products with inventory
- Coupons (`NOVAEXVIP20`, `FREESHIPAI`)
- Sample orders and analytics events

**Credentials:** see root `README.md`

## Backup

- Nightly `pg_dump` recommended
- Redis AOF enabled in Docker Compose for cache durability

## Migrations in production

Run via CI/CD or Docker entrypoint (`RUN_MIGRATIONS=true`). Never edit applied migrations — create new ones.
