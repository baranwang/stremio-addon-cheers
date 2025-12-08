FROM node:24-alpine AS base

RUN apk update
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

# ---

FROM base AS builder

WORKDIR /app

ENV DATABASE_URL=file:./db.sqlite

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# ---

FROM base AS runner

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["pnpm", "start"]