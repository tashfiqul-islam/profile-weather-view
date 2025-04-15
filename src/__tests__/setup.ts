import { vi, afterAll, beforeAll, afterEach } from 'vitest';

// Mock global objects if needed
beforeAll(() => {
  console.warn('🚀 Setting up global test environment...');

  // Example: Mock a Date
  vi.useFakeTimers();
});

// Reset mocks after each test
afterEach(() => {
  vi.restoreAllMocks();
});

// Cleanup after all tests
afterAll(() => {
  console.warn('✅ Global test environment cleanup complete!');
  vi.clearAllTimers();
});
