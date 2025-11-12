/**
 * Error handling utilities
 * Provides standardized error handling and logging
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Logs errors to console (in production, this would send to a service like Sentry)
 */
export const logError = (error: Error, context?: Record<string, any>) => {
  console.error('Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context
  });

  // In production, you would send this to Sentry or similar:
  // Sentry.captureException(error, { contexts: { custom: context } });
};

/**
 * Safely handles async operations with error logging
 */
export const handleAsync = async <T>(
  fn: () => Promise<T>,
  errorMessage: string = 'An error occurred'
): Promise<{ data: T | null; error: Error | null }> => {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logError(err);
    return { data: null, error: err };
  }
};

/**
 * Gets a user-friendly error message
 */
export const getUserFriendlyMessage = (error: Error): string => {
  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof AuthenticationError) {
    return error.message;
  }

  if (error instanceof NotFoundError) {
    return error.message;
  }

  // Don't expose internal errors to users
  return 'An unexpected error occurred. Please try again later.';
};
