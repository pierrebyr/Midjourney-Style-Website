import { describe, it, expect, beforeEach } from 'vitest';
import { generateToken, verifyToken } from '../../src/utils/jwt';

describe('JWT Utils', () => {
  const testPayload = {
    userId: 'test-user-123',
    email: 'test@example.com',
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(testPayload);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = generateToken({ userId: 'user1', email: 'user1@test.com' });
      const token2 = generateToken({ userId: 'user2', email: 'user2@test.com' });

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const token = generateToken(testPayload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded).toHaveProperty('iat'); // issued at
      expect(decoded).toHaveProperty('exp'); // expiration
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('should throw error for malformed token', () => {
      expect(() => verifyToken('not-a-token')).toThrow();
      expect(() => verifyToken('')).toThrow();
    });
  });

  describe('Token roundtrip', () => {
    it('should successfully roundtrip encode and decode', () => {
      const originalPayload = {
        userId: 'user-abc-123',
        email: 'roundtrip@test.com',
      };

      const token = generateToken(originalPayload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(originalPayload.userId);
      expect(decoded.email).toBe(originalPayload.email);
    });
  });
});
