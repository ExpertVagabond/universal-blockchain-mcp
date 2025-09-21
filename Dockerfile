FROM node:18-alpine

WORKDIR /app

# Install foundry/forge dependencies
RUN apk add --no-cache curl bash git && \
    curl -L https://foundry.paradigm.xyz | bash && \
    export PATH="$PATH:/root/.foundry/bin" && \
    foundryup

# Copy everything
COPY . .

# Install dependencies and build
RUN npm ci && npm run build

# Set PATH for foundry
ENV PATH="/root/.foundry/bin:$PATH"

# Start the application
CMD ["node", "dist/index.js"]