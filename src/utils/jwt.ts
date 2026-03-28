import jwt, { SignOptions } from 'jsonwebtoken'
import config from '../config'
import { UserRoleType } from '../types/roles'
import { AppError } from './AppError'

export type JwtPayload = {
  sub: string
  role: UserRoleType
  gymId?: string
  memberId?: string
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as SignOptions)
}

export function verifyAccessToken(token: string): JwtPayload {
  const trimmed = token.trim().replace(/^["']|["']$/g, '')
  if (!trimmed) {
    throw new AppError('Invalid token', 401)
  }
  try {
    return jwt.verify(trimmed, config.jwt.secret) as JwtPayload
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError('Token expired. Please log in again.', 401)
    }
    throw new AppError(
      'Invalid token. Log in again with POST /api/v1/auth/login. If this persists, JWT_SECRET may have changed since the token was issued.',
      401
    )
  }
}
