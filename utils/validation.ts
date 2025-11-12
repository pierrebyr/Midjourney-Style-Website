/**
 * Validation utilities for user inputs
 * Provides functions to validate and sanitize user data
 */

/**
 * Validates an email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * Minimum 8 characters, at least one letter and one number
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

/**
 * Sanitizes a string by removing potentially harmful characters
 * This is a basic sanitization - for production use DOMPurify
 */
export const sanitizeString = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validates and sanitizes a title
 */
export const validateTitle = (title: string): { valid: boolean; error?: string; sanitized: string } => {
  const trimmed = title.trim();

  if (!trimmed) {
    return { valid: false, error: 'Title is required', sanitized: '' };
  }

  if (trimmed.length < 3) {
    return { valid: false, error: 'Title must be at least 3 characters', sanitized: trimmed };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Title must be less than 100 characters', sanitized: trimmed };
  }

  return { valid: true, sanitized: trimmed };
};

/**
 * Validates a sref value
 */
export const validateSref = (sref: string): { valid: boolean; error?: string } => {
  const trimmed = sref.trim();

  if (!trimmed) {
    return { valid: false, error: '--sref value is required' };
  }

  // Sref should be numeric or alphanumeric
  if (!/^[a-zA-Z0-9]+$/.test(trimmed)) {
    return { valid: false, error: '--sref should contain only letters and numbers' };
  }

  return { valid: true };
};

/**
 * Validates description length
 */
export const validateDescription = (description: string): { valid: boolean; error?: string; sanitized: string } => {
  const trimmed = description.trim();

  if (trimmed.length > 1000) {
    return { valid: false, error: 'Description must be less than 1000 characters', sanitized: trimmed };
  }

  return { valid: true, sanitized: trimmed };
};

/**
 * Validates a tag
 */
export const validateTag = (tag: string): { valid: boolean; error?: string } => {
  const trimmed = tag.trim();

  if (!trimmed) {
    return { valid: false, error: 'Tag cannot be empty' };
  }

  if (trimmed.length > 30) {
    return { valid: false, error: 'Tag must be less than 30 characters' };
  }

  if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
    return { valid: false, error: 'Tag can only contain letters, numbers, spaces, hyphens and underscores' };
  }

  return { valid: true };
};

/**
 * Validates base64 image size
 * @param base64 Base64 encoded image string
 * @param maxSizeMB Maximum size in megabytes
 */
export const validateImageSize = (base64: string, maxSizeMB: number = 5): { valid: boolean; error?: string; sizeMB: number } => {
  // Calculate size of base64 string
  // Base64 encoding increases size by ~33%, so we calculate the original size
  const base64Length = base64.length - (base64.indexOf(',') + 1);
  const sizeInBytes = (base64Length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);

  if (sizeInMB > maxSizeMB) {
    return {
      valid: false,
      error: `Image size (${sizeInMB.toFixed(2)}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
      sizeMB: sizeInMB
    };
  }

  return { valid: true, sizeMB: sizeInMB };
};

/**
 * Validates total images size to prevent localStorage overflow
 */
export const validateTotalImagesSize = (images: string[], maxTotalSizeMB: number = 15): { valid: boolean; error?: string; totalSizeMB: number } => {
  let totalSize = 0;

  for (const img of images) {
    const base64Length = img.length - (img.indexOf(',') + 1);
    const sizeInBytes = (base64Length * 3) / 4;
    totalSize += sizeInBytes;
  }

  const totalSizeMB = totalSize / (1024 * 1024);

  if (totalSizeMB > maxTotalSizeMB) {
    return {
      valid: false,
      error: `Total images size (${totalSizeMB.toFixed(2)}MB) exceeds maximum (${maxTotalSizeMB}MB)`,
      totalSizeMB
    };
  }

  return { valid: true, totalSizeMB };
};

/**
 * Validates user name
 */
export const validateName = (name: string): { valid: boolean; error?: string } => {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: 'Name is required' };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'Name must be less than 50 characters' };
  }

  return { valid: true };
};

/**
 * Validates bio
 */
export const validateBio = (bio: string): { valid: boolean; error?: string; sanitized: string } => {
  const trimmed = bio.trim();

  if (trimmed.length > 500) {
    return { valid: false, error: 'Bio must be less than 500 characters', sanitized: trimmed };
  }

  return { valid: true, sanitized: trimmed };
};

/**
 * Validates comment text
 */
export const validateComment = (text: string): { valid: boolean; error?: string; sanitized: string } => {
  const trimmed = text.trim();

  if (!trimmed) {
    return { valid: false, error: 'Comment cannot be empty', sanitized: '' };
  }

  if (trimmed.length < 1) {
    return { valid: false, error: 'Comment must have at least 1 character', sanitized: trimmed };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: 'Comment must be less than 500 characters', sanitized: trimmed };
  }

  return { valid: true, sanitized: trimmed };
};
