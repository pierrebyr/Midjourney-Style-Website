import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { updateProfileSchema } from '../utils/validation';
import { AppError, asyncHandler } from '../middleware/errorHandler';

/**
 * Get user by ID
 * GET /api/users/:userId
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
          styles: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if current user is following this user
  let isFollowing = false;
  if (req.user) {
    const followRecord = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId: userId,
        },
      },
    });
    isFollowing = !!followRecord;
  }

  res.json({
    user: {
      ...user,
      isFollowing,
    },
  });
});

/**
 * Update user profile
 * PUT /api/users/me
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const validatedData = updateProfileSchema.parse(req.body);

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: validatedData,
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      createdAt: true,
    },
  });

  res.json({
    message: 'Profile updated',
    user: updatedUser,
  });
});

/**
 * Get user's styles
 * GET /api/users/:userId/styles
 */
export const getUserStyles = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const styles = await prisma.style.findMany({
    where: { creatorId: userId },
    orderBy: { createdAt: 'desc' },
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

  const formattedStyles = styles.map((style: any) => ({
    ...style,
    images: JSON.parse(style.images),
    tags: JSON.parse(style.tags),
    params: JSON.parse(style.params),
    likes: style._count.likes,
  }));

  res.json({ styles: formattedStyles });
});

/**
 * Toggle follow user
 * POST /api/users/:userId/follow
 */
export const toggleFollow = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { userId } = req.params;

  // Can't follow yourself
  if (userId === req.user.id) {
    throw new AppError('You cannot follow yourself', 400);
  }

  // Check if user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    throw new AppError('User not found', 404);
  }

  // Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: req.user.id,
        followingId: userId,
      },
    },
  });

  if (existingFollow) {
    // Unfollow
    await prisma.follow.delete({
      where: {
        id: existingFollow.id,
      },
    });

    res.json({
      message: 'User unfollowed',
      isFollowing: false,
    });
  } else {
    // Follow
    await prisma.follow.create({
      data: {
        followerId: req.user.id,
        followingId: userId,
      },
    });

    res.json({
      message: 'User followed',
      isFollowing: true,
    });
  }
});

/**
 * Get leaderboard (users sorted by total likes)
 * GET /api/users/leaderboard
 */
export const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const { limit = '10' } = req.query;
  const take = Math.min(parseInt(limit as string), 100);

  // Get users with their like counts
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      avatar: true,
      _count: {
        select: {
          styles: true,
        },
      },
      styles: {
        select: {
          _count: {
            select: {
              likes: true,
            },
          },
        },
      },
    },
  });

  // Calculate total likes and sort
  const usersWithLikes = users.map((user: any) => ({
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    stylesCount: user._count.styles,
    totalLikes: user.styles.reduce((sum: any, style: any) => sum + style._count.likes, 0),
  }))
  .sort((a: any, b: any) => b.totalLikes - a.totalLikes)
  .slice(0, take);

  res.json({ users: usersWithLikes });
});
