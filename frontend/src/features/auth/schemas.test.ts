import { forgotPasswordSchema, loginSchema, registerSchema } from "./schemas";

describe("auth schemas", () => {
  it("validates login credentials", () => {
    const valid = loginSchema.safeParse({
      email: "user@novaex.ai",
      password: "password1",
      rememberMe: true,
    });
    expect(valid.success).toBe(true);
  });

  it("rejects invalid login email", () => {
    const result = loginSchema.safeParse({ email: "bad", password: "password1" });
    expect(result.success).toBe(false);
  });

  it("enforces strong registration passwords", () => {
    const weak = registerSchema.safeParse({
      firstName: "Nova",
      lastName: "User",
      email: "user@novaex.ai",
      password: "weakpassword",
    });
    expect(weak.success).toBe(false);

    const strong = registerSchema.safeParse({
      firstName: "Nova",
      lastName: "User",
      email: "user@novaex.ai",
      password: "Novaex!Secure123",
    });
    expect(strong.success).toBe(true);
  });

  it("validates forgot password email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "user@novaex.ai" });
    expect(result.success).toBe(true);
  });
});
