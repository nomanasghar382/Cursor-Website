const fs = require("node:fs");
const path = require("node:path");

const backendRoot = path.resolve(__dirname, "..");
const sourceSchema = path.resolve(backendRoot, "../database/prisma/schema.prisma");
const generatedDir = path.resolve(backendRoot, ".generated/prisma");
const generatedSchema = path.join(generatedDir, "schema.prisma");

const schema = fs.readFileSync(sourceSchema, "utf8");
const prepared = schema.replace(
  'generator client {\n  provider = "prisma-client-js"\n}',
  'generator client {\n  provider = "prisma-client-js"\n  output   = "../../node_modules/.prisma/client"\n}',
);

fs.mkdirSync(generatedDir, { recursive: true });
fs.writeFileSync(generatedSchema, prepared);
console.info(`Prepared Prisma schema from ${sourceSchema}`);
