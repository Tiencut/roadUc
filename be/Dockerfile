FROM node:18-alpine
WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm install --production

# Build (if TypeScript build artifacts present)
COPY . .
RUN npm run build || true

EXPOSE 3000
CMD ["node", "dist/index.js"]
