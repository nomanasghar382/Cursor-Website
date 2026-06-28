import { AuthorizationService } from "./authorization.service";
import { AuthorizationRepository } from "../repositories/authorization.repository";

describe("AuthorizationService", () => {
  const authorizationRepository = {
    listRoles: jest.fn(),
    listPermissions: jest.fn(),
    assignPermission: jest.fn(),
  } as unknown as AuthorizationRepository;

  const service = new AuthorizationService(authorizationRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("maps roles with permission slugs", async () => {
    (authorizationRepository.listRoles as jest.Mock).mockResolvedValue([
      {
        id: "role-1",
        name: "Admin",
        slug: "admin",
        type: "SYSTEM",
        scope: "GLOBAL",
        rolePermissions: [{ permission: { resource: "products", action: "manage" } }],
      },
    ]);

    const roles = await service.listRoles();
    expect(roles[0]).toMatchObject({
      slug: "admin",
      permissions: ["products:manage"],
    });
  });

  it("lists permissions in API shape", async () => {
    (authorizationRepository.listPermissions as jest.Mock).mockResolvedValue([
      {
        id: "perm-1",
        name: "Manage Products",
        slug: "products.manage",
        resource: "products",
        action: "manage",
      },
    ]);

    const permissions = await service.listPermissions();
    expect(permissions[0]).toMatchObject({ resource: "products", action: "manage" });
  });

  it("delegates permission assignment", async () => {
    (authorizationRepository.assignPermission as jest.Mock).mockResolvedValue({ id: "link-1" });
    await service.assignPermission("role-1", "perm-1");
    expect(authorizationRepository.assignPermission).toHaveBeenCalledWith("role-1", "perm-1");
  });
});
