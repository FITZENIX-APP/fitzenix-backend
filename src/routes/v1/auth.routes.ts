import { Router } from 'express'
import {
  postRegisterOwner,
  postLogin,
  postRegisterGymOwnerOAuth,
  postLoginOAuth,
  postRegisterMemberUser,
  postRegisterTrainer,
  postRegisterSuperAdmin,
  getAuthMe,
  postVerifyEmailOtp,
  postResendEmailOtp,
} from '../../controllers/authController'
import { validateBody } from '../../middleware/validate'
import { requireAuth } from '../../middleware/auth'
import { requireRoles } from '../../middleware/rbac'
import { UserRole } from '../../types/roles'
import {
  registerOwnerSchema,
  loginSchema,
  oauthLoginSchema,
  oauthRegisterGymOwnerSchema,
  registerMemberUserSchema,
  registerTrainerSchema,
  registerSuperAdminSchema,
  verifyEmailOtpSchema,
  resendEmailOtpSchema,
} from '../../validators/schemas'

const r = Router()

r.post('/register/gym-owner', validateBody(registerOwnerSchema), postRegisterOwner)
r.post(
  '/register/gym-owner/oauth',
  validateBody(oauthRegisterGymOwnerSchema),
  postRegisterGymOwnerOAuth
)
r.post('/login', validateBody(loginSchema), postLogin)
r.post('/login/oauth', validateBody(oauthLoginSchema), postLoginOAuth)
r.post(
  '/register/member',
  validateBody(registerMemberUserSchema),
  postRegisterMemberUser
)
r.post(
  '/register/super-admin',
  validateBody(registerSuperAdminSchema),
  postRegisterSuperAdmin
)
r.post('/verify-email-otp', validateBody(verifyEmailOtpSchema), postVerifyEmailOtp)
r.post('/resend-email-otp', validateBody(resendEmailOtpSchema), postResendEmailOtp)

r.post(
  '/register/trainer',
  requireAuth,
  requireRoles(UserRole.GYM_OWNER),
  validateBody(registerTrainerSchema),
  postRegisterTrainer
)

r.get('/me', requireAuth, getAuthMe)

export default r
