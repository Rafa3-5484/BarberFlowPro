FROM node:20-alpine AS base

WORKDIR /app

# ========== BACKEND BUILD ==========
FROM base AS backend-build
COPY backend/package*.json backend/
RUN cd backend && npm ci
COPY backend/ .
RUN cd backend && npx prisma generate && npm run build

# ========== FRONTEND BUILD ==========
FROM base AS frontend-build
COPY frontend/package*.json frontend/
RUN cd frontend && npm ci
COPY frontend/ .
RUN cd frontend && npm run build

# ========== PRODUCTION ==========
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache tini

ENV NODE_ENV=production
ENV PORT=3000

# Backend assets
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/backend/node_modules ./backend/node_modules
COPY --from=backend-build /app/backend/package.json ./backend/
COPY --from=backend-build /app/backend/src/prisma/schema.prisma ./backend/src/prisma/schema.prisma
COPY --from=backend-build /app/backend/node_modules/.prisma ./backend/node_modules/.prisma

# Frontend static build
COPY --from=frontend-build /app/frontend/out ./frontend/out

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "backend/dist/main.js"]
