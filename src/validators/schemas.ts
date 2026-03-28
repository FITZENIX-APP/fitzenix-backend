import { z } from 'zod'

const gymAudienceEnum = z.enum(['MEN', 'WOMEN', 'MIXED'])

export const addressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
})

const gymPlanRowSchema = z.object({
  billingPeriod: z.enum(['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY']),
  enabled: z.boolean().optional(),
  price: z.number().min(0).optional(),
  workoutsIncluded: z
    .object({
      cardio: z.boolean().optional(),
      weightLoss: z.boolean().optional(),
      weightGain: z.boolean().optional(),
      normal: z.boolean().optional(),
    })
    .optional(),
})

const optionalNonEmptyString = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.string().min(1).optional()
)

const optionalImageUrls = z.preprocess((val) => {
  if (val === undefined || val === null) return undefined
  if (!Array.isArray(val)) return val
  return val.filter((s: unknown) => typeof s === 'string' && s.trim().length > 0)
}, z.array(z.string().min(1)).max(10).optional())

/**
 * Clients often send `address: {}` or all empty strings; treat that as "no address"
 * so inner fields are not validated as mandatory.
 */
function addressPayloadToUndefinedIfEmpty(val: unknown): unknown {
  if (val === undefined || val === null) return undefined
  if (typeof val !== 'object' || Array.isArray(val)) return val
  const o = val as Record<string, unknown>
  const keys = ['line1', 'line2', 'city', 'state', 'postalCode', 'country'] as const
  const hasNonEmpty = keys.some((k) => {
    const v = o[k]
    return typeof v === 'string' && v.trim().length > 0
  })
  return hasNonEmpty ? val : undefined
}

const optionalAddressForRegistration = z.preprocess(
  addressPayloadToUndefinedIfEmpty,
  addressSchema.optional()
)

/** Shared gym profile for owner registration (password or OAuth). */
export const gymRegistrationBodySchema = z.object({
  gymName: z.string().min(2),
  gymType: gymAudienceEnum,
  address: optionalAddressForRegistration,
  phone: optionalNonEmptyString,
  contactEmail: z.string().email(),
  gstin: z.string().optional(),
  imageUrls: optionalImageUrls,
  plans: z.array(gymPlanRowSchema).optional(),
})

export const registerOwnerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
  })
  .merge(gymRegistrationBodySchema)

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const registerMemberUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  memberId: z.string().min(1),
})

export const registerTrainerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  /** Required when the caller is SUPER_ADMIN; ignored for GYM_OWNER (JWT gym is used). */
  gymId: z.string().min(1).optional(),
})

export const registerSuperAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
})

export const verifyEmailOtpSchema = z.object({
  email: z.string().email(),
  otp: z
    .string()
    .regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
})

export const resendEmailOtpSchema = z.object({
  email: z.string().email(),
})

export const updateGymSchema = z.object({
  name: z.string().min(2).optional(),
  type: gymAudienceEnum.optional(),
  address: addressSchema.partial().optional(),
  phone: z.string().optional(),
  contactEmail: z.string().email().optional(),
  gstin: z.string().optional(),
  imageUrls: z.array(z.string().min(1)).max(10).optional(),
  plans: z.array(gymPlanRowSchema).optional(),
})

export const oauthRegisterGymOwnerSchema = z
  .object({
    provider: z.enum(['google', 'facebook']),
    idToken: z.string().optional(),
    accessToken: z.string().optional(),
  })
  .merge(gymRegistrationBodySchema)
  .refine(
    (d) => (d.provider === 'google' ? Boolean(d.idToken) : Boolean(d.accessToken)),
    { message: 'Google requires idToken; Facebook requires accessToken' }
  )

export const oauthLoginSchema = z
  .object({
    provider: z.enum(['google', 'facebook']),
    idToken: z.string().optional(),
    accessToken: z.string().optional(),
  })
  .refine(
    (d) => (d.provider === 'google' ? Boolean(d.idToken) : Boolean(d.accessToken)),
    { message: 'Google requires idToken; Facebook requires accessToken' }
  )

export const createMemberSchema = z.object({
  uniqueMemberId: z.string().min(1),
  name: z.string().min(1),
  joinDate: z.coerce.date(),
  planDurationMonths: z.coerce.number().int().min(1),
  phone: z.string().optional(),
})

export const updateMemberSchema = z.object({
  name: z.string().min(1).optional(),
  joinDate: z.coerce.date().optional(),
  planDurationMonths: z.coerce.number().int().min(1).optional(),
  phone: z.string().optional(),
})

export const attendanceLookupSchema = z.object({
  uniqueMemberId: z.string().min(1),
})

export const attendanceMarkSchema = z.object({
  memberId: z.string().min(1),
  status: z.enum(['PRESENT', 'ABSENT']),
  day: z.coerce.date().optional(),
})

export const monthQuerySchema = z.object({
  year: z.coerce.number().int(),
  month: z.coerce.number().int().min(1).max(12),
})

export const workoutUpsertSchema = z.object({
  day: z.coerce.date(),
  title: z.string().min(1),
  description: z.string().optional(),
  exercises: z
    .array(
      z.object({
        name: z.string().min(1),
        sets: z.number().optional(),
        reps: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .default([]),
})

export const nutritionUpsertSchema = z.object({
  day: z.coerce.date().optional(),
  calories: z.coerce.number().min(0),
  proteinG: z.coerce.number().min(0),
})

export const pricingUpdateSchema = z.object({
  freeTierMaxMembers: z.number().int().min(0).optional(),
  midTierFlatInr: z.number().min(0).optional(),
  baseAbove100Inr: z.number().min(0).optional(),
  memberBlockSize: z.number().int().min(1).optional(),
  blockPriceInr: z.number().min(0).optional(),
})

export const reminderTestSchema = z.object({
  memberId: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
})
