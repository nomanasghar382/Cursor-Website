import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./login-form";

const push = jest.fn();
const setSession = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    message: jest.fn(),
  },
}));

jest.mock("@/lib/api/auth", () => ({
  authApi: {
    login: jest.fn(),
  },
}));

jest.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (state: { setSession: typeof setSession }) => unknown) =>
    selector({ setSession }),
}));

import { authApi } from "@/lib/api/auth";

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows validation errors for invalid credentials", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it("submits valid credentials and stores session", async () => {
    (authApi.login as jest.Mock).mockResolvedValue({
      accessToken: "access-token",
      user: { id: "user-1", email: "user@novaex.ai" },
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "user@novaex.ai");
    await user.type(screen.getByLabelText(/password/i), "password1234");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalled();
      expect(setSession).toHaveBeenCalledWith({
        accessToken: "access-token",
        user: { id: "user-1", email: "user@novaex.ai" },
      });
      expect(push).toHaveBeenCalledWith("/account");
    });
  });
});
