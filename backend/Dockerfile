FROM node:24-alpine AS base
# Retry npm downloads on flaky networks (common on Windows Docker builds).
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000

FROM base AS dependencies
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci

FROM dependencies AS build
COPY backend/ ./
COPY database/package*.json /database/
RUN cd /database && npm ci
COPY database/ /database/
RUN cd /database && DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public" npx prisma generate
RUN npm run build

FROM base AS runtime
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
COPY database/package*.json /database/
RUN cd /database && npm ci
COPY --from=build /database/prisma /database/prisma
COPY --from=build /database/prisma.config.ts /database/prisma.config.ts
RUN sed -i 's/\r$//' ./docker-entrypoint.sh && chmod +x ./docker-entrypoint.sh
ENV HOST=0.0.0.0
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=5 \
  CMD /bin/sh -c 'curl -fsS "http://127.0.0.1:${PORT:-4000}/api/v1/health/live" || exit 1'
ENTRYPOINT ["/bin/sh", "./docker-entrypoint.sh"]
