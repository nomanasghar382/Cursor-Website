import { BadRequestException } from "@nestjs/common";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 24;

export function parseLimit(value: unknown): number {
  if (value === undefined || value === null || value === "") {
    return DEFAULT_LIMIT;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new BadRequestException("limit must be a positive integer.");
  }

  return Math.min(parsed, MAX_LIMIT);
}

export function encodeCursor(id: string): string {
  return Buffer.from(id, "utf8").toString("base64url");
}

export function decodeCursor(cursor?: string): string | undefined {
  if (!cursor) {
    return undefined;
  }

  try {
    return Buffer.from(cursor, "base64url").toString("utf8");
  } catch {
    throw new BadRequestException("cursor is invalid.");
  }
}
