import { RequestHandler } from 'express'
import config from '../config'
import {
  login,
  loginOAuth,
  registerGymOwner,
  registerGymOwnerOAuth,
  registerMemberUser,
  registerSuperAdmin,
  registerTrainer,
  getMe,
  verifyEmailOtp,
  resendEmailOtp,
} from '../services/auth.service'
import Gym from '../models/Gym'
import { UserRole } from '../types/roles'
import { asyncHandler } from '../utils/asyncHandler'
import { AppError } from '../utils/AppError'

export const postRegisterOwner: RequestHandler = asyncHandler(async (req, res) => {
  const out = await registerGymOwner(req.body)
  res.status(201).json(out)
})

export const postLogin: RequestHandler = asyncHandler(async (req, res) => {
  const out = await login(req.body)
  res.json(out)
})

export const postRegisterGymOwnerOAuth: RequestHandler = asyncHandler(async (req, res) => {
  const out = await registerGymOwnerOAuth(req.body)
  res.status(201).json(out)
})

export const postLoginOAuth: RequestHandler = asyncHandler(async (req, res) => {
  const out = await loginOAuth(req.body)
  res.json(out)
})

export const postRegisterMemberUser: RequestHandler = asyncHandler(async (req, res) => {
  const out = await registerMemberUser(req.body)
  res.status(201).json(out)
})

export const postRegisterTrainer: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user?.sub) throw new AppError('Unauthorized', 401)

  let gymId: string
  let ownerUserId: string

  if (req.user.role === UserRole.SUPER_ADMIN) {
    const gid = req.body.gymId
    if (!gid || typeof gid !== 'string') {
      throw new AppError(
        'gymId is required in the JSON body when registering a trainer as super admin',
        400
      )
    }
    const gym = await Gym.findById(gid).lean()
    if (!gym) throw new AppError('Gym not found', 404)
    gymId = String(gym._id)
    ownerUserId = String(gym.ownerId)
  } else if (req.user.role === UserRole.GYM_OWNER) {
    if (!req.user.gymId) {
      throw new AppError(
        'Your gym owner account is not linked to a gym. Complete registration or contact support.',
        403
      )
    }
    gymId = req.user.gymId
    ownerUserId = req.user.sub
  } else {
    throw new AppError('Forbidden', 403)
  }

  const out = await registerTrainer({
    email: req.body.email,
    password: req.body.password,
    gymId,
    ownerUserId,
  })
  res.status(201).json(out)
})

export const postRegisterSuperAdmin: RequestHandler = asyncHandler(async (req, res) => {
  const key = req.headers['x-bootstrap-key']
  if (
    !config.superAdminBootstrapKey ||
    key !== config.superAdminBootstrapKey
  ) {
    throw new AppError('Bootstrap not allowed', 403)
  }
  const out = await registerSuperAdmin(req.body)
  res.status(201).json(out)
})

export const getAuthMe: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user?.sub) throw new AppError('Unauthorized', 401)
  const me = await getMe(req.user.sub)
  res.json(me)
})

export const postVerifyEmailOtp: RequestHandler = asyncHandler(async (req, res) => {
  const out = await verifyEmailOtp(req.body)
  res.json(out)
})

export const postResendEmailOtp: RequestHandler = asyncHandler(async (req, res) => {
  const out = await resendEmailOtp(req.body)
  res.json(out)
})
