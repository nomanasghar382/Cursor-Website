-- NOVAEX initial enterprise schema.
-- Required PostgreSQL extensions for UUIDs, case-insensitive identity fields,
-- fuzzy catalog search, JSONB search, and AI product embeddings.
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING', 'BLOCKED', 'DELETED');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'GOOGLE', 'APPLE', 'PASSKEY');

-- CreateEnum
CREATE TYPE "RoleScope" AS ENUM ('GLOBAL', 'VENDOR', 'STORE');

-- CreateEnum
CREATE TYPE "UserRoleType" AS ENUM ('CUSTOMER', 'SELLER', 'SELLER_ADMIN', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ProductVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'UNLISTED');

-- CreateEnum
CREATE TYPE "VariantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "AttributeDataType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'COLOR', 'SIZE', 'JSON');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'RESERVATION', 'RELEASE');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('DRAFT', 'SENT', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('REQUIRES_ACTION', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('STRIPE', 'PAYPAL', 'MANUAL');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('AUTHORIZE', 'CAPTURE', 'REFUND', 'VOID', 'CHARGEBACK');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'LABEL_CREATED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED');

-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'RECEIVED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING');

-- CreateEnum
CREATE TYPE "CouponStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'DISABLED');

-- CreateEnum
CREATE TYPE "GiftCardStatus" AS ENUM ('ACTIVE', 'DISABLED', 'EXPIRED', 'DEPLETED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'READ');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "AiMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM', 'TOOL');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('LTR', 'RTL');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" CITEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT,
    "auth_provider" "AuthProvider" NOT NULL DEFAULT 'EMAIL',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "email_verified_at" TIMESTAMPTZ(6),
    "phone_verified_at" TIMESTAMPTZ(6),
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "date_of_birth" DATE,
    "gender" TEXT,
    "preferred_language_id" UUID,
    "preferred_currency_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "UserRoleType" NOT NULL DEFAULT 'CUSTOMER',
    "description" TEXT,
    "scope" "RoleScope" NOT NULL DEFAULT 'GLOBAL',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "vendor_id" UUID,
    "store_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "session_token_hash" TEXT NOT NULL,
    "ip_address" INET,
    "user_agent" TEXT,
    "device_id" TEXT,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "family_id" UUID NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "rotated_at" TIMESTAMPTZ(6),
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" UUID NOT NULL,
    "iso2" CHAR(2) NOT NULL,
    "iso3" CHAR(3) NOT NULL,
    "name" TEXT NOT NULL,
    "phone_code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" UUID NOT NULL,
    "country_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "postal_code_pattern" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currencies" (
    "id" UUID NOT NULL,
    "code" CHAR(3) NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimal_places" INTEGER NOT NULL DEFAULT 2,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "direction" "Direction" NOT NULL DEFAULT 'LTR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_addresses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "country_id" UUID NOT NULL,
    "city_id" UUID,
    "label" TEXT,
    "recipient_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "postal_code" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" UUID NOT NULL,
    "legal_name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "tax_id_encrypted" TEXT,
    "status" "VendorStatus" NOT NULL DEFAULT 'PENDING',
    "kyc_status" "KycStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_users" (
    "id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT,
    "is_owner" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "vendor_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stores" (
    "id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "default_currency_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "status" "StoreStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_url" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "parent_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_translations" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "language_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "brand_id" UUID,
    "category_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "ProductVisibility" NOT NULL DEFAULT 'PUBLIC',
    "base_price" DECIMAL(12,2) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "ai_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_translations" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "language_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "product_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "compare_at_price" DECIMAL(12,2),
    "currency_code" CHAR(3) NOT NULL,
    "weight_grams" INTEGER,
    "status" "VariantStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "cloudinary_public_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt_text" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_360_assets" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "asset_url" TEXT NOT NULL,
    "frame_count" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "product_360_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_3d_models" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "cloudinary_public_id" TEXT NOT NULL,
    "model_url" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "file_size_bytes" BIGINT,
    "lod_level" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "product_3d_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_videos" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "duration_seconds" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "product_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_specifications" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "spec_key" TEXT NOT NULL,
    "spec_value" TEXT NOT NULL,
    "unit" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "product_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attributes" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "data_type" "AttributeDataType" NOT NULL,
    "is_filterable" BOOLEAN NOT NULL DEFAULT false,
    "is_variant_defining" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_values" (
    "id" UUID NOT NULL,
    "attribute_id" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "display_value" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "attribute_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_attributes" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "attribute_id" UUID NOT NULL,
    "attribute_value_id" UUID,
    "raw_value" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "product_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colors" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "hex_code" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sizes" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "size_system" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "country_id" UUID NOT NULL,
    "city_id" UUID,
    "name" TEXT NOT NULL,
    "address_line1" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "available_quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
    "reorder_level" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "movement_type" "MovementType" NOT NULL,
    "quantity_delta" INTEGER NOT NULL,
    "reference_type" TEXT,
    "reference_id" UUID,
    "created_by_user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "expected_at" TIMESTAMPTZ(6),
    "total_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency_code" CHAR(3) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" UUID NOT NULL,
    "purchase_order_id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_cost" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_carts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "shopping_carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" UUID NOT NULL,
    "cart_id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price_snapshot" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlists" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_items" (
    "id" UUID NOT NULL,
    "wishlist_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recently_viewed_products" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "source" TEXT,
    "viewed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recently_viewed_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_embeddings" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "embedding" vector(1536),
    "model_version" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "product_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_recommendations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "score" DECIMAL(7,4) NOT NULL,
    "model_version" TEXT NOT NULL,
    "context" JSONB,
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ai_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_chat_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "session_title" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "ai_chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "role" "AiMessageRole" NOT NULL,
    "message" TEXT NOT NULL,
    "tokens_used" INTEGER,
    "model_name" TEXT,
    "model_version" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_history" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "query" TEXT NOT NULL,
    "normalized_query" TEXT NOT NULL,
    "result_count" INTEGER NOT NULL DEFAULT 0,
    "clicked_product_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "search_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_searches" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "language_id" UUID,
    "audio_asset_url" TEXT NOT NULL,
    "transcript" TEXT,
    "confidence" DECIMAL(5,4),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "voice_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_searches" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "image_url" TEXT NOT NULL,
    "detected_labels" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "image_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_search_products" (
    "id" UUID NOT NULL,
    "image_search_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "score" DECIMAL(7,4) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_search_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "order_number" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "currency_code" CHAR(3) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "tax_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "shipping_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "product_name_snapshot" TEXT NOT NULL,
    "sku_snapshot" TEXT,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "tax_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "line_total" DECIMAL(12,2) NOT NULL,
    "tax_rate_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "gateway" "PaymentGateway" NOT NULL,
    "gateway_payment_id" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'REQUIRES_ACTION',
    "amount" DECIMAL(12,2) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "transaction_type" "TransactionType" NOT NULL,
    "gateway_transaction_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "raw_response" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "pdf_url" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "issued_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" DECIMAL(12,2) NOT NULL,
    "starts_at" TIMESTAMPTZ(6) NOT NULL,
    "ends_at" TIMESTAMPTZ(6),
    "usage_limit" INTEGER,
    "per_user_limit" INTEGER,
    "status" "CouponStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_redemptions" (
    "id" UUID NOT NULL,
    "coupon_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "discount_amount" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_cards" (
    "id" UUID NOT NULL,
    "code_hash" TEXT NOT NULL,
    "initial_balance" DECIMAL(12,2) NOT NULL,
    "current_balance" DECIMAL(12,2) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "status" "GiftCardStatus" NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "gift_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_card_transactions" (
    "id" UUID NOT NULL,
    "gift_card_id" UUID NOT NULL,
    "order_id" UUID,
    "amount_delta" DECIMAL(12,2) NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gift_card_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_rules" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "effects" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "discount_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rates" (
    "id" UUID NOT NULL,
    "country_id" UUID NOT NULL,
    "city_id" UUID,
    "tax_name" TEXT NOT NULL,
    "rate" DECIMAL(7,4) NOT NULL,
    "valid_from" TIMESTAMPTZ(6) NOT NULL,
    "valid_to" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_methods" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "service_level" TEXT NOT NULL,
    "base_price" DECIMAL(12,2) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "shipping_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_zones" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "country_id" UUID NOT NULL,
    "city_id" UUID,
    "postal_code_pattern" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "shipping_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "shipping_method_id" UUID NOT NULL,
    "tracking_number" TEXT,
    "carrier" TEXT NOT NULL,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "shipped_at" TIMESTAMPTZ(6),
    "delivered_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_events" (
    "id" UUID NOT NULL,
    "shipment_id" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "location" TEXT,
    "message" TEXT,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "returns" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "ReturnStatus" NOT NULL DEFAULT 'REQUESTED',
    "reason" TEXT NOT NULL,
    "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" UUID NOT NULL,
    "return_id" UUID,
    "payment_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "gateway_refund_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_messages" (
    "id" UUID NOT NULL,
    "notification_id" UUID NOT NULL,
    "to_email" TEXT NOT NULL,
    "template_key" TEXT NOT NULL,
    "provider_message_id" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "sent_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "email_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_messages" (
    "id" UUID NOT NULL,
    "notification_id" UUID NOT NULL,
    "to_phone" TEXT NOT NULL,
    "provider_message_id" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "sent_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sms_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_messages" (
    "id" UUID NOT NULL,
    "notification_id" UUID NOT NULL,
    "device_token_hash" TEXT NOT NULL,
    "provider_message_id" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "sent_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "push_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "order_item_id" UUID,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "ai_sentiment_score" DECIMAL(6,4),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_images" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "review_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings_summary" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "average_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "rating_distribution" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ratings_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "answer" TEXT NOT NULL,
    "is_seller_answer" BOOLEAN NOT NULL DEFAULT false,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" UUID NOT NULL,
    "author_user_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_comments" (
    "id" UUID NOT NULL,
    "blog_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "parent_id" UUID,
    "body" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "blog_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_pages" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "seo_title" TEXT,
    "seo_description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "cms_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_page_translations" (
    "id" UUID NOT NULL,
    "page_id" UUID NOT NULL,
    "language_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "cms_page_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_campaigns" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "budget" DECIMAL(12,2),
    "starts_at" TIMESTAMPTZ(6) NOT NULL,
    "ends_at" TIMESTAMPTZ(6),
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "marketing_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners" (
    "id" UUID NOT NULL,
    "campaign_id" UUID,
    "landing_page_id" UUID,
    "title" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "target_url" TEXT,
    "placement" TEXT NOT NULL,
    "starts_at" TIMESTAMPTZ(6) NOT NULL,
    "ends_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_sections" (
    "id" UUID NOT NULL,
    "campaign_id" UUID,
    "landing_page_id" UUID,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "media_url" TEXT,
    "cta_label" TEXT,
    "cta_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "hero_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" UUID NOT NULL,
    "referrer_user_id" UUID NOT NULL,
    "referred_user_id" UUID,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reward_granted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_points" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "points_delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "reference_type" TEXT,
    "reference_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliates" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "commission_rate" DECIMAL(5,4) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "affiliates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_clicks" (
    "id" UUID NOT NULL,
    "affiliate_id" UUID NOT NULL,
    "visitor_id" TEXT,
    "ip_hash" TEXT,
    "user_agent" TEXT,
    "clicked_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_conversions" (
    "id" UUID NOT NULL,
    "affiliate_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "commission_amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "affiliate_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" UUID NOT NULL,
    "owner_user_id" UUID NOT NULL,
    "vendor_id" UUID,
    "key_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scopes" TEXT[],
    "last_used_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6),
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_user_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID,
    "before" JSONB,
    "after" JSONB,
    "ip_address" INET,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "activity_type" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" UUID,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "event_type" TEXT NOT NULL,
    "risk_score" INTEGER NOT NULL DEFAULT 0,
    "ip_address" INET,
    "user_agent" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_logs" (
    "id" UUID NOT NULL,
    "service_name" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack_hash" TEXT,
    "trace_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_key_usage_logs" (
    "id" UUID NOT NULL,
    "api_key_id" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status_code" INTEGER NOT NULL,
    "latency_ms" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_key_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "anonymous_id" TEXT,
    "event_name" TEXT NOT NULL,
    "product_id" UUID,
    "order_id" UUID,
    "session_id" TEXT,
    "properties" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "owner_user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "report_type" TEXT NOT NULL,
    "filters" JSONB,
    "schedule" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_metrics" (
    "id" UUID NOT NULL,
    "metric_key" TEXT NOT NULL,
    "dimension_key" TEXT NOT NULL,
    "dimension_value" TEXT NOT NULL,
    "metric_value" DECIMAL(18,4) NOT NULL,
    "window_start" TIMESTAMPTZ(6) NOT NULL,
    "window_end" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "dashboard_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "vendor_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_employees" (
    "id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "department_id" UUID,
    "title" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "hired_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "vendor_employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" UUID NOT NULL,
    "store_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_products" (
    "id" UUID NOT NULL,
    "collection_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "collection_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_ar_models" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "cloudinary_public_id" TEXT,
    "model_url" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "file_size_bytes" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "product_ar_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compare_lists" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "compare_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compare_items" (
    "id" UUID NOT NULL,
    "compare_list_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compare_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_pages" (
    "id" UUID NOT NULL,
    "cms_page_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "landing_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscriptions" (
    "id" UUID NOT NULL,
    "email" CITEXT NOT NULL,
    "user_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'subscribed',
    "source" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "newsletter_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "vendor_id" UUID,
    "plan_key" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "starts_at" TIMESTAMPTZ(6) NOT NULL,
    "ends_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "rules" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_settings" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "metadata" JSONB,

    CONSTRAINT "application_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_status_created_at_idx" ON "users"("status", "created_at");

-- CreateIndex
CREATE INDEX "users_last_login_at_idx" ON "users"("last_login_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_slug_key" ON "roles"("slug");

-- CreateIndex
CREATE INDEX "roles_scope_idx" ON "roles"("scope");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_slug_key" ON "permissions"("slug");

-- CreateIndex
CREATE INDEX "permissions_resource_idx" ON "permissions"("resource");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_key" ON "permissions"("resource", "action");

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE INDEX "user_roles_vendor_id_idx" ON "user_roles"("vendor_id");

-- CreateIndex
CREATE INDEX "user_roles_store_id_idx" ON "user_roles"("store_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_vendor_id_store_id_key" ON "user_roles"("user_id", "role_id", "vendor_id", "store_id");

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_hash_key" ON "sessions"("session_token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_expires_at_idx" ON "sessions"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "sessions_revoked_at_idx" ON "sessions"("revoked_at");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_family_id_idx" ON "refresh_tokens"("family_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "countries_iso2_key" ON "countries"("iso2");

-- CreateIndex
CREATE UNIQUE INDEX "countries_iso3_key" ON "countries"("iso3");

-- CreateIndex
CREATE INDEX "countries_is_active_idx" ON "countries"("is_active");

-- CreateIndex
CREATE INDEX "cities_country_id_name_idx" ON "cities"("country_id", "name");

-- CreateIndex
CREATE INDEX "cities_is_active_idx" ON "cities"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "cities_country_id_name_region_key" ON "cities"("country_id", "name", "region");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_code_key" ON "currencies"("code");

-- CreateIndex
CREATE INDEX "currencies_is_active_idx" ON "currencies"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- CreateIndex
CREATE INDEX "languages_is_active_idx" ON "languages"("is_active");

-- CreateIndex
CREATE INDEX "user_addresses_user_id_idx" ON "user_addresses"("user_id");

-- CreateIndex
CREATE INDEX "user_addresses_country_id_city_id_idx" ON "user_addresses"("country_id", "city_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_legal_name_key" ON "vendors"("legal_name");

-- CreateIndex
CREATE INDEX "vendors_status_idx" ON "vendors"("status");

-- CreateIndex
CREATE INDEX "vendors_kyc_status_idx" ON "vendors"("kyc_status");

-- CreateIndex
CREATE INDEX "vendor_users_user_id_idx" ON "vendor_users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_users_vendor_id_user_id_key" ON "vendor_users"("vendor_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "stores_slug_key" ON "stores"("slug");

-- CreateIndex
CREATE INDEX "stores_vendor_id_idx" ON "stores"("vendor_id");

-- CreateIndex
CREATE INDEX "stores_status_idx" ON "stores"("status");

-- CreateIndex
CREATE UNIQUE INDEX "stores_vendor_id_name_key" ON "stores"("vendor_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE INDEX "brands_is_verified_idx" ON "brands"("is_verified");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "categories_slug_idx" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_is_active_idx" ON "categories"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "categories_parent_id_slug_key" ON "categories"("parent_id", "slug");

-- CreateIndex
CREATE INDEX "category_translations_language_id_idx" ON "category_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "category_translations_category_id_language_id_key" ON "category_translations"("category_id", "language_id");

-- CreateIndex
CREATE INDEX "products_category_id_status_created_at_idx" ON "products"("category_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "products_brand_id_idx" ON "products"("brand_id");

-- CreateIndex
CREATE INDEX "products_store_id_status_idx" ON "products"("store_id", "status");

-- CreateIndex
CREATE INDEX "products_ai_score_idx" ON "products"("ai_score" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "products_store_id_slug_key" ON "products"("store_id", "slug");

-- CreateIndex
CREATE INDEX "product_translations_language_id_idx" ON "product_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_translations_product_id_language_id_key" ON "product_translations"("product_id", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_product_id_idx" ON "product_variants"("product_id");

-- CreateIndex
CREATE INDEX "product_variants_status_idx" ON "product_variants"("status");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_product_id_sku_key" ON "product_variants"("product_id", "sku");

-- CreateIndex
CREATE INDEX "product_images_product_id_sort_order_idx" ON "product_images"("product_id", "sort_order");

-- CreateIndex
CREATE INDEX "product_images_variant_id_idx" ON "product_images"("variant_id");

-- CreateIndex
CREATE INDEX "product_360_assets_product_id_idx" ON "product_360_assets"("product_id");

-- CreateIndex
CREATE INDEX "product_3d_models_product_id_idx" ON "product_3d_models"("product_id");

-- CreateIndex
CREATE INDEX "product_3d_models_format_idx" ON "product_3d_models"("format");

-- CreateIndex
CREATE INDEX "product_videos_product_id_sort_order_idx" ON "product_videos"("product_id", "sort_order");

-- CreateIndex
CREATE INDEX "product_specifications_product_id_idx" ON "product_specifications"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_specifications_product_id_spec_key_key" ON "product_specifications"("product_id", "spec_key");

-- CreateIndex
CREATE UNIQUE INDEX "attributes_slug_key" ON "attributes"("slug");

-- CreateIndex
CREATE INDEX "attributes_is_filterable_idx" ON "attributes"("is_filterable");

-- CreateIndex
CREATE INDEX "attribute_values_attribute_id_idx" ON "attribute_values"("attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "attribute_values_attribute_id_value_key" ON "attribute_values"("attribute_id", "value");

-- CreateIndex
CREATE INDEX "product_attributes_product_id_idx" ON "product_attributes"("product_id");

-- CreateIndex
CREATE INDEX "product_attributes_variant_id_idx" ON "product_attributes"("variant_id");

-- CreateIndex
CREATE INDEX "product_attributes_attribute_id_attribute_value_id_idx" ON "product_attributes"("attribute_id", "attribute_value_id");

-- CreateIndex
CREATE UNIQUE INDEX "colors_slug_key" ON "colors"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "colors_hex_code_key" ON "colors"("hex_code");

-- CreateIndex
CREATE UNIQUE INDEX "sizes_size_system_slug_key" ON "sizes"("size_system", "slug");

-- CreateIndex
CREATE INDEX "warehouses_store_id_idx" ON "warehouses"("store_id");

-- CreateIndex
CREATE INDEX "warehouses_status_idx" ON "warehouses"("status");

-- CreateIndex
CREATE INDEX "inventory_items_warehouse_id_idx" ON "inventory_items"("warehouse_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_variant_id_warehouse_id_key" ON "inventory_items"("variant_id", "warehouse_id");

-- CreateIndex
CREATE INDEX "stock_movements_variant_id_created_at_idx" ON "stock_movements"("variant_id", "created_at");

-- CreateIndex
CREATE INDEX "stock_movements_warehouse_id_created_at_idx" ON "stock_movements"("warehouse_id", "created_at");

-- CreateIndex
CREATE INDEX "stock_movements_reference_type_reference_id_idx" ON "stock_movements"("reference_type", "reference_id");

-- CreateIndex
CREATE INDEX "suppliers_vendor_id_idx" ON "suppliers"("vendor_id");

-- CreateIndex
CREATE INDEX "suppliers_status_idx" ON "suppliers"("status");

-- CreateIndex
CREATE INDEX "purchase_orders_supplier_id_idx" ON "purchase_orders"("supplier_id");

-- CreateIndex
CREATE INDEX "purchase_orders_warehouse_id_idx" ON "purchase_orders"("warehouse_id");

-- CreateIndex
CREATE INDEX "purchase_orders_status_idx" ON "purchase_orders"("status");

-- CreateIndex
CREATE INDEX "purchase_order_items_purchase_order_id_idx" ON "purchase_order_items"("purchase_order_id");

-- CreateIndex
CREATE INDEX "purchase_order_items_variant_id_idx" ON "purchase_order_items"("variant_id");

-- CreateIndex
CREATE INDEX "shopping_carts_user_id_idx" ON "shopping_carts"("user_id");

-- CreateIndex
CREATE INDEX "shopping_carts_expires_at_idx" ON "shopping_carts"("expires_at");

-- CreateIndex
CREATE INDEX "cart_items_variant_id_idx" ON "cart_items"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_variant_id_key" ON "cart_items"("cart_id", "variant_id");

-- CreateIndex
CREATE INDEX "wishlists_user_id_idx" ON "wishlists"("user_id");

-- CreateIndex
CREATE INDEX "wishlist_items_product_id_idx" ON "wishlist_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_wishlist_id_product_id_variant_id_key" ON "wishlist_items"("wishlist_id", "product_id", "variant_id");

-- CreateIndex
CREATE INDEX "recently_viewed_products_user_id_viewed_at_idx" ON "recently_viewed_products"("user_id", "viewed_at" DESC);

-- CreateIndex
CREATE INDEX "recently_viewed_products_product_id_viewed_at_idx" ON "recently_viewed_products"("product_id", "viewed_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "product_embeddings_product_id_model_version_key" ON "product_embeddings"("product_id", "model_version");

-- CreateIndex
CREATE INDEX "ai_recommendations_user_id_score_idx" ON "ai_recommendations"("user_id", "score" DESC);

-- CreateIndex
CREATE INDEX "ai_recommendations_product_id_idx" ON "ai_recommendations"("product_id");

-- CreateIndex
CREATE INDEX "ai_recommendations_expires_at_idx" ON "ai_recommendations"("expires_at");

-- CreateIndex
CREATE INDEX "ai_chat_sessions_user_id_started_at_idx" ON "ai_chat_sessions"("user_id", "started_at" DESC);

-- CreateIndex
CREATE INDEX "ai_conversations_session_id_created_at_idx" ON "ai_conversations"("session_id", "created_at");

-- CreateIndex
CREATE INDEX "search_history_user_id_created_at_idx" ON "search_history"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "search_history_normalized_query_idx" ON "search_history"("normalized_query");

-- CreateIndex
CREATE INDEX "voice_searches_user_id_created_at_idx" ON "voice_searches"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "image_searches_user_id_created_at_idx" ON "image_searches"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "image_search_products_product_id_idx" ON "image_search_products"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "image_search_products_image_search_id_product_id_key" ON "image_search_products"("image_search_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_user_id_created_at_idx" ON "orders"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "orders_store_id_status_idx" ON "orders"("store_id", "status");

-- CreateIndex
CREATE INDEX "orders_status_created_at_idx" ON "orders"("status", "created_at");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- CreateIndex
CREATE INDEX "order_items_variant_id_idx" ON "order_items"("variant_id");

-- CreateIndex
CREATE INDEX "payments_order_id_idx" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_gateway_gateway_payment_id_key" ON "payments"("gateway", "gateway_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_gateway_transaction_id_key" ON "payment_transactions"("gateway_transaction_id");

-- CreateIndex
CREATE INDEX "payment_transactions_payment_id_idx" ON "payment_transactions"("payment_id");

-- CreateIndex
CREATE INDEX "payment_transactions_status_idx" ON "payment_transactions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_order_id_idx" ON "invoices"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_status_idx" ON "coupons"("status");

-- CreateIndex
CREATE INDEX "coupons_starts_at_ends_at_idx" ON "coupons"("starts_at", "ends_at");

-- CreateIndex
CREATE INDEX "coupon_redemptions_user_id_idx" ON "coupon_redemptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_redemptions_coupon_id_order_id_key" ON "coupon_redemptions"("coupon_id", "order_id");

-- CreateIndex
CREATE UNIQUE INDEX "gift_cards_code_hash_key" ON "gift_cards"("code_hash");

-- CreateIndex
CREATE INDEX "gift_cards_status_idx" ON "gift_cards"("status");

-- CreateIndex
CREATE INDEX "gift_cards_expires_at_idx" ON "gift_cards"("expires_at");

-- CreateIndex
CREATE INDEX "gift_card_transactions_gift_card_id_created_at_idx" ON "gift_card_transactions"("gift_card_id", "created_at");

-- CreateIndex
CREATE INDEX "discount_rules_status_priority_idx" ON "discount_rules"("status", "priority");

-- CreateIndex
CREATE INDEX "tax_rates_country_id_city_id_idx" ON "tax_rates"("country_id", "city_id");

-- CreateIndex
CREATE INDEX "tax_rates_valid_from_valid_to_idx" ON "tax_rates"("valid_from", "valid_to");

-- CreateIndex
CREATE INDEX "shipping_methods_carrier_idx" ON "shipping_methods"("carrier");

-- CreateIndex
CREATE INDEX "shipping_methods_is_active_idx" ON "shipping_methods"("is_active");

-- CreateIndex
CREATE INDEX "shipping_zones_country_id_city_id_idx" ON "shipping_zones"("country_id", "city_id");

-- CreateIndex
CREATE INDEX "shipments_order_id_idx" ON "shipments"("order_id");

-- CreateIndex
CREATE INDEX "shipments_tracking_number_idx" ON "shipments"("tracking_number");

-- CreateIndex
CREATE INDEX "shipments_status_idx" ON "shipments"("status");

-- CreateIndex
CREATE INDEX "tracking_events_shipment_id_occurred_at_idx" ON "tracking_events"("shipment_id", "occurred_at");

-- CreateIndex
CREATE INDEX "returns_order_id_idx" ON "returns"("order_id");

-- CreateIndex
CREATE INDEX "returns_user_id_idx" ON "returns"("user_id");

-- CreateIndex
CREATE INDEX "returns_status_idx" ON "returns"("status");

-- CreateIndex
CREATE INDEX "refunds_payment_id_idx" ON "refunds"("payment_id");

-- CreateIndex
CREATE INDEX "refunds_return_id_idx" ON "refunds"("return_id");

-- CreateIndex
CREATE INDEX "refunds_status_idx" ON "refunds"("status");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "email_messages_notification_id_key" ON "email_messages"("notification_id");

-- CreateIndex
CREATE INDEX "email_messages_status_idx" ON "email_messages"("status");

-- CreateIndex
CREATE INDEX "email_messages_to_email_idx" ON "email_messages"("to_email");

-- CreateIndex
CREATE UNIQUE INDEX "sms_messages_notification_id_key" ON "sms_messages"("notification_id");

-- CreateIndex
CREATE INDEX "sms_messages_status_idx" ON "sms_messages"("status");

-- CreateIndex
CREATE UNIQUE INDEX "push_messages_notification_id_key" ON "push_messages"("notification_id");

-- CreateIndex
CREATE INDEX "push_messages_status_idx" ON "push_messages"("status");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_order_item_id_key" ON "reviews"("order_item_id");

-- CreateIndex
CREATE INDEX "reviews_product_id_rating_idx" ON "reviews"("product_id", "rating");

-- CreateIndex
CREATE INDEX "reviews_status_idx" ON "reviews"("status");

-- CreateIndex
CREATE INDEX "review_images_review_id_idx" ON "review_images"("review_id");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_summary_product_id_key" ON "ratings_summary"("product_id");

-- CreateIndex
CREATE INDEX "ratings_summary_average_rating_idx" ON "ratings_summary"("average_rating" DESC);

-- CreateIndex
CREATE INDEX "questions_product_id_created_at_idx" ON "questions"("product_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "questions_status_idx" ON "questions"("status");

-- CreateIndex
CREATE INDEX "answers_question_id_idx" ON "answers"("question_id");

-- CreateIndex
CREATE INDEX "answers_status_idx" ON "answers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_slug_key" ON "blog_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_key" ON "blogs"("slug");

-- CreateIndex
CREATE INDEX "blogs_status_published_at_idx" ON "blogs"("status", "published_at");

-- CreateIndex
CREATE INDEX "blogs_category_id_idx" ON "blogs"("category_id");

-- CreateIndex
CREATE INDEX "blog_comments_blog_id_idx" ON "blog_comments"("blog_id");

-- CreateIndex
CREATE INDEX "blog_comments_parent_id_idx" ON "blog_comments"("parent_id");

-- CreateIndex
CREATE INDEX "blog_comments_status_idx" ON "blog_comments"("status");

-- CreateIndex
CREATE INDEX "faqs_category_sort_order_idx" ON "faqs"("category", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "cms_pages_slug_key" ON "cms_pages"("slug");

-- CreateIndex
CREATE INDEX "cms_pages_status_idx" ON "cms_pages"("status");

-- CreateIndex
CREATE INDEX "cms_page_translations_language_id_idx" ON "cms_page_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "cms_page_translations_page_id_language_id_key" ON "cms_page_translations"("page_id", "language_id");

-- CreateIndex
CREATE INDEX "marketing_campaigns_status_idx" ON "marketing_campaigns"("status");

-- CreateIndex
CREATE INDEX "marketing_campaigns_starts_at_ends_at_idx" ON "marketing_campaigns"("starts_at", "ends_at");

-- CreateIndex
CREATE INDEX "banners_placement_starts_at_ends_at_idx" ON "banners"("placement", "starts_at", "ends_at");

-- CreateIndex
CREATE INDEX "banners_landing_page_id_idx" ON "banners"("landing_page_id");

-- CreateIndex
CREATE INDEX "hero_sections_is_active_sort_order_idx" ON "hero_sections"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "hero_sections_landing_page_id_idx" ON "hero_sections"("landing_page_id");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referred_user_id_key" ON "referrals"("referred_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_code_key" ON "referrals"("code");

-- CreateIndex
CREATE INDEX "referrals_referrer_user_id_idx" ON "referrals"("referrer_user_id");

-- CreateIndex
CREATE INDEX "referrals_status_idx" ON "referrals"("status");

-- CreateIndex
CREATE INDEX "reward_points_user_id_created_at_idx" ON "reward_points"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "reward_points_reference_type_reference_id_idx" ON "reward_points"("reference_type", "reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "affiliates_user_id_key" ON "affiliates"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "affiliates_code_key" ON "affiliates"("code");

-- CreateIndex
CREATE INDEX "affiliates_status_idx" ON "affiliates"("status");

-- CreateIndex
CREATE INDEX "affiliate_clicks_affiliate_id_clicked_at_idx" ON "affiliate_clicks"("affiliate_id", "clicked_at");

-- CreateIndex
CREATE INDEX "affiliate_conversions_status_idx" ON "affiliate_conversions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_conversions_affiliate_id_order_id_key" ON "affiliate_conversions"("affiliate_id", "order_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_vendor_id_idx" ON "api_keys"("vendor_id");

-- CreateIndex
CREATE INDEX "api_keys_owner_user_id_idx" ON "api_keys"("owner_user_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_created_at_idx" ON "audit_logs"("actor_user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_created_at_idx" ON "activity_logs"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "security_logs_user_id_created_at_idx" ON "security_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "security_logs_risk_score_idx" ON "security_logs"("risk_score" DESC);

-- CreateIndex
CREATE INDEX "security_logs_event_type_idx" ON "security_logs"("event_type");

-- CreateIndex
CREATE INDEX "error_logs_severity_created_at_idx" ON "error_logs"("severity", "created_at");

-- CreateIndex
CREATE INDEX "error_logs_trace_id_idx" ON "error_logs"("trace_id");

-- CreateIndex
CREATE INDEX "error_logs_stack_hash_idx" ON "error_logs"("stack_hash");

-- CreateIndex
CREATE INDEX "api_key_usage_logs_api_key_id_created_at_idx" ON "api_key_usage_logs"("api_key_id", "created_at");

-- CreateIndex
CREATE INDEX "api_key_usage_logs_endpoint_idx" ON "api_key_usage_logs"("endpoint");

-- CreateIndex
CREATE INDEX "analytics_events_event_name_created_at_idx" ON "analytics_events"("event_name", "created_at");

-- CreateIndex
CREATE INDEX "analytics_events_user_id_created_at_idx" ON "analytics_events"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "reports_owner_user_id_idx" ON "reports"("owner_user_id");

-- CreateIndex
CREATE INDEX "reports_report_type_idx" ON "reports"("report_type");

-- CreateIndex
CREATE INDEX "dashboard_metrics_metric_key_window_start_idx" ON "dashboard_metrics"("metric_key", "window_start");

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_metrics_metric_key_dimension_key_dimension_value__key" ON "dashboard_metrics"("metric_key", "dimension_key", "dimension_value", "window_start", "window_end");

-- CreateIndex
CREATE INDEX "departments_vendor_id_idx" ON "departments"("vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_vendor_id_slug_key" ON "departments"("vendor_id", "slug");

-- CreateIndex
CREATE INDEX "vendor_employees_vendor_id_idx" ON "vendor_employees"("vendor_id");

-- CreateIndex
CREATE INDEX "vendor_employees_user_id_idx" ON "vendor_employees"("user_id");

-- CreateIndex
CREATE INDEX "vendor_employees_department_id_idx" ON "vendor_employees"("department_id");

-- CreateIndex
CREATE INDEX "vendor_employees_status_idx" ON "vendor_employees"("status");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_employees_vendor_id_user_id_key" ON "vendor_employees"("vendor_id", "user_id");

-- CreateIndex
CREATE INDEX "collections_store_id_idx" ON "collections"("store_id");

-- CreateIndex
CREATE INDEX "collections_status_idx" ON "collections"("status");

-- CreateIndex
CREATE UNIQUE INDEX "collections_store_id_slug_key" ON "collections"("store_id", "slug");

-- CreateIndex
CREATE INDEX "collection_products_product_id_idx" ON "collection_products"("product_id");

-- CreateIndex
CREATE INDEX "collection_products_collection_id_sort_order_idx" ON "collection_products"("collection_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "collection_products_collection_id_product_id_key" ON "collection_products"("collection_id", "product_id");

-- CreateIndex
CREATE INDEX "product_ar_models_product_id_idx" ON "product_ar_models"("product_id");

-- CreateIndex
CREATE INDEX "product_ar_models_format_idx" ON "product_ar_models"("format");

-- CreateIndex
CREATE INDEX "product_ar_models_platform_idx" ON "product_ar_models"("platform");

-- CreateIndex
CREATE INDEX "compare_lists_user_id_idx" ON "compare_lists"("user_id");

-- CreateIndex
CREATE INDEX "compare_items_product_id_idx" ON "compare_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "compare_items_compare_list_id_product_id_key" ON "compare_items"("compare_list_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "landing_pages_slug_key" ON "landing_pages"("slug");

-- CreateIndex
CREATE INDEX "landing_pages_status_idx" ON "landing_pages"("status");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_email_key" ON "newsletter_subscriptions"("email");

-- CreateIndex
CREATE INDEX "newsletter_subscriptions_user_id_idx" ON "newsletter_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "newsletter_subscriptions_status_idx" ON "newsletter_subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_vendor_id_idx" ON "subscriptions"("vendor_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_starts_at_idx" ON "subscriptions"("status", "starts_at");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");

-- CreateIndex
CREATE INDEX "feature_flags_enabled_idx" ON "feature_flags"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "application_settings_key_key" ON "application_settings"("key");

-- CreateIndex
CREATE INDEX "application_settings_is_public_idx" ON "application_settings"("is_public");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_preferred_language_id_fkey" FOREIGN KEY ("preferred_language_id") REFERENCES "languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_preferred_currency_id_fkey" FOREIGN KEY ("preferred_currency_id") REFERENCES "currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_users" ADD CONSTRAINT "vendor_users_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_users" ADD CONSTRAINT "vendor_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_default_currency_id_fkey" FOREIGN KEY ("default_currency_id") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_360_assets" ADD CONSTRAINT "product_360_assets_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_3d_models" ADD CONSTRAINT "product_3d_models_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_videos" ADD CONSTRAINT "product_videos_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_attribute_value_id_fkey" FOREIGN KEY ("attribute_value_id") REFERENCES "attribute_values"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_carts" ADD CONSTRAINT "shopping_carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "shopping_carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_wishlist_id_fkey" FOREIGN KEY ("wishlist_id") REFERENCES "wishlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recently_viewed_products" ADD CONSTRAINT "recently_viewed_products_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recently_viewed_products" ADD CONSTRAINT "recently_viewed_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_embeddings" ADD CONSTRAINT "product_embeddings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_chat_sessions" ADD CONSTRAINT "ai_chat_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "ai_chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_clicked_product_id_fkey" FOREIGN KEY ("clicked_product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_searches" ADD CONSTRAINT "voice_searches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_searches" ADD CONSTRAINT "voice_searches_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_searches" ADD CONSTRAINT "image_searches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_search_products" ADD CONSTRAINT "image_search_products_image_search_id_fkey" FOREIGN KEY ("image_search_id") REFERENCES "image_searches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_search_products" ADD CONSTRAINT "image_search_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_tax_rate_id_fkey" FOREIGN KEY ("tax_rate_id") REFERENCES "tax_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_card_transactions" ADD CONSTRAINT "gift_card_transactions_gift_card_id_fkey" FOREIGN KEY ("gift_card_id") REFERENCES "gift_cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_card_transactions" ADD CONSTRAINT "gift_card_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rates" ADD CONSTRAINT "tax_rates_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rates" ADD CONSTRAINT "tax_rates_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_zones" ADD CONSTRAINT "shipping_zones_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_zones" ADD CONSTRAINT "shipping_zones_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_shipping_method_id_fkey" FOREIGN KEY ("shipping_method_id") REFERENCES "shipping_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_events" ADD CONSTRAINT "tracking_events_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_return_id_fkey" FOREIGN KEY ("return_id") REFERENCES "returns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_messages" ADD CONSTRAINT "push_messages_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_images" ADD CONSTRAINT "review_images_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "blog_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "blog_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_page_translations" ADD CONSTRAINT "cms_page_translations_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "cms_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_page_translations" ADD CONSTRAINT "cms_page_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banners" ADD CONSTRAINT "banners_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "marketing_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banners" ADD CONSTRAINT "banners_landing_page_id_fkey" FOREIGN KEY ("landing_page_id") REFERENCES "landing_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_sections" ADD CONSTRAINT "hero_sections_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "marketing_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_sections" ADD CONSTRAINT "hero_sections_landing_page_id_fkey" FOREIGN KEY ("landing_page_id") REFERENCES "landing_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_user_id_fkey" FOREIGN KEY ("referrer_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_user_id_fkey" FOREIGN KEY ("referred_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_points" ADD CONSTRAINT "reward_points_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "affiliate_clicks_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_conversions" ADD CONSTRAINT "affiliate_conversions_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_conversions" ADD CONSTRAINT "affiliate_conversions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_logs" ADD CONSTRAINT "security_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key_usage_logs" ADD CONSTRAINT "api_key_usage_logs_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_employees" ADD CONSTRAINT "vendor_employees_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_employees" ADD CONSTRAINT "vendor_employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_employees" ADD CONSTRAINT "vendor_employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_products" ADD CONSTRAINT "collection_products_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_products" ADD CONSTRAINT "collection_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_ar_models" ADD CONSTRAINT "product_ar_models_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compare_lists" ADD CONSTRAINT "compare_lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compare_items" ADD CONSTRAINT "compare_items_compare_list_id_fkey" FOREIGN KEY ("compare_list_id") REFERENCES "compare_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compare_items" ADD CONSTRAINT "compare_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_cms_page_id_fkey" FOREIGN KEY ("cms_page_id") REFERENCES "cms_pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_subscriptions" ADD CONSTRAINT "newsletter_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Production search, JSONB, soft-delete, and AI vector indexes.
-- Prisma models define portable btree indexes; these direct SQL indexes use
-- PostgreSQL operator classes and partial predicates for production scale.
CREATE INDEX "users_email_active_idx" ON "users" ("email") WHERE "deleted_at" IS NULL;
CREATE INDEX "products_active_catalog_idx" ON "products" ("category_id", "status", "visibility", "created_at" DESC) WHERE "deleted_at" IS NULL;
CREATE INDEX "orders_user_recent_idx" ON "orders" ("user_id", "created_at" DESC);
CREATE INDEX "orders_store_recent_idx" ON "orders" ("store_id", "created_at" DESC);
CREATE INDEX "order_items_product_recent_idx" ON "order_items" ("product_id", "created_at" DESC);
CREATE INDEX "inventory_items_variant_available_idx" ON "inventory_items" ("variant_id", "available_quantity") WHERE "available_quantity" > 0;

CREATE INDEX "products_name_trgm_idx" ON "products" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "products_description_trgm_idx" ON "products" USING GIN ("description" gin_trgm_ops);
CREATE INDEX "products_catalog_fts_idx" ON "products" USING GIN (
  to_tsvector('english', coalesce("name", '') || ' ' || coalesce("description", ''))
);
CREATE INDEX "product_translations_fts_idx" ON "product_translations" USING GIN (
  to_tsvector('simple', coalesce("name", '') || ' ' || coalesce("description", ''))
);

CREATE INDEX "users_metadata_gin_idx" ON "users" USING GIN ("metadata");
CREATE INDEX "products_metadata_gin_idx" ON "products" USING GIN ("metadata");
CREATE INDEX "product_variants_metadata_gin_idx" ON "product_variants" USING GIN ("metadata");
CREATE INDEX "orders_metadata_gin_idx" ON "orders" USING GIN ("metadata");
CREATE INDEX "analytics_events_properties_gin_idx" ON "analytics_events" USING GIN ("properties");
CREATE INDEX "audit_logs_metadata_gin_idx" ON "audit_logs" USING GIN ("metadata");
CREATE INDEX "api_keys_scopes_gin_idx" ON "api_keys" USING GIN ("scopes");
CREATE INDEX "discount_rules_conditions_gin_idx" ON "discount_rules" USING GIN ("conditions");
CREATE INDEX "discount_rules_effects_gin_idx" ON "discount_rules" USING GIN ("effects");
CREATE INDEX "image_searches_detected_labels_gin_idx" ON "image_searches" USING GIN ("detected_labels");
CREATE INDEX "feature_flags_rules_gin_idx" ON "feature_flags" USING GIN ("rules");
CREATE INDEX "application_settings_value_gin_idx" ON "application_settings" USING GIN ("value");

CREATE INDEX "product_embeddings_embedding_hnsw_idx" ON "product_embeddings"
USING hnsw ("embedding" vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- Partitioning recommendation for large production installs:
-- convert analytics_events, api_key_usage_logs, activity_logs, security_logs,
-- error_logs, orders, and order_items to time/range partitions before first
-- high-volume launch. Keep parent-table shape identical to this migration.

