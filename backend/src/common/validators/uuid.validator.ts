import { validate as validateUuid } from "uuid";

export function isUuid(value: string): boolean {
  return validateUuid(value);
}
