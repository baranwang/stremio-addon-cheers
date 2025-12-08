FROM node:24-alpine AS base

RUN apk update
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

# ---

FROM base AS builder

WORKDIR /app


COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ENV DATABASE_URL=file:./db.sqlite
RUN pnpm prisma generate

RUN pnpm build

# ---

FROM base AS runner

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

ENV DATABASE_URL=file:./db.sqlite
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

CMD ["pnpm", "start"]