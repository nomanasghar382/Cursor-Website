export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  vendorIds: string[];
  storeIds: string[];
}

export interface JwtAccessPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
  vendorIds: string[];
  storeIds: string[];
  tokenType: "access";
}

export interface JwtRefreshPayload {
  sub: string;
  familyId: string;
  tokenType: "refresh";
}
