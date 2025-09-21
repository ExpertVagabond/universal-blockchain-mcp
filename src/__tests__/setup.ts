// Jest setup file for Universal Blockchain MCP
// This file runs before all tests

// Mock console methods to avoid noise in tests
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  // Restore original console methods
  Object.assign(console, originalConsole);
});

// Global test utilities
(global as any).testUtils = {
  // Add any global test utilities here
  mockZetaCommand: jest.fn(),
  createMockServer: () => {
    // Mock server creation for tests
    return {
      server: {
        setRequestHandler: jest.fn(),
        connect: jest.fn(),
        close: jest.fn(),
      },
      testMode: true,
    };
  },
};

// Extend Jest matchers if needed
expect.extend({
  // Add custom matchers here
});

// Add a dummy test to prevent "no tests" error
describe('Setup', () => {
  test('should load setup file', () => {
    expect(true).toBe(true);
  });
});
