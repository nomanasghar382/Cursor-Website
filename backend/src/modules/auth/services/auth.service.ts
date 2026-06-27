import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import { PasswordService } from "../../security/services/password.service";
import { TokenService } from "../../security/services/token.service";
import { LoginDto } from "../dto/login.dto";
import { RegisterDto } from "../dto/register.dto";
import { AuthRepository } from "../repositories/auth.repository";

type UserWithRbac = Awaited<ReturnType<AuthRepository["findUserByEmail"]>>;

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.authRepository.findUserByEmail(dto.email);
    if (existing) {
      throw new ConflictException("Email is already registered.");
    }

    const passwordHash = await this.passwordService.hashPassword(dto.password);
    const user = await this.authRepository.createCustomer({ ...dto, passwordHash });
    await this.authRepository.attachCustomerRole(user.id);
    const enrichedUser = await this.authRepository.findUserById(user.id);
    return this.issueSession(enrichedUser);
  }

  async login(dto: LoginDto) {
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user?.passwordHash || user.status !== "ACTIVE") {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const validPassword = await this.passwordService.verifyPassword(dto.password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    return this.issueSession(user);
  }

  async demo() {
    const user = await this.authRepository.findUserByEmail("admin@novaex.ai");
    if (!user) {
      throw new UnauthorizedException("Demo admin is not seeded.");
    }
    return this.issueSession(user);
  }

  me(userId: string) {
    return this.authRepository.findUserById(userId).then((user) => {
      if (!user) {
        throw new UnauthorizedException("User not found.");
      }
      return { user: this.toSafeUser(user) };
    });
  }

  private async issueSession(user: UserWithRbac) {
    if (!user) {
      throw new UnauthorizedException("User not found.");
    }

    const claims = this.toClaims(user);
    const accessToken = await this.tokenService.signAccessToken(claims);
    const refresh = await this.tokenService.signRefreshToken(user.id, randomUUID());
    await this.authRepository.createRefreshToken({
      userId: user.id,
      tokenHash: this.hashToken(refresh.token),
      familyId: refresh.familyId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return {
      token: accessToken,
      accessToken,
      refreshToken: refresh.token,
      user: this.toSafeUser(user),
    };
  }

  private toClaims(user: NonNullable<UserWithRbac>) {
    const roles = user.roles.map((userRole) => userRole.role.slug);
    const permissions = Array.from(
      new Set(user.roles.flatMap((userRole) => userRole.role.rolePermissions.map((rolePermission) => `${rolePermission.permission.resource}:${rolePermission.permission.action}`))),
    );

    return {
      sub: user.id,
      email: user.email,
      roles,
      permissions,
      vendorIds: user.roles.flatMap((role) => (role.vendorId ? [role.vendorId] : [])),
      storeIds: user.roles.flatMap((role) => (role.storeId ? [role.storeId] : [])),
    };
  }

  private toSafeUser(user: NonNullable<UserWithRbac>) {
    return {
      id: user.id,
      email: user.email,
      role: user.roles[0]?.role.slug ?? "customer",
      roles: user.roles.map((userRole) => userRole.role.slug),
      permissions: this.toClaims(user).permissions,
      name: [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(" ") || user.email,
    };
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
