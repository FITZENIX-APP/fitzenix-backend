import { RequestHandler } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { AppError } from '../utils/AppError'

function getBearerToken(header?: string): string | null {
  if (!header || !header.startsWith('Bearer ')) return null
  return header.slice(7).trim() || null
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = getBearerToken(req.headers.authorization)
  if (!token) {
    next(new AppError('Unauthorized', 401))
    return
  }
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    next(new AppError('Invalid or expired token', 401))
  }
}
