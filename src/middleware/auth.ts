import { RequestHandler } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { AppError } from '../utils/AppError'

function getBearerToken(header?: string): string | null {
  if (!header || typeof header !== 'string') return null
  const m = header.trim().match(/^Bearer\s+(.+)$/i)
  if (!m?.[1]) return null
  return m[1].trim().replace(/^["']|["']$/g, '') || null
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = getBearerToken(req.headers.authorization)
  if (!token) {
    next(
      new AppError(
        'Authentication required. Send: Authorization: Bearer <access_token> (log in first, e.g. as gym owner or super admin).',
        401
      )
    )
    return
  }
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch (e) {
    if (e instanceof AppError) {
      next(e)
      return
    }
    next(new AppError('Invalid token', 401))
  }
}
