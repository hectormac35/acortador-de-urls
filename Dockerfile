# ---------- 1) Dependencias ----------
FROM node:20-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# ---------- 2) Build ----------
FROM deps AS build
WORKDIR /app
COPY . .
RUN npx prisma generate && npm run build

# ---------- 3) Ejecución ----------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

# Usuario sin privilegios
RUN groupadd --system app && useradd --system --gid app app

COPY --from=build --chown=app:app /app/package.json /app/package-lock.json ./
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/.next ./.next
COPY --from=build --chown=app:app /app/public ./public
COPY --from=build --chown=app:app /app/prisma ./prisma
COPY --from=build --chown=app:app /app/next.config.ts ./next.config.ts

USER app
EXPOSE 3000

# Aplica las migraciones pendientes y arranca la app
CMD ["sh", "-c", "npx prisma migrate deploy && npx next start -p 3000"]
