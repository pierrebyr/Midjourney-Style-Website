import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

/**
 * Permission types
 */
export enum Permission {
  VIEW_LIMITED_STYLES = 'VIEW_LIMITED_STYLES',     // Visitor
  VIEW_STYLES = 'VIEW_STYLES',                     // Free
  VIEW_ALL_STYLES = 'VIEW_ALL_STYLES',             // Premium
  CREATE_STYLES_LIMITED = 'CREATE_STYLES_LIMITED', // Free (limited)
  CREATE_STYLES = 'CREATE_STYLES',                 // Premium (unlimited)
  UPLOAD_AVATAR = 'UPLOAD_AVATAR',                 // All authenticated
  CREATE_COLLECTIONS = 'CREATE_COLLECTIONS',       // All authenticated
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',             // All authenticated
}

/**
 * Quotas by subscription tier
 */
export const QUOTAS = {
  VISITOR: {
    viewStyles: 5,              // 5 styles visible
    viewStylesPerDay: 5,        // Max per day
    createStyles: 0,            // Cannot create
    uploadSize: 0,              // Cannot upload
  },
  FREE: {
    viewStyles: 20,             // 20 styles visible
    viewStylesPerDay: 50,       // Max per day
    createStyles: 5,            // 5 creations per month
    createStylesPerDay: 2,      // 2 per day
    uploadSize: 5 * 1024 * 1024, // 5MB
    collectionsLimit: 10,       // Max 10 collections
  },
  PREMIUM: {
    viewStyles: Infinity,       // Unlimited
    viewStylesPerDay: Infinity, // Unlimited
    createStyles: Infinity,     // Unlimited
    createStylesPerDay: Infinity, // Unlimited
    uploadSize: 50 * 1024 * 1024, // 50MB
    collectionsLimit: Infinity, // Unlimited
  },
  LIFETIME: {
    viewStyles: Infinity,
    viewStylesPerDay: Infinity,
    createStyles: Infinity,
    createStylesPerDay: Infinity,
    uploadSize: 50 * 1024 * 1024,
    collectionsLimit: Infinity,
  },
};

/**
 * Permissions by tier
 */
const TIER_PERMISSIONS = {
  VISITOR: [Permission.VIEW_LIMITED_STYLES],
  FREE: [
    Permission.VIEW_STYLES,
    Permission.CREATE_STYLES_LIMITED,
    Permission.UPLOAD_AVATAR,
    Permission.CREATE_COLLECTIONS,
    Permission.MANAGE_SETTINGS,
  ],
  PREMIUM: [
    Permission.VIEW_ALL_STYLES,
    Permission.CREATE_STYLES,
    Permission.UPLOAD_AVATAR,
    Permission.CREATE_COLLECTIONS,
    Permission.MANAGE_SETTINGS,
  ],
  LIFETIME: [
    Permission.VIEW_ALL_STYLES,
    Permission.CREATE_STYLES,
    Permission.UPLOAD_AVATAR,
    Permission.CREATE_COLLECTIONS,
    Permission.MANAGE_SETTINGS,
  ],
};

/**
 * Check if user has permission
 */
export const hasPermission = (
  tier: SubscriptionTier | 'VISITOR',
  status: SubscriptionStatus | null,
  permission: Permission
): boolean => {
  // Inactive premium users are downgraded to FREE
  if ((tier === 'PREMIUM' || tier === 'LIFETIME') && status !== 'ACTIVE') {
    tier = 'FREE';
  }

  const permissions = TIER_PERMISSIONS[tier] || TIER_PERMISSIONS.VISITOR;
  return permissions.includes(permission);
};

/**
 * Get quota for user tier
 */
export const getQuota = (
  tier: SubscriptionTier | 'VISITOR',
  status: SubscriptionStatus | null
): typeof QUOTAS.VISITOR | typeof QUOTAS.FREE | typeof QUOTAS.PREMIUM | typeof QUOTAS.LIFETIME => {
  // Inactive premium users are downgraded to FREE
  if ((tier === 'PREMIUM' || tier === 'LIFETIME') && status !== 'ACTIVE') {
    tier = 'FREE';
  }

  return QUOTAS[tier] || QUOTAS.VISITOR;
};

/**
 * Check if user can view style
 */
export const canViewStyle = (
  tier: SubscriptionTier | 'VISITOR',
  status: SubscriptionStatus | null,
  isPremiumOnly: boolean
): boolean => {
  // Premium-only styles require active premium subscription
  if (isPremiumOnly) {
    return (tier === 'PREMIUM' || tier === 'LIFETIME') && status === 'ACTIVE';
  }

  // Public styles can be viewed by all tiers (subject to view limits)
  return true;
};

/**
 * Check if user can create style
 */
export const canCreateStyle = (
  tier: SubscriptionTier | 'VISITOR',
  status: SubscriptionStatus | null,
  currentMonthCreations: number
): boolean => {
  const quota = getQuota(tier, status);

  // Visitors cannot create
  if (tier === 'VISITOR') {
    return false;
  }

  // Check monthly quota
  return currentMonthCreations < quota.createStyles;
};

/**
 * Check if user can upload file
 */
export const canUploadFile = (
  tier: SubscriptionTier | 'VISITOR',
  status: SubscriptionStatus | null,
  fileSize: number
): boolean => {
  const quota = getQuota(tier, status);
  return fileSize <= quota.uploadSize;
};

/**
 * Get tier display name
 */
export const getTierDisplayName = (tier: SubscriptionTier | 'VISITOR'): string => {
  const names = {
    VISITOR: 'Visitor',
    FREE: 'Free',
    PREMIUM: 'Premium',
    LIFETIME: 'Premium Lifetime',
  };
  return names[tier] || 'Unknown';
};

/**
 * Get tier badge color
 */
export const getTierBadgeColor = (tier: SubscriptionTier | 'VISITOR'): string => {
  const colors = {
    VISITOR: 'gray',
    FREE: 'blue',
    PREMIUM: 'purple',
    LIFETIME: 'gold',
  };
  return colors[tier] || 'gray';
};

/**
 * Check if upgrade is needed for action
 */
export const needsUpgrade = (
  tier: SubscriptionTier | 'VISITOR',
  status: SubscriptionStatus | null,
  action: 'view_all' | 'create_unlimited' | 'large_upload'
): boolean => {
  const isPremiumActive = (tier === 'PREMIUM' || tier === 'LIFETIME') && status === 'ACTIVE';

  switch (action) {
    case 'view_all':
      return !isPremiumActive;
    case 'create_unlimited':
      return !isPremiumActive;
    case 'large_upload':
      return !isPremiumActive;
    default:
      return false;
  }
};

export default {
  hasPermission,
  getQuota,
  canViewStyle,
  canCreateStyle,
  canUploadFile,
  getTierDisplayName,
  getTierBadgeColor,
  needsUpgrade,
  QUOTAS,
  Permission,
};
