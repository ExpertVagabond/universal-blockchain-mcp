FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/
COPY README.md ./

# Run as non-root user
USER node

# Start the MCP server
CMD ["node", "dist/index.js"]