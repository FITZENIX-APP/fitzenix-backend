import { RequestHandler } from 'express'
import { UserRoleType } from '../types/roles'
import { AppError } from '../utils/AppError'

/**
 * Require authenticated user with one of the allowed roles.
 */
export function requireRoles(...allowed: UserRoleType[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError('Unauthorized', 401))
      return
    }
    if (!allowed.includes(req.user.role)) {
      next(new AppError('Forbidden', 403))
      return
    }
    next()
  }
}

/**
 * Gym-scoped roles must match JWT gymId (except SUPER_ADMIN).
 */
export function requireGymScope(paramName = 'gymId'): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError('Unauthorized', 401))
      return
    }
    if (req.user.role === 'SUPER_ADMIN') {
      next()
      return
    }
    const id = req.params[paramName] ?? req.body?.gymId
    if (!id || req.user.gymId !== String(id)) {
      next(new AppError('Forbidden: gym scope', 403))
      return
    }
    next()
  }
}
