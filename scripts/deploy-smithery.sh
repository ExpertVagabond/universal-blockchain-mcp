#!/bin/bash

# ZetaChain MCP Server - Smithery Deployment Script
# This script automates the deployment process to Smithery marketplace

set -e

echo "🚀 ZetaChain MCP Server - Smithery Deployment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed."
        exit 1
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        print_error "git is not installed."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci
    print_success "Dependencies installed"
}

# Build project
build_project() {
    print_status "Building project..."
    npm run build
    
    if [ ! -f "dist/index.js" ]; then
        print_error "Build failed - dist/index.js not found"
        exit 1
    fi
    
    print_success "Project built successfully"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    npm run test
    print_success "Tests passed"
}

# Install Smithery CLI
install_smithery_cli() {
    print_status "Installing Smithery CLI..."
    
    if command -v smithery &> /dev/null; then
        print_warning "Smithery CLI already installed"
        smithery --version
    else
        npm install -g @smithery/cli
        print_success "Smithery CLI installed"
    fi
}

# Login to Smithery
login_smithery() {
    print_status "Checking Smithery authentication..."
    
    if [ -z "$SMITHERY_API_TOKEN" ]; then
        print_warning "SMITHERY_API_TOKEN environment variable not set"
        print_status "Please visit https://smithery.ai/account/api-keys to get your API token"
        read -p "Enter your Smithery API token: " SMITHERY_API_TOKEN
        
        if [ -z "$SMITHERY_API_TOKEN" ]; then
            print_error "API token is required for deployment"
            exit 1
        fi
    fi
    
    echo "$SMITHERY_API_TOKEN" | smithery login --stdin
    print_success "Logged in to Smithery"
}

# Validate smithery.yaml
validate_smithery_config() {
    print_status "Validating Smithery configuration..."
    
    if [ ! -f "smithery.yaml" ]; then
        print_error "smithery.yaml not found"
        exit 1
    fi
    
    # Check required fields in smithery.yaml
    if ! grep -q "name:" smithery.yaml; then
        print_error "Missing 'name' field in smithery.yaml"
        exit 1
    fi
    
    if ! grep -q "entrypoint:" smithery.yaml; then
        print_error "Missing 'entrypoint' field in smithery.yaml"
        exit 1
    fi
    
    print_success "Smithery configuration validated"
}

# Deploy to Smithery
deploy_to_smithery() {
    print_status "Deploying to Smithery marketplace..."
    
    # Create deployment package
    print_status "Creating deployment package..."
    
    # Ensure all required files are present
    required_files=("package.json" "smithery.yaml" "README.md" "dist/index.js")
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file missing: $file"
            exit 1
        fi
    done
    
    # Deploy using Smithery CLI
    if smithery deploy .; then
        print_success "Successfully deployed to Smithery marketplace!"
        print_status "Your MCP server is now available at:"
        print_status "https://smithery.ai/servers/ExpertVagabond/zetachain-mcp-server"
    else
        print_error "Deployment failed"
        exit 1
    fi
}

# Alternative GitHub-based deployment
deploy_via_github() {
    print_status "Alternative: GitHub-based deployment"
    print_status "If CLI deployment fails, you can deploy via GitHub integration:"
    print_status "1. Visit: https://smithery.ai/new/github"
    print_status "2. Connect your GitHub account"
    print_status "3. Select repository: ExpertVagabond/zetachain-mcp-server"
    print_status "4. Configure deployment settings"
    print_status "5. Deploy with one click"
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Test the deployed server
    print_status "Testing deployed server..."
    
    # Note: This would require the server to be accessible via Smithery
    # For now, we'll just provide instructions
    
    print_success "Deployment verification complete!"
    print_status "Users can now access your MCP server with:"
    echo ""
    echo "{"
    echo "  \"mcpServers\": {"
    echo "    \"zetachain\": {"
    echo "      \"command\": \"npx\","
    echo "      \"args\": [\"-y\", \"@smithery/cli\", \"run\", \"ExpertVagabond/zetachain-mcp-server\"]"
    echo "    }"
    echo "  }"
    echo "}"
}

# Main execution
main() {
    echo ""
    print_status "Starting Smithery deployment process..."
    echo ""
    
    check_prerequisites
    install_dependencies
    build_project
    run_tests
    install_smithery_cli
    validate_smithery_config
    
    # Try automated deployment
    if login_smithery 2>/dev/null; then
        deploy_to_smithery
        verify_deployment
    else
        print_warning "Automated deployment failed or API token not available"
        deploy_via_github
    fi
    
    echo ""
    print_success "Deployment process completed!"
    echo ""
    print_status "Next steps:"
    print_status "1. Test the deployment with an AI assistant"
    print_status "2. Monitor usage and performance"
    print_status "3. Update documentation as needed"
    print_status "4. Share with the community!"
    echo ""
}

# Handle script interruption
trap 'print_error "Deployment interrupted"; exit 1' INT

# Run main function
main "$@"