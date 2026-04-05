# Build stage
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV PRISMA_CLIENT_ENGINE_TYPE=library
RUN npx prisma generate
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy NEXT_TELEMETRY_DISABLED=1 npm run build

# Production stage
FROM node:20 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PRISMA_CLIENT_ENGINE_TYPE=library

COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/start.sh ./

RUN chmod +x start.sh

EXPOSE 3000

# Executing the dedicated startup script
CMD ["./start.sh"]
