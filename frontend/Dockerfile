FROM node:24-alpine AS dependencies
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci

FROM dependencies AS build
COPY frontend/ ./
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache curl
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/ || exit 1
CMD ["node", "server.js"]
