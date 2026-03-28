import { timingSafeEqual } from 'crypto'
import { RequestHandler } from 'express'
import config from '../config'
import { AppError } from '../utils/AppError'

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/**
 * Requires clients to send `x-api-key` and `api-token` matching API_KEY / API_TOKEN
 * when api header security is enabled (both env vars set).
 */
export const requireApiHeaders: RequestHandler = (req, _res, next) => {
  if (!config.apiHeaders.enabled) {
    next()
    return
  }

  const key = req.headers['x-api-key']
  const token = req.headers['api-token']
  const gotKey = typeof key === 'string' ? key : Array.isArray(key) ? key[0] : ''
  const gotToken = typeof token === 'string' ? token : Array.isArray(token) ? token[0] : ''

  if (!gotKey || !gotToken) {
    next(new AppError('Missing x-api-key or api-token', 401, 'MISSING_API_HEADERS'))
    return
  }

  if (
    !safeEqual(gotKey, config.apiHeaders.key) ||
    !safeEqual(gotToken, config.apiHeaders.token)
  ) {
    next(new AppError('Invalid API credentials', 401, 'INVALID_API_HEADERS'))
    return
  }

  next()
}
