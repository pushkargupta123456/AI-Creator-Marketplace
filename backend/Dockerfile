# Build stage — needs devDependencies (@nestjs/cli, typescript) to compile.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage — production dependencies only.
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist

# PORT is read by main.ts; hosts that inject their own PORT override this.
ENV PORT=4000
EXPOSE 4000
USER node
CMD ["node", "dist/main.js"]
