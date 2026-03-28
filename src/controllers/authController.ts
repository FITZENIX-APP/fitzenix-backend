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
  if (!req.user?.gymId || !req.user.sub) throw new AppError('Unauthorized', 401)
  const out = await registerTrainer({
    ...req.body,
    gymId: req.user.gymId,
    ownerUserId: req.user.sub,
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
