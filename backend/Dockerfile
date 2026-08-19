FROM oven/bun:1-alpine AS deps

WORKDIR /app

COPY package.json bun.lock ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN bun install

FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/bun.lock ./bun.lock

COPY prisma ./prisma/
COPY prisma.config.ts ./

ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN bunx prisma generate

COPY . .

RUN bun install --production --ignore-scripts

FROM oven/bun:1-alpine AS runner

LABEL maintainer="your-team@example.com"
LABEL org.opencontainers.image.title="e-commerce-backend"
LABEL org.opencontainers.image.description="E-Commerce Backend API"

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN apk add --no-cache dumb-init && rm -rf /var/cache/apk/*

RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/generated ./generated
COPY --from=builder --chown=appuser:appgroup /app/prisma ./prisma
COPY --from=builder --chown=appuser:appgroup /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=appuser:appgroup /app/src ./src
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json
COPY --from=builder --chown=appuser:appgroup /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=appuser:appgroup /app/public ./public

RUN mkdir -p /app/logs && chown -R appuser:appgroup /app/logs

USER appuser

EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/v1/health || exit 1

ENTRYPOINT ["dumb-init", "--"]

CMD ["bun", "run", "src/server.ts"]
