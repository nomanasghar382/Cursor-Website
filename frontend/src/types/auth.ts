export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  roles: string[];
  permissions: string[];
  emailVerified: boolean;
  status: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  token: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
  rememberMe?: boolean;
  audience?: "customer" | "vendor" | "admin" | "super-admin";
  mfaCode?: string;
  trustDevice?: boolean;
};

export type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
};
