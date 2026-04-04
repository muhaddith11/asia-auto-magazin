# Build stage
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
# Forcing install even with dependency conflicts (due to React 19 / Next 15 peer issues)
RUN npm install
COPY . .
# Force binary engine for both build and runtime
ENV PRISMA_CLIENT_ENGINE_TYPE=binary
RUN npx prisma generate
# Provide dummy DATABASE_URL during build
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy npm run build

# Production stage
FROM node:20 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PRISMA_CLIENT_ENGINE_TYPE=binary
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "start"]
