import { useAuthStore } from "./auth-store";

describe("auth store", () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, user: null, hydrated: false });
  });

  it("stores session data", () => {
    useAuthStore.getState().setSession({
      accessToken: "token-1",
      user: {
        id: "user-1",
        email: "user@novaex.ai",
        name: "Nova User",
        role: "customer",
        roles: ["customer"],
        permissions: [],
        emailVerified: true,
        status: "ACTIVE",
      },
    });

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe("token-1");
    expect(state.user?.email).toBe("user@novaex.ai");
  });

  it("clears session", () => {
    useAuthStore.getState().setSession({
      accessToken: "token-1",
      user: {
        id: "user-1",
        email: "user@novaex.ai",
        name: "Nova User",
        role: "customer",
        roles: ["customer"],
        permissions: [],
        emailVerified: true,
        status: "ACTIVE",
      },
    });
    useAuthStore.getState().clearSession();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
