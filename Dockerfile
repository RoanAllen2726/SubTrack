# ---- deps: install node_modules from lockfile ----
FROM node:20-alpine AS deps
# DO NOT set NODE_ENV=production here; we need dev deps to build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
# If you use native deps, you may need:
# RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# ---- builder: build the Next.js app ----
FROM node:20-alpine AS builder
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# If using Prisma: RUN npx prisma generate
RUN npm run build

# ---- runner: minimal runtime image ----
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

RUN addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001

# If using output: 'standalone' in next.config.js:
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
