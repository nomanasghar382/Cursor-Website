FROM node:24-alpine AS dependencies
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci

FROM dependencies AS build
COPY backend/ ./
COPY database/ /database/
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 4000
CMD ["node", "dist/main.js"]
