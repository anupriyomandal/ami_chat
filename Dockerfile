FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache python3 make g++

# Install full deps (incl. drizzle-kit + tsx) so migrations can run at startup.
COPY package.json package-lock.json ./
RUN npm ci --include=dev
RUN node node_modules/@node-rs/argon2/install.js || true

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/db ./db
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/instrumentation.ts ./instrumentation.ts

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV DATABASE_PATH=/data/openchat.db

EXPOSE 3000

CMD ["sh", "scripts/start.sh"]
