# Small official Node 24 image built on Alpine Linux.
FROM node:24-alpine

# Production mode for the API. Tests never run inside this image.
ENV NODE_ENV=production

# Every command below runs inside /app in the image.
WORKDIR /app

# Copy only the package files first, then install.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Now copy the rest of the backend code.
COPY . .

# Run as the unprivileged "node" user, not as root.
USER node

# Documents the port the API listens on.
EXPOSE 5000

# Docker calls /api/health every 10 seconds to check the API is alive.
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
  CMD ["node", "-e", "fetch('http://localhost:5000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]

# The command the container runs when it starts.
CMD ["node", "src/server.js"]