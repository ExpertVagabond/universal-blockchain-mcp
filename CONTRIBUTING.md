# Contributing to Universal Blockchain MCP

Thank you for your interest in contributing to the Universal Blockchain MCP project! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Git

### Getting Started

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/universal-blockchain-mcp.git
   cd universal-blockchain-mcp
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Code Quality Standards

- **ESLint**: All code must pass ESLint checks
- **Prettier**: Code must be formatted with Prettier
- **TypeScript**: Strict type checking enabled
- **Tests**: New features must include tests

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Run TypeScript type checking

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Build & Deploy
npm run build:smithery # Build for Smithery deployment
npm run clean         # Clean build artifacts
```

### Git Workflow

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write code following the style guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Test Your Changes**
   ```bash
   npm run lint
   npm run format:check
   npm run test
   npm run type-check
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style Guidelines

### TypeScript
- Use strict typing
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for public APIs

### File Organization
- Keep files focused and small
- Use descriptive file names
- Group related functionality together

### Error Handling
- Always handle errors appropriately
- Use specific error types
- Provide meaningful error messages

## Testing Guidelines

### Test Structure
- Place tests in `src/__tests__/` directory
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

### Test Example
```typescript
describe('ZetaChainMCPServer', () => {
  let server: ZetaChainMCPServer;

  beforeEach(() => {
    server = new ZetaChainMCPServer();
  });

  test('should create account successfully', async () => {
    const result = await server.createAccount('test-account');
    expect(result).toBeDefined();
  });
});
```

## Pull Request Guidelines

### Before Submitting
- [ ] Code passes all linting checks
- [ ] Code is properly formatted
- [ ] Tests pass and coverage is maintained
- [ ] Documentation is updated
- [ ] Commit messages follow conventional format

### PR Description
- Clearly describe what the PR does
- Reference any related issues
- Include screenshots for UI changes
- List any breaking changes

## Commit Message Format

Use conventional commits format:
```
type(scope): description

feat: add new account management feature
fix: resolve balance query issue
docs: update installation instructions
test: add unit tests for error handling
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Getting Help

- Check existing issues and discussions
- Join our community discussions
- Create an issue for bugs or feature requests

## License

By contributing, you agree that your contributions will be licensed under the MIT License.