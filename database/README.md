# NOVAEX Database

Production Prisma/PostgreSQL database package for the NOVAEX AI-powered enterprise ecommerce platform.

## Folder structure

```text
database/
  prisma/
    schema.prisma
    migrations/
      migration_lock.toml
      0001_novaex_initial/
        migration.sql
    seed/
      seed.ts
  prisma.config.ts
  package.json
  tsconfig.json
  .env.example
```

## Commands

```bash
npm install
cp .env.example .env
npm run validate
npm run generate
npm run typecheck
npm run migrate:deploy
npm run seed
```

## Schema strategy

- UUID primary keys are used across the domain.
- `createdAt`, `updatedAt`, and `deletedAt` are included on mutable business tables.
- Money uses `Decimal(12, 2)`; analytics metrics use wider decimal precision.
- PII-sensitive and extensible fields use `Json` metadata with GIN indexes where queryable.
- AI catalog search supports `pg_trgm`, full-text indexes, and `pgvector` HNSW product embeddings.
- Join tables model many-to-many relationships explicitly for RBAC, collections, wishlist, compare, coupons, and marketplace ownership.

## Performance recommendations

- Keep `analytics_events`, `api_key_usage_logs`, `activity_logs`, `security_logs`, and `error_logs` partitioned by time before high-volume launch.
- Partition `orders` and `order_items` by `created_at` or marketplace region when order volume reaches multi-million rows.
- Use read replicas for catalog browsing, reviews, analytics dashboards, and AI recommendation reads.
- Keep writes for orders, payments, inventory, refunds, and ledgers on the primary database.
- Run `VACUUM`, `ANALYZE`, and `REINDEX CONCURRENTLY` as part of scheduled database maintenance.
- Use connection pooling through PgBouncer or the managed provider pooler for API workers and background jobs.
- Refresh materialized analytics/search projections asynchronously from event streams instead of blocking checkout writes.

## Deployment notes

- PostgreSQL must have `citext`, `pg_trgm`, and `vector` extensions available before migration deployment.
- Set `DATABASE_URL` as a secret in production; never commit a real `.env`.
- Run `npm run migrate:deploy` in release jobs, not at request startup.
- Run `npm run seed` only for demo/staging or controlled initial production bootstrap data.
- Apply Prisma migrations from a single deployment job to avoid concurrent schema changes.
- Review direct SQL indexes in `migration.sql` before changing table or field names in `schema.prisma`.
