import { createRedisClientOptions, resolveRedisSettings } from "./redis-connection.util";

describe("resolveRedisSettings", () => {
  it("parses REDIS_URL for Railway", () => {
    const settings = resolveRedisSettings({
      REDIS_URL: "redis://default:secret@redis.railway.internal:6379",
      REDIS_HOST: "localhost",
      REDIS_PORT: 6379,
    });

    expect(settings.host).toBe("redis.railway.internal");
    expect(settings.port).toBe(6379);
    expect(settings.password).toBe("secret");
    expect(settings.url).toContain("family=0");
  });

  it("falls back to host and port when REDIS_URL is missing", () => {
    const settings = resolveRedisSettings({
      REDIS_HOST: "127.0.0.1",
      REDIS_PORT: 6380,
      REDIS_PASSWORD: "local",
    });

    expect(settings).toEqual({
      host: "127.0.0.1",
      port: 6380,
      password: "local",
    });
  });
});

describe("createRedisClientOptions", () => {
  it("returns URL string when REDIS_URL is configured", () => {
    const options = createRedisClientOptions({
      url: "redis://default:secret@redis.railway.internal:6379?family=0",
      host: "redis.railway.internal",
      port: 6379,
      password: "secret",
    });

    expect(options).toBe("redis://default:secret@redis.railway.internal:6379?family=0");
  });
});
