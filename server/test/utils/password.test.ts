import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword, validatePassword } from '../../src/utils/password';

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Bcrypt uses salt
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'testPassword123!';
      const hash = await hashPassword(password);

      const result = await comparePassword(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password and hash', async () => {
      const password = 'testPassword123!';
      const wrongPassword = 'wrongPassword123!';
      const hash = await hashPassword(password);

      const result = await comparePassword(wrongPassword, hash);
      expect(result).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should accept valid passwords', () => {
      expect(validatePassword('abcdefgh')).toBe(true); // 8 chars
      expect(validatePassword('longpassword123')).toBe(true);
      expect(validatePassword('Valid123!@#')).toBe(true);
    });

    it('should reject short passwords', () => {
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('1234567')).toBe(false); // 7 chars
      expect(validatePassword('')).toBe(false);
    });

    it('should reject passwords over 100 characters', () => {
      const tooLong = 'a'.repeat(101);
      expect(validatePassword(tooLong)).toBe(false);
    });
  });
});
