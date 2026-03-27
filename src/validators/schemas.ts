import { z } from 'zod'

const gymTypeEnum = z.enum(['CARDIO', 'NORMAL', 'MIXED'])

export const registerOwnerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  gymName: z.string().min(2),
  gymType: gymTypeEnum,
  address: z.string().optional(),
  phone: z.string().optional(),
})

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
  type: gymTypeEnum.optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
})

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
