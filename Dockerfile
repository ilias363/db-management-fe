FROM node:22-alpine AS base

FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci


FROM base AS build
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build (standalone output configured in next.config.ts)
RUN npm run build


FROM base AS runner
WORKDIR /app

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S nodegrp && adduser -S nodeusr -G nodegrp

COPY --from=build --chown=nodeusr:nodegrp /app/.next/standalone ./
COPY --from=build --chown=nodeusr:nodegrp /app/public ./public
COPY --from=build --chown=nodeusr:nodegrp /app/.next/static ./.next/static

USER nodeusr
EXPOSE 3000

CMD ["node", "server.js"]
