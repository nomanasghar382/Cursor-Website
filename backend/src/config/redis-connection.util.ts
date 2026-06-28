import type { RedisOptions } from "ioredis";

export interface RedisConnectionSettings {
  url?: string;
  host: string;
  port: number;
  password?: string;
}

export function resolveRedisSettings(env: {
  REDIS_URL?: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
}): RedisConnectionSettings {
  if (env.REDIS_URL) {
    const parsed = new URL(env.REDIS_URL);
    return {
      url: withRedisFamily(env.REDIS_URL),
      host: parsed.hostname,
      port: Number(parsed.port || 6379),
      password: parsed.password || undefined,
    };
  }

  return {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
  };
}

function withRedisFamily(redisUrl: string): string {
  const parsed = new URL(redisUrl);
  if (!parsed.searchParams.has("family")) {
    parsed.searchParams.set("family", "0");
  }
  return parsed.toString();
}

export function createRedisClientOptions(settings: RedisConnectionSettings): string | RedisOptions {
  if (settings.url) {
    return settings.url;
  }

  return {
    host: settings.host,
    port: settings.port,
    password: settings.password,
    family: 0,
  };
}
