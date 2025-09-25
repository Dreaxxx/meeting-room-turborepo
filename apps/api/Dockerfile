FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY turbo.json ./
COPY apps/api/package*.json apps/api/
COPY apps/api/tsconfig*.json apps/api/
COPY apps/api/prisma apps/api/prisma
COPY apps/api/src apps/api/src

RUN npm ci

WORKDIR /app/apps/api
RUN npx prisma generate

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3333

CMD ["node", "dist/main.js"]
