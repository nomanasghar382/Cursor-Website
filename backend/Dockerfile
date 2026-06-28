FROM node:24-alpine AS dependencies
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci

FROM node:24-alpine AS database-deps
WORKDIR /database
COPY database/package*.json ./
# Prisma CLI + tsx are required at container startup for migrate/seed.
RUN npm ci

FROM dependencies AS build
COPY backend/ ./
COPY database/ /database/
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache curl
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/prisma ./node_modules/prisma
COPY --from=build /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=build /app/scripts/docker-entrypoint.sh ./docker-entrypoint.sh
COPY database/ /database/
COPY --from=database-deps /database/node_modules /database/node_modules
# Strip Windows CRLF so Alpine can execute the script (avoids "no such file or directory").
RUN sed -i 's/\r$//' ./docker-entrypoint.sh && chmod +x ./docker-entrypoint.sh
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://127.0.0.1:4000/api/v1/health/live || exit 1
ENTRYPOINT ["/bin/sh", "./docker-entrypoint.sh"]
