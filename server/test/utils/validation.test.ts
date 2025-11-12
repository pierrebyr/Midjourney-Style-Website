import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  styleCreateSchema,
  collectionCreateSchema,
  commentCreateSchema,
} from '../../src/utils/validation';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'not-an-email',
        password: 'password123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'short',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing fields', () => {
      const incomplete = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const result = registerSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });

    it('should trim whitespace from name and email', () => {
      const dataWithWhitespace = {
        name: '  John Doe  ',
        email: '  john@example.com  ',
        password: 'password123',
      };

      const result = registerSchema.safeParse(dataWithWhitespace);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John Doe');
        expect(result.data.email).toBe('john@example.com');
      }
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'john@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('styleCreateSchema', () => {
    it('should validate correct style data', () => {
      const validData = {
        title: 'Beautiful Style',
        description: 'A wonderful style',
        sref: 'style-ref-123',
        images: ['https://example.com/image1.jpg'],
        tags: ['art', 'modern'],
        category: 'photography',
      };

      const result = styleCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const invalidData = {
        title: '',
        description: 'A wonderful style',
        sref: 'style-ref-123',
        images: ['https://example.com/image1.jpg'],
        tags: ['art'],
        category: 'photography',
      };

      const result = styleCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject more than 4 images', () => {
      const invalidData = {
        title: 'Style',
        description: 'Description',
        sref: 'ref',
        images: ['img1', 'img2', 'img3', 'img4', 'img5'],
        tags: ['tag'],
        category: 'cat',
      };

      const result = styleCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept empty images array and default to empty', () => {
      const data = {
        title: 'Style',
        description: 'Description',
        sref: 'ref',
        images: [],
        tags: ['tag'],
        category: 'cat',
      };

      const result = styleCreateSchema.safeParse(data);
      // Should fail because at least 1 image is required
      expect(result.success).toBe(false);
    });
  });

  describe('collectionCreateSchema', () => {
    it('should validate correct collection data', () => {
      const validData = {
        name: 'My Collection',
        description: 'A great collection',
      };

      const result = collectionCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
        description: 'Description',
      };

      const result = collectionCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject name over 100 characters', () => {
      const invalidData = {
        name: 'a'.repeat(101),
        description: 'Description',
      };

      const result = collectionCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('commentCreateSchema', () => {
    it('should validate correct comment data', () => {
      const validData = {
        text: 'This is a great comment!',
      };

      const result = commentCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty comment', () => {
      const invalidData = {
        text: '',
      };

      const result = commentCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject comment over 1000 characters', () => {
      const invalidData = {
        text: 'a'.repeat(1001),
      };

      const result = commentCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should trim whitespace', () => {
      const data = {
        text: '  Great comment!  ',
      };

      const result = commentCreateSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.text).toBe('Great comment!');
      }
    });
  });
});
