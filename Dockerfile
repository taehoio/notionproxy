# Install dependencies only when needed
FROM node:16-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# python3 and build-base are needed to support Google Cloud Profiler.
RUN apk add --no-cache libc6-compat python3 build-base
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:16-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN yarn build
RUN yarn install --frozen-lockfile --production
RUN rm -rf ./.next/cache

# Production image, copy all the files and run next
FROM node:16-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV SHOULD_PROFILE=true
ENV SHOULD_TRACE=true
ENV NEXT_MANUAL_SIG_HANDLE=true
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/server-preload.js ./server-preload.js

USER nextjs

EXPOSE 3000

CMD ["node", "--require", "./server-preload.js", "./node_modules/.bin/next", "start", "--keepAliveTimeout", "70000"]
