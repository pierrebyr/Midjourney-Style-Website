import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createStyleSchema } from '../utils/validation';
import { AppError, asyncHandler } from '../middleware/errorHandler';

/**
 * Get all styles with optional filtering and sorting
 * GET /api/styles
 */
export const getStyles = asyncHandler(async (req: Request, res: Response) => {
  const {
    search,
    sortBy = 'newest',
    limit = '50',
    offset = '0',
  } = req.query as {
    search?: string;
    sortBy?: string;
    limit?: string;
    offset?: string;
  };

  const take = Math.min(parseInt(limit, 10), 100); // Max 100 items
  const skip = parseInt(offset, 10) || 0;

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { sref: { contains: search } },
      { tags: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Fetch styles
  const styles = await prisma.style.findMany({
    where,
    take,
    skip,
    orderBy:
      sortBy === 'views'
        ? { views: 'desc' }
        : sortBy === 'az'
        ? { title: 'asc' }
        : { createdAt: 'desc' },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  // Parse JSON fields and add like count
  const formattedStyles = styles.map((style: any) => ({
    ...style,
    images: JSON.parse(style.images),
    tags: JSON.parse(style.tags),
    params: JSON.parse(style.params),
    likes: style._count.likes,
    likedBy: req.user ? undefined : [], // Will be populated separately if needed
  }));

  res.json({
    styles: formattedStyles,
    pagination: {
      limit: take,
      offset: skip,
      total: styles.length,
    },
  });
});

/**
 * Get single style by slug
 * GET /api/styles/:slug
 */
export const getStyleBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const style = await prisma.style.findUnique({
    where: { slug },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          avatar: true,
          bio: true,
        },
      },
      likes: req.user
        ? {
            where: { userId: req.user.id },
            select: { userId: true },
          }
        : false,
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  if (!style) {
    throw new AppError('Style not found', 404);
  }

  // Increment view count
  await prisma.style.update({
    where: { id: style.id },
    data: { views: { increment: 1 } },
  });

  const formattedStyle = {
    ...style,
    images: JSON.parse(style.images),
    tags: JSON.parse(style.tags),
    params: JSON.parse(style.params),
    likes: style._count.likes,
    isLiked: req.user && style.likes ? style.likes.length > 0 : false,
  };

  res.json({ style: formattedStyle });
});

/**
 * Create a new style
 * POST /api/styles
 */
export const createStyle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  // Validate request body
  const validatedData = createStyleSchema.parse(req.body);

  // Generate unique slug
  const baseSlug = validatedData.title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substr(2, 6);
  const slug = `${baseSlug}-${timestamp}-${randomStr}`;

  // Create style
  const style = await prisma.style.create({
    data: {
      slug,
      title: validatedData.title,
      sref: validatedData.sref,
      images: JSON.stringify(validatedData.images),
      mainImageIndex: validatedData.mainImageIndex,
      description: validatedData.description,
      tags: JSON.stringify(validatedData.tags),
      params: JSON.stringify(validatedData.params),
      creatorId: req.user.id,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  const formattedStyle = {
    ...style,
    images: JSON.parse(style.images),
    tags: JSON.parse(style.tags),
    params: JSON.parse(style.params),
    likes: 0,
  };

  res.status(201).json({
    message: 'Style created successfully',
    style: formattedStyle,
  });
});

/**
 * Toggle like on a style
 * POST /api/styles/:styleId/like
 */
export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { styleId } = req.params;

  // Check if style exists
  const style = await prisma.style.findUnique({
    where: { id: styleId },
  });

  if (!style) {
    throw new AppError('Style not found', 404);
  }

  // Check if already liked
  const existingLike = await prisma.like.findUnique({
    where: {
      styleId_userId: {
        styleId,
        userId: req.user.id,
      },
    },
  });

  if (existingLike) {
    // Unlike
    await prisma.like.delete({
      where: {
        id: existingLike.id,
      },
    });

    res.json({
      message: 'Style unliked',
      isLiked: false,
    });
  } else {
    // Like
    await prisma.like.create({
      data: {
        styleId,
        userId: req.user.id,
      },
    });

    res.json({
      message: 'Style liked',
      isLiked: true,
    });
  }
});

/**
 * Get comments for a style
 * GET /api/styles/:styleId/comments
 */
export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const { styleId } = req.params;

  const comments = await prisma.comment.findMany({
    where: { styleId },
    orderBy: { createdAt: 'asc' },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  res.json({ comments });
});

/**
 * Add a comment to a style
 * POST /api/styles/:styleId/comments
 */
export const addComment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { styleId } = req.params;
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    throw new AppError('Comment text is required', 400);
  }

  if (text.length > 500) {
    throw new AppError('Comment is too long (max 500 characters)', 400);
  }

  // Check if style exists
  const style = await prisma.style.findUnique({
    where: { id: styleId },
  });

  if (!style) {
    throw new AppError('Style not found', 404);
  }

  const comment = await prisma.comment.create({
    data: {
      text: text.trim(),
      styleId,
      authorId: req.user.id,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  res.status(201).json({
    message: 'Comment added',
    comment,
  });
});