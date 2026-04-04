# Build stage
FROM node:20-alpine AS builder
# Install openssl for Prisma binary engine support
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy npm run build

# Production stage
FROM node:20-alpine AS runner
# Install openssl for Prisma binary engine support
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "start"]
