# Multi-stage build for optimized image size
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm install --save-dev typescript @types/node

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S zetachain && \
    adduser -u 1001 -S zetachain -G zetachain

# Set working directory
WORKDIR /app

# Copy built application and dependencies
COPY --from=builder --chown=zetachain:zetachain /app/dist ./dist
COPY --from=builder --chown=zetachain:zetachain /app/node_modules ./node_modules
COPY --from=builder --chown=zetachain:zetachain /app/package*.json ./

# Switch to non-root user
USER zetachain

# Set environment variables
ENV NODE_ENV=production \
    ZETACHAIN_NETWORK=testnet \
    ENABLE_ANALYTICS=false

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "console.log('healthy')" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the MCP server
CMD ["node", "dist/index.js"]