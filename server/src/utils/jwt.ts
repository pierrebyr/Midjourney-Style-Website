import jwt, { SignOptions, JwtPayload as JwtPayloadBase } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-change-this';

// On aide TypeScript ici : on dit clairement que c'est du bon type pour expiresIn
const JWT_EXPIRES_IN: SignOptions['expiresIn'] =
  (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

export interface JwtPayload extends JwtPayloadBase {
  userId: string;
  email: string;
}

/**
 * Generate a JWT token for a user
 */
export const generateToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
};