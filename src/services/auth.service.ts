import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import config from '../config'
import Gym from '../models/Gym'
import Member from '../models/Member'
import User from '../models/user'
import { UserRole } from '../types/roles'
import type { GymAddress } from '../types/gym'
import type { GymBillingPlan } from '../types/gym'
import { AppError } from '../utils/AppError'
import { defaultGymBillingPlans, mergeGymPlans } from '../utils/gymPlans'
import { signAccessToken } from '../utils/jwt'
import { slugify } from '../utils/slug'
import { generateSixDigitOtp, hashOtp } from '../utils/otp'
import { sendVerificationOtpEmail } from './email.service'
import {
  verifyFacebookAccessToken,
  verifyGoogleIdToken,
} from './oauth.service'

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, config.bcryptRounds)
}

async function setAndSendVerificationOtp(user: InstanceType<typeof User>) {
  const otp = generateSixDigitOtp()
  const otpHash = hashOtp(otp)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  user.verificationOtpHash = otpHash
  user.verificationOtpExpiresAt = expiresAt
  await user.save()

  await sendVerificationOtpEmail({ to: user.email, otp })
}

function ensureEmailAvailable(exists: InstanceType<typeof User> | null): void {
  if (!exists) return
  if (exists.isVerified) {
    throw new AppError('Email already registered. Please login.', 409)
  }
  throw new AppError(
    'Email already registered but not verified. Verify OTP or resend OTP.',
    409
  )
}

async function createGymForOwner(
  ownerId: mongoose.Types.ObjectId,
  input: {
    gymName: string
    gymType: 'MEN' | 'WOMEN' | 'MIXED'
    address: GymAddress
    phone: string
    contactEmail: string
    gstin?: string
    imageUrls?: string[]
    plans?: Partial<GymBillingPlan>[]
  }
) {
  const baseSlug = slugify(input.gymName) || 'gym'
  let slug = baseSlug
  let n = 1
  while (await Gym.findOne({ slug })) {
    slug = `${baseSlug}-${n++}`
  }

  const plans = mergeGymPlans(defaultGymBillingPlans(), input.plans)

  return Gym.create({
    ownerId,
    name: input.gymName,
    slug,
    type: input.gymType,
    address: input.address,
    phone: input.phone,
    contactEmail: input.contactEmail,
    gstin: input.gstin,
    imageUrls: input.imageUrls ?? [],
    plans,
  })
}

export async function registerGymOwner(input: {
  email: string
  password: string
  gymName: string
  gymType: 'MEN' | 'WOMEN' | 'MIXED'
  address: GymAddress
  phone: string
  contactEmail: string
  gstin?: string
  imageUrls?: string[]
  plans?: Partial<GymBillingPlan>[]
}) {
  const exists = await User.findOne({ email: input.email.toLowerCase() })
  ensureEmailAvailable(exists)

  const passwordHash = await hashPassword(input.password)

  const owner = await User.create({
    email: input.email.toLowerCase(),
    passwordHash,
    authMethod: 'PASSWORD',
    role: UserRole.GYM_OWNER,
    isVerified: false,
  })

  const gym = await createGymForOwner(owner._id as mongoose.Types.ObjectId, {
    gymName: input.gymName,
    gymType: input.gymType,
    address: input.address,
    phone: input.phone,
    contactEmail: input.contactEmail,
    gstin: input.gstin,
    imageUrls: input.imageUrls,
    plans: input.plans,
  })

  await User.findByIdAndUpdate(owner._id, { gymId: gym._id })
  owner.gymId = gym._id as mongoose.Types.ObjectId
  await setAndSendVerificationOtp(owner)

  return {
    message: 'OTP sent to email. Verify your account before login.',
    email: owner.email,
    user: sanitizeUser(owner),
    gym,
  }
}

export async function registerGymOwnerOAuth(input: {
  provider: 'google' | 'facebook'
  idToken?: string
  accessToken?: string
  gymName: string
  gymType: 'MEN' | 'WOMEN' | 'MIXED'
  address: GymAddress
  phone: string
  contactEmail: string
  gstin?: string
  imageUrls?: string[]
  plans?: Partial<GymBillingPlan>[]
}) {
  const verified =
    input.provider === 'google'
      ? await verifyGoogleIdToken(input.idToken!)
      : await verifyFacebookAccessToken(input.accessToken!)

  const dupOAuth = await User.findOne({
    oauthAccounts: { $elemMatch: { provider: verified.provider, subject: verified.subject } },
  })
  if (dupOAuth) {
    throw new AppError('This OAuth account is already registered', 409)
  }

  const existingEmail = await User.findOne({ email: verified.email })
  if (existingEmail) {
    throw new AppError('Email already registered. Login or use a different account.', 409)
  }

  if (!verified.emailVerified && verified.provider === 'GOOGLE') {
    throw new AppError('Google email must be verified before registration', 400)
  }

  const owner = await User.create({
    email: verified.email,
    authMethod: verified.provider === 'GOOGLE' ? 'GOOGLE' : 'FACEBOOK',
    oauthAccounts: [{ provider: verified.provider, subject: verified.subject }],
    role: UserRole.GYM_OWNER,
    isVerified: true,
  })

  const gym = await createGymForOwner(owner._id as mongoose.Types.ObjectId, {
    gymName: input.gymName,
    gymType: input.gymType,
    address: input.address,
    phone: input.phone,
    contactEmail: input.contactEmail,
    gstin: input.gstin,
    imageUrls: input.imageUrls,
    plans: input.plans,
  })

  await User.findByIdAndUpdate(owner._id, { gymId: gym._id })
  owner.gymId = gym._id as mongoose.Types.ObjectId

  const token = issueTokenForUser(owner)

  return {
    message: 'Gym registered successfully.',
    token,
    user: sanitizeUser(owner),
    gym,
  }
}

export async function loginOAuth(input: {
  provider: 'google' | 'facebook'
  idToken?: string
  accessToken?: string
}) {
  const verified =
    input.provider === 'google'
      ? await verifyGoogleIdToken(input.idToken!)
      : await verifyFacebookAccessToken(input.accessToken!)

  const user = await User.findOne({
    oauthAccounts: { $elemMatch: { provider: verified.provider, subject: verified.subject } },
  })
  if (!user || !user.isActive) {
    throw new AppError('Invalid credentials', 401)
  }
  if (!user.isVerified) {
    throw new AppError('Email not verified', 403)
  }

  const token = issueTokenForUser(user)

  return { token, user: sanitizeUser(user) }
}

function issueTokenForUser(user: InstanceType<typeof User>) {
  const payload: Parameters<typeof signAccessToken>[0] = {
    sub: String(user._id),
    role: user.role,
  }
  if (user.gymId) payload.gymId = String(user.gymId)
  if (user.memberId) payload.memberId = String(user.memberId)
  return signAccessToken(payload)
}

export async function registerSuperAdmin(input: {
  email: string
  password: string
}) {
  const count = await User.countDocuments({ role: UserRole.SUPER_ADMIN })
  if (count > 0) {
    throw new AppError('Super admin already exists', 409)
  }

  const passwordHash = await hashPassword(input.password)
  const user = await User.create({
    email: input.email.toLowerCase(),
    passwordHash,
    authMethod: 'PASSWORD',
    role: UserRole.SUPER_ADMIN,
    isVerified: false,
  })
  await setAndSendVerificationOtp(user)

  return {
    message: 'OTP sent to email. Verify your account before login.',
    email: user.email,
    user: sanitizeUser(user),
  }
}

export async function registerMemberUser(input: {
  email: string
  password: string
  memberId: string
}) {
  const member = await Member.findById(input.memberId)
  if (!member) throw new AppError('Member record not found', 404)
  if (member.userId) throw new AppError('Member already linked to an account', 409)

  const exists = await User.findOne({ email: input.email.toLowerCase() })
  ensureEmailAvailable(exists)

  const passwordHash = await hashPassword(input.password)
  const user = await User.create({
    email: input.email.toLowerCase(),
    passwordHash,
    authMethod: 'PASSWORD',
    role: UserRole.GYM_MEMBER,
    gymId: member.gymId,
    memberId: member._id,
    isVerified: false,
  })

  member.userId = user._id as mongoose.Types.ObjectId
  await member.save()

  await setAndSendVerificationOtp(user)

  return {
    message: 'OTP sent to email. Verify your account before login.',
    email: user.email,
    user: sanitizeUser(user),
    memberId: String(member._id),
  }
}

export async function registerTrainer(input: {
  email: string
  password: string
  gymId: string
  ownerUserId: string
}) {
  const gym = await Gym.findById(input.gymId)
  if (!gym) throw new AppError('Gym not found', 404)
  if (String(gym.ownerId) !== input.ownerUserId) {
    throw new AppError('Forbidden', 403)
  }

  const exists = await User.findOne({ email: input.email.toLowerCase() })
  ensureEmailAvailable(exists)

  const passwordHash = await hashPassword(input.password)
  const user = await User.create({
    email: input.email.toLowerCase(),
    passwordHash,
    authMethod: 'PASSWORD',
    role: UserRole.GYM_TRAINER,
    gymId: gym._id,
    isVerified: false,
  })
  await setAndSendVerificationOtp(user)

  return {
    message: 'OTP sent to email. Verify your account before login.',
    email: user.email,
    user: sanitizeUser(user),
  }
}

export async function login(input: { email: string; password: string }) {
  const user = await User.findOne({ email: input.email.toLowerCase() })
  if (!user || !user.isActive) {
    throw new AppError('Invalid credentials', 401)
  }
  if (!user.isVerified) {
    throw new AppError(
      'Email not verified. Please verify OTP before login.',
      403
    )
  }

  if (!user.passwordHash) {
    throw new AppError(
      'This account uses Google or Facebook login. Use POST /auth/login/oauth.',
      400
    )
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash)
  if (!ok) throw new AppError('Invalid credentials', 401)

  const token = issueTokenForUser(user)

  return { token, user: sanitizeUser(user) }
}

function sanitizeUser(user: InstanceType<typeof User>) {
  return {
    id: String(user._id),
    email: user.email,
    authMethod: user.authMethod ?? 'PASSWORD',
    role: user.role,
    isVerified: user.isVerified,
    gymId: user.gymId ? String(user.gymId) : undefined,
    memberId: user.memberId ? String(user.memberId) : undefined,
  }
}

export async function getMe(userId: string) {
  const user = await User.findById(userId).lean()
  if (!user) throw new AppError('User not found', 404)
  return {
    id: String(user._id),
    email: user.email,
    authMethod: user.authMethod ?? 'PASSWORD',
    role: user.role,
    isVerified: user.isVerified,
    gymId: user.gymId ? String(user.gymId) : undefined,
    memberId: user.memberId ? String(user.memberId) : undefined,
  }
}

export async function verifyEmailOtp(input: { email: string; otp: string }) {
  const user = await User.findOne({ email: input.email.toLowerCase() })
  if (!user) throw new AppError('No account found with this email.', 404)
  if (user.isVerified) {
    return { message: 'Email is already verified.', alreadyVerified: true }
  }
  if (!user.verificationOtpHash || !user.verificationOtpExpiresAt) {
    throw new AppError('No OTP found. Please request resend OTP.', 400)
  }
  if (user.verificationOtpExpiresAt.getTime() < Date.now()) {
    throw new AppError('OTP expired. Please request resend OTP.', 400)
  }
  if (hashOtp(input.otp) !== user.verificationOtpHash) {
    throw new AppError('Invalid OTP.', 400)
  }

  user.isVerified = true
  user.verificationOtpHash = undefined
  user.verificationOtpExpiresAt = undefined
  await user.save()

  return {
    message: 'Email verified successfully.',
    user: sanitizeUser(user),
  }
}

export async function resendEmailOtp(input: { email: string }) {
  const user = await User.findOne({ email: input.email.toLowerCase() })
  if (!user) throw new AppError('No account found with this email.', 404)
  if (user.isVerified) {
    return { message: 'Email is already verified.', alreadyVerified: true }
  }
  await setAndSendVerificationOtp(user)
  return { message: 'OTP resent successfully.', email: user.email }
}
