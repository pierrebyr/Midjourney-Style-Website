import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Ensure upload directories exist
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const AVATARS_DIR = path.join(UPLOAD_DIR, 'avatars');
const IMAGES_DIR = path.join(UPLOAD_DIR, 'images');

// Create directories if they don't exist
[UPLOAD_DIR, AVATARS_DIR, IMAGES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  FREE: 5 * 1024 * 1024,      // 5MB for free users
  PREMIUM: 50 * 1024 * 1024,  // 50MB for premium users
};

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * Storage configuration for avatars
 */
const avatarStorage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, AVATARS_DIR);
  },
  filename: (req: Request, file, cb) => {
    const userId = req.user?.id || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `avatar-${userId}-${timestamp}${ext}`;
    cb(null, filename);
  },
});

/**
 * Storage configuration for general images
 */
const imageStorage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, IMAGES_DIR);
  },
  filename: (req: Request, file, cb) => {
    const userId = req.user?.id || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const random = Math.random().toString(36).substring(7);
    const filename = `image-${userId}-${timestamp}-${random}${ext}`;
    cb(null, filename);
  },
});

/**
 * File filter to validate image types
 */
const imageFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`));
  }
};

/**
 * Get file size limit based on user subscription tier
 */
const getFileSizeLimit = (req: Request): number => {
  const tier = req.user?.subscriptionTier || 'FREE';
  return FILE_SIZE_LIMITS[tier as keyof typeof FILE_SIZE_LIMITS] || FILE_SIZE_LIMITS.FREE;
};

/**
 * Multer instance for avatar uploads
 */
export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMITS.PREMIUM, // Use max size, we'll check tier in middleware
  },
});

/**
 * Multer instance for general image uploads
 */
export const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMITS.PREMIUM,
  },
});

/**
 * Validate file size based on user tier
 */
export const validateFileSize = (req: Request, fileSize: number): boolean => {
  const limit = getFileSizeLimit(req);
  return fileSize <= limit;
};

/**
 * Delete file from filesystem
 */
export const deleteFile = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

/**
 * Get full file path
 */
export const getFilePath = (filename: string, type: 'avatar' | 'image'): string => {
  const dir = type === 'avatar' ? AVATARS_DIR : IMAGES_DIR;
  return path.join(dir, filename);
};

/**
 * Get public URL for uploaded file
 */
export const getFileUrl = (filename: string, type: 'avatar' | 'image'): string => {
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  return `${baseUrl}/uploads/${type}s/${filename}`;
};
