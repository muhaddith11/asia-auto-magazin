# Build stage
FROM node:20-slim AS builder
# Install necessary tools for Debian
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
# Forcing install even with dependency conflicts
RUN npm install
COPY . .
# Set environment variables for Prisma to use library engine (default for Linux)
ENV PRISMA_CLIENT_ENGINE_TYPE=library
RUN npx prisma generate
# Provide a dummy DATABASE_URL during build
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy npm run build

# Production stage
FROM node:20-slim AS runner
# Install openssl for runtime
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
ENV PRISMA_CLIENT_ENGINE_TYPE=library
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "start"]
