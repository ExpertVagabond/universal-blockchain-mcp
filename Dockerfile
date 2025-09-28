FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ ./src/
COPY zetachain ./zetachain

# Create data directory for wallets
RUN mkdir -p ./data/wallets && chmod 755 ./data/wallets

# Make CLI executable
RUN chmod +x ./zetachain

# Expose MCP server port
EXPOSE 8080

# Set environment variables
ENV ZETACHAIN_NETWORK=athens
ENV ZETACHAIN_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
ENV ZETACHAIN_GATEWAY=0x6c533f7fe93fae114d0954697069df33c9b74fd7

# Run the MCP server
CMD ["python", "-m", "src.zetachain_mcp_server"]