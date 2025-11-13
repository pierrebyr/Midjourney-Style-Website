import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createCollectionSchema } from '../utils/validation';
import { AppError, asyncHandler } from '../middleware/errorHandler';

/**
 * Get all collections for current user
 * GET /api/collections
 */
export const getCollections = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const collections = await prisma.collection.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          styles: true,
        },
      },
    },
  });

  res.json({ collections });
});

/**
 * Get single collection by ID
 * GET /api/collections/:id
 */
export const getCollectionById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const collection = await prisma.collection.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      styles: {
        include: {
          style: {
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
                },
              },
            },
          },
        },
      },
    },
  });

  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  // Format styles
  const formattedStyles = collection.styles.map(({ style }: any) => ({
    ...style,
    images: JSON.parse(style.images),
    tags: JSON.parse(style.tags),
    params: JSON.parse(style.params),
    likes: style._count.likes,
  }));

  res.json({
    collection: {
      ...collection,
      styles: formattedStyles,
    },
  });
});

/**
 * Create a new collection
 * POST /api/collections
 */
export const createCollection = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const validatedData = createCollectionSchema.parse(req.body);

  const collection = await prisma.collection.create({
    data: {
      name: validatedData.name,
      description: validatedData.description,
      userId: req.user.id,
    },
  });

  res.status(201).json({
    message: 'Collection created',
    collection,
  });
});

/**
 * Update a collection
 * PUT /api/collections/:id
 */
export const updateCollection = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;
  const validatedData = createCollectionSchema.parse(req.body);

  // Check ownership
  const collection = await prisma.collection.findUnique({
    where: { id },
  });

  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  if (collection.userId !== req.user.id) {
    throw new AppError('Not authorized to update this collection', 403);
  }

  const updated = await prisma.collection.update({
    where: { id },
    data: {
      name: validatedData.name,
      description: validatedData.description,
    },
  });

  res.json({
    message: 'Collection updated',
    collection: updated,
  });
});

/**
 * Delete a collection
 * DELETE /api/collections/:id
 */
export const deleteCollection = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;

  // Check ownership
  const collection = await prisma.collection.findUnique({
    where: { id },
  });

  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  if (collection.userId !== req.user.id) {
    throw new AppError('Not authorized to delete this collection', 403);
  }

  await prisma.collection.delete({
    where: { id },
  });

  res.json({ message: 'Collection deleted' });
});

/**
 * Add style to collection
 * POST /api/collections/:id/styles/:styleId
 */
export const addStyleToCollection = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id, styleId } = req.params;

  // Check ownership
  const collection = await prisma.collection.findUnique({
    where: { id },
  });

  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  if (collection.userId !== req.user.id) {
    throw new AppError('Not authorized to modify this collection', 403);
  }

  // Check if style exists
  const style = await prisma.style.findUnique({
    where: { id: styleId },
  });

  if (!style) {
    throw new AppError('Style not found', 404);
  }

  // Check if already in collection
  const existing = await prisma.collectionStyle.findUnique({
    where: {
      collectionId_styleId: {
        collectionId: id,
        styleId,
      },
    },
  });

  if (existing) {
    throw new AppError('Style already in collection', 409);
  }

  await prisma.collectionStyle.create({
    data: {
      collectionId: id,
      styleId,
    },
  });

  res.json({ message: 'Style added to collection' });
});

/**
 * Remove style from collection
 * DELETE /api/collections/:id/styles/:styleId
 */
export const removeStyleFromCollection = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id, styleId } = req.params;

  // Check ownership
  const collection = await prisma.collection.findUnique({
    where: { id },
  });

  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  if (collection.userId !== req.user.id) {
    throw new AppError('Not authorized to modify this collection', 403);
  }

  await prisma.collectionStyle.deleteMany({
    where: {
      collectionId: id,
      styleId,
    },
  });

  res.json({ message: 'Style removed from collection' });
});
