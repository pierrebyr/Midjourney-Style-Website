import { beforeAll, afterAll } from 'vitest';

// Setup environment variables for testing
beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.DATABASE_URL = 'file:./test.db';
  process.env.GEMINI_API_KEY = 'test-gemini-key';
  process.env.PORT = '3001';
});

afterAll(() => {
  // Cleanup if needed
});
