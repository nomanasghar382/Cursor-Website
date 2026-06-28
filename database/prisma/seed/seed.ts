import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { createPrismaClient } from "../client.js";

const SEED_TAG = "novaex-enterprise-seed";
const isDryRun = process.argv.includes("--dry-run");

const summary = {
  admins: 1,
  roles: 3,
  permissions: 18,
  vendors: 2,
  customers: 2,
  categories: 5,
  brands: 4,
  products: 4,
  variants: 8,
  assets3d: 4,
  coupons: 2,
  orders: 2,
  reviews: 2,
  analyticsEvents: 5,
};

if (isDryRun) {
  console.info("NOVAEX seed dry run passed.");
  console.info(JSON.stringify(summary, null, 2));
  process.exit(0);
}

const { prisma, pool } = createPrismaClient();

const addDays = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

async function ensureUserRole(userId: string, roleId: string, vendorId?: string, storeId?: string) {
  const existing = await prisma.userRole.findFirst({
    where: {
      userId,
      roleId,
      vendorId: vendorId ?? null,
      storeId: storeId ?? null,
      deletedAt: null,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.userRole.create({
    data: {
      userId,
      roleId,
      vendorId,
      storeId,
    },
  });
}

async function ensureCategory(input: {
  parentId?: string;
  name: string;
  slug: string;
  level: number;
  sortOrder: number;
  metadata?: Prisma.InputJsonObject;
}) {
  const existing = await prisma.category.findFirst({
    where: {
      parentId: input.parentId ?? null,
      slug: input.slug,
      deletedAt: null,
    },
  });

  if (existing) {
    return prisma.category.update({
      where: { id: existing.id },
      data: {
        name: input.name,
        level: input.level,
        sortOrder: input.sortOrder,
        isActive: true,
        metadata: input.metadata ?? { seededBy: SEED_TAG },
      },
    });
  }

  return prisma.category.create({
    data: {
      parentId: input.parentId,
      name: input.name,
      slug: input.slug,
      level: input.level,
      sortOrder: input.sortOrder,
      metadata: input.metadata ?? { seededBy: SEED_TAG },
    },
  });
}

async function ensureProductAsset(productId: string, kind: "image" | "model3d" | "asset360" | "ar", url: string, extra: Record<string, unknown>) {
  if (kind === "image") {
    const existing = await prisma.productImage.findFirst({ where: { productId, url } });
    return existing ?? prisma.productImage.create({ data: { productId, url, cloudinaryPublicId: String(extra.cloudinaryPublicId), altText: String(extra.altText), isPrimary: Boolean(extra.isPrimary), sortOrder: Number(extra.sortOrder ?? 0), metadata: { seededBy: SEED_TAG } } });
  }

  if (kind === "model3d") {
    const existing = await prisma.product3dModel.findFirst({ where: { productId, modelUrl: url } });
    return existing ?? prisma.product3dModel.create({ data: { productId, modelUrl: url, cloudinaryPublicId: String(extra.cloudinaryPublicId), format: String(extra.format), lodLevel: Number(extra.lodLevel ?? 0), fileSizeBytes: BigInt(String(extra.fileSizeBytes ?? 0)), metadata: { seededBy: SEED_TAG } } });
  }

  if (kind === "asset360") {
    const existing = await prisma.product360Asset.findFirst({ where: { productId, assetUrl: url } });
    return existing ?? prisma.product360Asset.create({ data: { productId, assetUrl: url, frameCount: Number(extra.frameCount), format: String(extra.format), sortOrder: Number(extra.sortOrder ?? 0), metadata: { seededBy: SEED_TAG } } });
  }

  const existing = await prisma.productArModel.findFirst({ where: { productId, modelUrl: url } });
  return existing ?? prisma.productArModel.create({ data: { productId, modelUrl: url, cloudinaryPublicId: String(extra.cloudinaryPublicId), format: String(extra.format), platform: String(extra.platform), fileSizeBytes: BigInt(String(extra.fileSizeBytes ?? 0)), metadata: { seededBy: SEED_TAG } } });
}

async function main() {
  const passwordHash = await hash("NOVAEX-Admin-2026!", 12);
  const customerPasswordHash = await hash("NOVAEX-Customer-2026!", 12);

  const [usd, aed, pkr] = await Promise.all([
    prisma.currency.upsert({ where: { code: "USD" }, update: { name: "US Dollar", symbol: "$", isActive: true }, create: { code: "USD", name: "US Dollar", symbol: "$" } }),
    prisma.currency.upsert({ where: { code: "AED" }, update: { name: "UAE Dirham", symbol: "AED", isActive: true }, create: { code: "AED", name: "UAE Dirham", symbol: "AED" } }),
    prisma.currency.upsert({ where: { code: "PKR" }, update: { name: "Pakistani Rupee", symbol: "Rs", isActive: true }, create: { code: "PKR", name: "Pakistani Rupee", symbol: "Rs" } }),
  ]);

  const [english, urdu, arabic] = await Promise.all([
    prisma.language.upsert({ where: { code: "en" }, update: { name: "English", direction: "LTR", isActive: true }, create: { code: "en", name: "English", direction: "LTR" } }),
    prisma.language.upsert({ where: { code: "ur" }, update: { name: "Urdu", direction: "RTL", isActive: true }, create: { code: "ur", name: "Urdu", direction: "RTL" } }),
    prisma.language.upsert({ where: { code: "ar" }, update: { name: "Arabic", direction: "RTL", isActive: true }, create: { code: "ar", name: "Arabic", direction: "RTL" } }),
  ]);

  const [us, ae, pk] = await Promise.all([
    prisma.country.upsert({ where: { iso2: "US" }, update: { name: "United States", iso3: "USA", phoneCode: "+1", isActive: true }, create: { iso2: "US", iso3: "USA", name: "United States", phoneCode: "+1" } }),
    prisma.country.upsert({ where: { iso2: "AE" }, update: { name: "United Arab Emirates", iso3: "ARE", phoneCode: "+971", isActive: true }, create: { iso2: "AE", iso3: "ARE", name: "United Arab Emirates", phoneCode: "+971" } }),
    prisma.country.upsert({ where: { iso2: "PK" }, update: { name: "Pakistan", iso3: "PAK", phoneCode: "+92", isActive: true }, create: { iso2: "PK", iso3: "PAK", name: "Pakistan", phoneCode: "+92" } }),
  ]);

  const [newYork, dubai, karachi] = await Promise.all([
    prisma.city.upsert({ where: { countryId_name_region: { countryId: us.id, name: "New York", region: "NY" } }, update: { isActive: true }, create: { countryId: us.id, name: "New York", region: "NY", postalCodePattern: "^[0-9]{5}$" } }),
    prisma.city.upsert({ where: { countryId_name_region: { countryId: ae.id, name: "Dubai", region: "Dubai" } }, update: { isActive: true }, create: { countryId: ae.id, name: "Dubai", region: "Dubai" } }),
    prisma.city.upsert({ where: { countryId_name_region: { countryId: pk.id, name: "Karachi", region: "Sindh" } }, update: { isActive: true }, create: { countryId: pk.id, name: "Karachi", region: "Sindh", postalCodePattern: "^[0-9]{5}$" } }),
  ]);

  const permissions = await Promise.all(
    ["users", "vendors", "stores", "products", "orders", "analytics", "settings", "content", "ai"].flatMap((resource) =>
      ["read", "write"].map((action) =>
        prisma.permission.upsert({
          where: { resource_action: { resource, action } },
          update: { name: `${resource}:${action}`, slug: `${resource}.${action}` },
          create: { name: `${resource}:${action}`, slug: `${resource}.${action}`, resource, action, description: `Allows ${action} access to ${resource}.` },
        }),
      ),
    ),
  );

  const [superAdminRole, vendorAdminRole, customerRole] = await Promise.all([
    prisma.role.upsert({ where: { slug: "super-admin" }, update: { name: "Super Admin", type: "SUPER_ADMIN", scope: "GLOBAL" }, create: { name: "Super Admin", slug: "super-admin", type: "SUPER_ADMIN", scope: "GLOBAL", description: "Full NOVAEX platform administration." } }),
    prisma.role.upsert({ where: { slug: "vendor-admin" }, update: { name: "Vendor Admin", type: "SELLER_ADMIN", scope: "VENDOR" }, create: { name: "Vendor Admin", slug: "vendor-admin", type: "SELLER_ADMIN", scope: "VENDOR", description: "Vendor operations and catalog management." } }),
    prisma.role.upsert({ where: { slug: "customer" }, update: { name: "Customer", type: "CUSTOMER", scope: "GLOBAL" }, create: { name: "Customer", slug: "customer", type: "CUSTOMER", scope: "GLOBAL", description: "Customer shopping account." } }),
  ]);

  await Promise.all(
    permissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: permission.id } },
        update: {},
        create: { roleId: superAdminRole.id, permissionId: permission.id },
      }),
    ),
  );

  const vendorPermissions = permissions.filter((permission) => ["stores", "products", "orders", "analytics", "content"].includes(permission.resource));
  await Promise.all(
    vendorPermissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: vendorAdminRole.id, permissionId: permission.id } },
        update: {},
        create: { roleId: vendorAdminRole.id, permissionId: permission.id },
      }),
    ),
  );

  const admin = await prisma.user.upsert({
    where: { email: "admin@novaex.ai" },
    update: { status: "ACTIVE", passwordHash, metadata: { seededBy: SEED_TAG, mfaRequired: true } },
    create: {
      email: "admin@novaex.ai",
      phone: "+15550100001",
      passwordHash,
      authProvider: "EMAIL",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      metadata: { seededBy: SEED_TAG, mfaRequired: true },
      profile: { create: { firstName: "Ariana", lastName: "Sterling", preferredLanguageId: english.id, preferredCurrencyId: usd.id, metadata: { seededBy: SEED_TAG } } },
    },
  });
  await ensureUserRole(admin.id, superAdminRole.id);

  const customerData = [
    { email: "maya.chen@example.com", phone: "+15550100011", firstName: "Maya", lastName: "Chen", countryId: us.id, cityId: newYork.id, currencyId: usd.id, address: "88 Madison Avenue" },
    { email: "ali.khan@example.pk", phone: "+923001000111", firstName: "Ali", lastName: "Khan", countryId: pk.id, cityId: karachi.id, currencyId: pkr.id, address: "45 Shahrah-e-Faisal" },
  ];

  const customers = [];
  for (const customer of customerData) {
    const user = await prisma.user.upsert({
      where: { email: customer.email },
      update: { status: "ACTIVE", passwordHash: customerPasswordHash },
      create: {
        email: customer.email,
        phone: customer.phone,
        passwordHash: customerPasswordHash,
        status: "ACTIVE",
        authProvider: "EMAIL",
        emailVerifiedAt: new Date(),
        metadata: { seededBy: SEED_TAG, segment: "early-access" },
        profile: { create: { firstName: customer.firstName, lastName: customer.lastName, preferredLanguageId: english.id, preferredCurrencyId: customer.currencyId, metadata: { seededBy: SEED_TAG } } },
      },
    });
    await ensureUserRole(user.id, customerRole.id);
    const existingAddress = await prisma.userAddress.findFirst({ where: { userId: user.id, line1: customer.address } });
    if (!existingAddress) {
      await prisma.userAddress.create({ data: { userId: user.id, countryId: customer.countryId, cityId: customer.cityId, label: "Home", recipientName: `${customer.firstName} ${customer.lastName}`, phone: customer.phone, line1: customer.address, postalCode: "10001", isDefault: true, metadata: { seededBy: SEED_TAG } } });
    }
    customers.push(user);
  }

  const vendors = [];
  for (const vendorInput of [
    { legalName: "NOVA Robotics Labs LLC", displayName: "NOVA Robotics", slug: "nova-robotics", currencyId: usd.id, countryId: us.id, cityId: newYork.id },
    { legalName: "Aether Home Technologies FZCO", displayName: "Aether Home", slug: "aether-home", currencyId: aed.id, countryId: ae.id, cityId: dubai.id },
  ]) {
    const vendor = await prisma.vendor.upsert({
      where: { legalName: vendorInput.legalName },
      update: { displayName: vendorInput.displayName, status: "ACTIVE", kycStatus: "VERIFIED" },
      create: { legalName: vendorInput.legalName, displayName: vendorInput.displayName, status: "ACTIVE", kycStatus: "VERIFIED", metadata: { seededBy: SEED_TAG, payoutSchedule: "weekly" } },
    });
    const store = await prisma.store.upsert({
      where: { slug: vendorInput.slug },
      update: { name: vendorInput.displayName, status: "ACTIVE" },
      create: { vendorId: vendor.id, defaultCurrencyId: vendorInput.currencyId, name: vendorInput.displayName, slug: vendorInput.slug, description: `${vendorInput.displayName} premium AI commerce storefront.`, status: "ACTIVE", metadata: { seededBy: SEED_TAG } },
    });
    const warehouse = await prisma.warehouse.findFirst({ where: { storeId: store.id, name: `${vendorInput.displayName} Fulfillment Hub` } });
    if (!warehouse) {
      await prisma.warehouse.create({ data: { storeId: store.id, countryId: vendorInput.countryId, cityId: vendorInput.cityId, name: `${vendorInput.displayName} Fulfillment Hub`, addressLine1: "Enterprise Fulfillment District", status: "active", metadata: { seededBy: SEED_TAG } } });
    }
    const department = await prisma.department.upsert({ where: { vendorId_slug: { vendorId: vendor.id, slug: "commerce-ops" } }, update: { name: "Commerce Operations" }, create: { vendorId: vendor.id, name: "Commerce Operations", slug: "commerce-ops", metadata: { seededBy: SEED_TAG } } });
    await ensureUserRole(admin.id, vendorAdminRole.id, vendor.id, store.id);
    await prisma.vendorUser.upsert({ where: { vendorId_userId: { vendorId: vendor.id, userId: admin.id } }, update: { isOwner: true, title: "Executive Operator" }, create: { vendorId: vendor.id, userId: admin.id, isOwner: true, title: "Executive Operator" } });
    await prisma.vendorEmployee.upsert({ where: { vendorId_userId: { vendorId: vendor.id, userId: admin.id } }, update: { departmentId: department.id, title: "Executive Operator", status: "active" }, create: { vendorId: vendor.id, userId: admin.id, departmentId: department.id, title: "Executive Operator", status: "active", hiredAt: new Date(), metadata: { seededBy: SEED_TAG } } });
    vendors.push({ vendor, store });
  }

  const [electronics, robotics, smartHome, wearables, audio] = await Promise.all([
    ensureCategory({ name: "Electronics", slug: "electronics", level: 0, sortOrder: 1 }),
    ensureCategory({ name: "Robotics", slug: "robotics", level: 0, sortOrder: 2 }),
    ensureCategory({ name: "Smart Home", slug: "smart-home", level: 0, sortOrder: 3 }),
    ensureCategory({ name: "Wearables", slug: "wearables", level: 0, sortOrder: 4 }),
    ensureCategory({ name: "Immersive Audio", slug: "immersive-audio", level: 0, sortOrder: 5 }),
  ]);

  await Promise.all([
    prisma.categoryTranslation.upsert({ where: { categoryId_languageId: { categoryId: electronics.id, languageId: urdu.id } }, update: { name: "الیکٹرانکس", description: "AI-powered electronics." }, create: { categoryId: electronics.id, languageId: urdu.id, name: "الیکٹرانکس", description: "AI-powered electronics." } }),
    prisma.categoryTranslation.upsert({ where: { categoryId_languageId: { categoryId: smartHome.id, languageId: arabic.id } }, update: { name: "المنزل الذكي", description: "Connected living technology." }, create: { categoryId: smartHome.id, languageId: arabic.id, name: "المنزل الذكي", description: "Connected living technology." } }),
  ]);

  const brandInputs = [
    { name: "NOVAEX Labs", slug: "novaex-labs" },
    { name: "AetherSense", slug: "aethersense" },
    { name: "OrbitWave", slug: "orbitwave" },
    { name: "LumaCore", slug: "lumacore" },
  ];
  const brands = await Promise.all(brandInputs.map((brand) => prisma.brand.upsert({ where: { slug: brand.slug }, update: { name: brand.name, isVerified: true }, create: { ...brand, isVerified: true, metadata: { seededBy: SEED_TAG } } })));

  const products = [];
  const productInputs = [
    { storeId: vendors[0].store.id, brandId: brands[0].id, categoryId: robotics.id, name: "NOVA Butler X1 Home Robot", slug: "nova-butler-x1", description: "Autonomous AI home assistant robot with spatial awareness, voice control, and smart cart refill recommendations.", price: "1299.00", aiScore: "97.50", skuBase: "NBX1" },
    { storeId: vendors[0].store.id, brandId: brands[2].id, categoryId: audio.id, name: "OrbitWave Neural Pods Pro", slug: "orbitwave-neural-pods-pro", description: "Adaptive spatial audio earbuds with real-time noise modeling and AI translated calling.", price: "249.00", aiScore: "94.10", skuBase: "OWP" },
    { storeId: vendors[1].store.id, brandId: brands[1].id, categoryId: smartHome.id, name: "AetherSense Climate Hub", slug: "aethersense-climate-hub", description: "Predictive climate controller that optimizes comfort and energy using occupancy and weather intelligence.", price: "399.00", aiScore: "92.75", skuBase: "ASH" },
    { storeId: vendors[1].store.id, brandId: brands[3].id, categoryId: wearables.id, name: "LumaCore Health Ring Elite", slug: "lumacore-health-ring-elite", description: "Titanium health ring with sleep, recovery, readiness, ECG trend, and AI coaching insights.", price: "319.00", aiScore: "95.25", skuBase: "LHR" },
  ];

  for (const input of productInputs) {
    const product = await prisma.product.upsert({
      where: { storeId_slug: { storeId: input.storeId, slug: input.slug } },
      update: { name: input.name, description: input.description, status: "ACTIVE", visibility: "PUBLIC", basePrice: input.price, aiScore: input.aiScore },
      create: { storeId: input.storeId, brandId: input.brandId, categoryId: input.categoryId, name: input.name, slug: input.slug, description: input.description, status: "ACTIVE", visibility: "PUBLIC", basePrice: input.price, currencyCode: "USD", aiScore: input.aiScore, metadata: { seededBy: SEED_TAG, aiTags: ["future-commerce", "premium", "3d-ready"] } },
    });
    await prisma.productTranslation.upsert({ where: { productId_languageId: { productId: product.id, languageId: english.id } }, update: { name: input.name, description: input.description }, create: { productId: product.id, languageId: english.id, name: input.name, description: input.description, seoTitle: `${input.name} | NOVAEX`, seoDescription: input.description.slice(0, 155) } });
    for (const suffix of ["BASE", "PREMIUM"]) {
      const sku = `${input.skuBase}-${suffix}`;
      await prisma.productVariant.upsert({ where: { sku }, update: { status: "ACTIVE", price: suffix === "BASE" ? input.price : String(Number(input.price) + 80), compareAtPrice: suffix === "PREMIUM" ? String(Number(input.price) + 120) : null }, create: { productId: product.id, sku, barcode: `880${input.skuBase}${suffix}`.replace(/[^0-9A-Z]/g, ""), price: suffix === "BASE" ? input.price : String(Number(input.price) + 80), compareAtPrice: suffix === "PREMIUM" ? String(Number(input.price) + 120) : null, currencyCode: "USD", weightGrams: suffix === "BASE" ? 420 : 520, status: "ACTIVE", metadata: { seededBy: SEED_TAG, edition: suffix.toLowerCase() } } });
    }
    await ensureProductAsset(product.id, "image", `https://cdn.novaex.ai/products/${input.slug}/hero.webp`, { cloudinaryPublicId: `novaex/${input.slug}/hero`, altText: `${input.name} hero image`, isPrimary: true });
    await ensureProductAsset(product.id, "model3d", `https://cdn.novaex.ai/products/${input.slug}/model.glb`, { cloudinaryPublicId: `novaex/${input.slug}/model`, format: "glb", lodLevel: 0, fileSizeBytes: 4800000 });
    await ensureProductAsset(product.id, "asset360", `https://cdn.novaex.ai/products/${input.slug}/spin-360.zip`, { format: "webp", frameCount: 72 });
    await ensureProductAsset(product.id, "ar", `https://cdn.novaex.ai/products/${input.slug}/ar.usdz`, { cloudinaryPublicId: `novaex/${input.slug}/ar`, format: "usdz", platform: "ios", fileSizeBytes: 3600000 });
    await prisma.productSpecification.upsert({ where: { productId_specKey: { productId: product.id, specKey: "AI Engine" } }, update: { specValue: "NOVAEX Neural Commerce Core" }, create: { productId: product.id, specKey: "AI Engine", specValue: "NOVAEX Neural Commerce Core", sortOrder: 1 } });
    products.push(product);
  }

  const collection = await prisma.collection.upsert({ where: { storeId_slug: { storeId: vendors[0].store.id, slug: "future-home-essentials" } }, update: { name: "Future Home Essentials", status: "PUBLISHED" }, create: { storeId: vendors[0].store.id, name: "Future Home Essentials", slug: "future-home-essentials", description: "AI products designed for a premium connected home.", status: "PUBLISHED", metadata: { seededBy: SEED_TAG } } });
  for (const [index, product] of products.entries()) {
    await prisma.collectionProduct.upsert({ where: { collectionId_productId: { collectionId: collection.id, productId: product.id } }, update: { sortOrder: index }, create: { collectionId: collection.id, productId: product.id, sortOrder: index } });
  }

  const warehouse = await prisma.warehouse.findFirstOrThrow({ where: { storeId: vendors[0].store.id } });
  const variants = await prisma.productVariant.findMany({ where: { productId: { in: products.map((product) => product.id) } } });
  for (const variant of variants) {
    await prisma.inventoryItem.upsert({ where: { variantId_warehouseId: { warehouseId: warehouse.id, variantId: variant.id } }, update: { reservedQuantity: 12, availableQuantity: 188, reorderLevel: 25 }, create: { warehouseId: warehouse.id, variantId: variant.id, reservedQuantity: 12, availableQuantity: 188, reorderLevel: 25 } });
  }

  await Promise.all([
    prisma.coupon.upsert({ where: { code: "NOVAEXVIP20" }, update: { status: "ACTIVE", discountValue: "20.00" }, create: { code: "NOVAEXVIP20", discountType: "PERCENTAGE", discountValue: "20.00", startsAt: addDays(-1), endsAt: addDays(90), usageLimit: 5000, perUserLimit: 2, status: "ACTIVE", metadata: { seededBy: SEED_TAG, audience: "vip-launch" } } }),
    prisma.coupon.upsert({ where: { code: "FREESHIPAI" }, update: { status: "ACTIVE", discountValue: "0.00" }, create: { code: "FREESHIPAI", discountType: "FREE_SHIPPING", discountValue: "0.00", startsAt: addDays(-1), endsAt: addDays(60), usageLimit: 10000, perUserLimit: 3, status: "ACTIVE", metadata: { seededBy: SEED_TAG, audience: "all-customers" } } }),
  ]);

  const taxRate = await prisma.taxRate.findFirst({ where: { countryId: us.id, taxName: "NY Digital Commerce Tax" } }) ?? await prisma.taxRate.create({ data: { countryId: us.id, cityId: newYork.id, taxName: "NY Digital Commerce Tax", rate: "0.08875", validFrom: addDays(-30) } });
  await prisma.shippingMethod.upsert({ where: { id: "11111111-1111-4111-8111-111111111111" }, update: { isActive: true }, create: { id: "11111111-1111-4111-8111-111111111111", name: "NOVAEX Priority Air", carrier: "NOVAEX Logistics", serviceLevel: "priority-air", basePrice: "19.95", currencyCode: "USD", isActive: true, metadata: { seededBy: SEED_TAG } } });

  for (const [index, customer] of customers.entries()) {
    const product = products[index];
    const variant = variants.find((candidate) => candidate.productId === product.id);
    if (!variant) continue;
    const order = await prisma.order.upsert({
      where: { orderNumber: `NX-2026-000${index + 1}` },
      update: { status: "DELIVERED" },
      create: { orderNumber: `NX-2026-000${index + 1}`, userId: customer.id, storeId: product.storeId, status: "DELIVERED", currencyCode: "USD", subtotal: variant.price, taxTotal: "11.10", shippingTotal: "19.95", discountTotal: "20.00", grandTotal: String(Number(variant.price) + 11.1 + 19.95 - 20), metadata: { seededBy: SEED_TAG, channel: "web" } },
    });
    const existingItem = await prisma.orderItem.findFirst({ where: { orderId: order.id, productId: product.id } });
    const orderItem = existingItem ?? await prisma.orderItem.create({ data: { orderId: order.id, productId: product.id, variantId: variant.id, productNameSnapshot: product.name, skuSnapshot: variant.sku, unitPrice: variant.price, quantity: 1, taxAmount: "11.10", discountAmount: "20.00", lineTotal: String(Number(variant.price) - 8.9), taxRateId: taxRate.id } });
    const payment = await prisma.payment.upsert({ where: { gateway_gatewayPaymentId: { gateway: "STRIPE", gatewayPaymentId: `pi_novaex_seed_${index + 1}` } }, update: { status: "CAPTURED" }, create: { orderId: order.id, gateway: "STRIPE", gatewayPaymentId: `pi_novaex_seed_${index + 1}`, status: "CAPTURED", amount: order.grandTotal, currencyCode: "USD", metadata: { seededBy: SEED_TAG } } });
    await prisma.paymentTransaction.upsert({ where: { gatewayTransactionId: `txn_novaex_seed_${index + 1}` }, update: { status: "CAPTURED" }, create: { paymentId: payment.id, transactionType: "CAPTURE", gatewayTransactionId: `txn_novaex_seed_${index + 1}`, amount: order.grandTotal, status: "CAPTURED", rawResponse: { seededBy: SEED_TAG, gateway: "stripe" } } });
    await prisma.invoice.upsert({ where: { invoiceNumber: `INV-NX-2026-000${index + 1}` }, update: { status: "PUBLISHED" }, create: { orderId: order.id, invoiceNumber: `INV-NX-2026-000${index + 1}`, status: "PUBLISHED", issuedAt: new Date() } });
    await prisma.review.upsert({ where: { orderItemId: orderItem.id }, update: { rating: 5, status: "APPROVED" }, create: { userId: customer.id, productId: product.id, orderItemId: orderItem.id, rating: 5, title: "Premium experience from discovery to delivery", body: "The 3D preview and AI recommendations made this purchase easy and confident.", status: "APPROVED", metadata: { seededBy: SEED_TAG } } });
    await prisma.analyticsEvent.create({ data: { userId: customer.id, eventName: "seed_order_completed", productId: product.id, orderId: order.id, sessionId: `seed-session-${index + 1}`, properties: { seededBy: SEED_TAG, revenue: order.grandTotal, currency: "USD" } } });
  }

  await Promise.all([
    prisma.featureFlag.upsert({ where: { key: "ai.shopping_assistant" }, update: { enabled: true }, create: { key: "ai.shopping_assistant", description: "Enable AI shopping assistant recommendations.", enabled: true, rules: { rolloutPercent: 100 }, metadata: { seededBy: SEED_TAG } } }),
    prisma.featureFlag.upsert({ where: { key: "catalog.3d_viewer" }, update: { enabled: true }, create: { key: "catalog.3d_viewer", description: "Enable 3D/AR product viewer.", enabled: true, rules: { devices: ["desktop", "mobile"] }, metadata: { seededBy: SEED_TAG } } }),
    prisma.applicationSetting.upsert({ where: { key: "storefront.default_locale" }, update: { value: { language: "en", currency: "USD" } }, create: { key: "storefront.default_locale", value: { language: "en", currency: "USD" }, isPublic: true, metadata: { seededBy: SEED_TAG } } }),
    prisma.newsletterSubscription.upsert({ where: { email: "maya.chen@example.com" }, update: { status: "subscribed" }, create: { email: "maya.chen@example.com", userId: customers[0].id, status: "subscribed", source: "checkout", metadata: { seededBy: SEED_TAG } } }),
    prisma.subscription.upsert({ where: { id: "22222222-2222-4222-8222-222222222222" }, update: { status: "active" }, create: { id: "22222222-2222-4222-8222-222222222222", vendorId: vendors[0].vendor.id, planKey: "enterprise-seller", status: "active", startsAt: new Date(), metadata: { seededBy: SEED_TAG } } }),
  ]);

  await prisma.analyticsEvent.createMany({
    data: [
      { eventName: "seed_catalog_viewed", productId: products[0].id, properties: { seededBy: SEED_TAG, source: "home_hero" } },
      { eventName: "seed_ai_recommendation_seen", productId: products[1].id, properties: { seededBy: SEED_TAG, model: "novaex-rec-v1" } },
      { eventName: "seed_3d_asset_opened", productId: products[2].id, properties: { seededBy: SEED_TAG, assetType: "glb" } },
    ],
  });

  console.info("NOVAEX enterprise seed completed.");
  console.info(JSON.stringify(summary, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
