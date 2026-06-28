import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:4000/api/v1"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
