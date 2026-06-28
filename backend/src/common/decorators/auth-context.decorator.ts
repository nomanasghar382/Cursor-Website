import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthRequestContext } from "../types/auth-context.type";

export const AuthContext = createParamDecorator((_data: unknown, context: ExecutionContext): AuthRequestContext => {
  const request = context.switchToHttp().getRequest<{ authContext: AuthRequestContext }>();
  return request.authContext;
});
