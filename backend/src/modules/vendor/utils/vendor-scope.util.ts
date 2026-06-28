import { ForbiddenException } from "@nestjs/common";
import { AuthenticatedUser } from "../../../common/types/authenticated-user.type";

export function resolveVendorStoreIds(user: AuthenticatedUser, storeId?: string) {
  const allowed = user.storeIds ?? [];
  if (allowed.length === 0) {
    throw new ForbiddenException("No vendor store access is assigned to this account.");
  }
  if (storeId) {
    if (!allowed.includes(storeId)) {
      throw new ForbiddenException("You do not have access to this store.");
    }
    return [storeId];
  }
  return allowed;
}

export function assertVendorRole(user: AuthenticatedUser) {
  const vendorRoles = new Set(["vendor-admin", "seller", "seller-admin", "super-admin"]);
  if (!user.roles.some((role) => vendorRoles.has(role))) {
    throw new ForbiddenException("Vendor access is required.");
  }
}
