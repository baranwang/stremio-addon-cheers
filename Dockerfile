FROM node:24-slim AS base

RUN npm install -g pnpm

# ---

FROM base AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# ---

FROM base AS runner

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/lmdb ./node_modules/lmdb
COPY --from=builder /app/node_modules/@lmdb ./node_modules/@lmdb

ENV DATABASE_PATH=./data
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

EXPOSE 3000

CMD ["node", "server.js"]