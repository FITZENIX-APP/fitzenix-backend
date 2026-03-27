import { RequestHandler } from 'express'
import { getMember } from '../services/member.service'
import { getTodayWorkoutForMember } from '../services/workout.service'
import {
  upsertNutritionLog,
  getNutritionForDay,
  listNutritionMonth,
} from '../services/nutrition.service'
import { monthlyAttendanceSummary } from '../services/attendance.service'
import { asyncHandler } from '../utils/asyncHandler'
import { AppError } from '../utils/AppError'

function requireMember(req: Express.Request) {
  if (!req.user?.memberId || !req.user.gymId) {
    throw new AppError('Unauthorized', 401)
  }
  if (req.user.role !== 'GYM_MEMBER') throw new AppError('Forbidden', 403)
  return { memberId: req.user.memberId, gymId: req.user.gymId }
}

export const getMemberProfile: RequestHandler = asyncHandler(async (req, res) => {
  const { memberId, gymId } = requireMember(req)
  const member = await getMember(gymId, memberId, {
    role: req.user!.role,
    gymId: req.user!.gymId,
    memberId: req.user!.memberId,
  })
  res.json(member)
})

export const getMemberWorkoutToday: RequestHandler = asyncHandler(async (req, res) => {
  const { gymId } = requireMember(req)
  const w = await getTodayWorkoutForMember(gymId)
  res.json(w ?? null)
})

export const putMemberNutrition: RequestHandler = asyncHandler(async (req, res) => {
  const { memberId, gymId } = requireMember(req)
  const log = await upsertNutritionLog({
    memberId,
    gymId,
    day: req.body.day,
    calories: req.body.calories,
    proteinG: req.body.proteinG,
  })
  res.json(log)
})

export const getMemberNutritionDay: RequestHandler = asyncHandler(async (req, res) => {
  const { memberId, gymId } = requireMember(req)
  const day = new Date(String(req.query.date ?? req.query.day ?? new Date()))
  const log = await getNutritionForDay(memberId, gymId, day)
  res.json(log ?? null)
})

export const getMemberNutritionMonth: RequestHandler = asyncHandler(async (req, res) => {
  const { memberId, gymId } = requireMember(req)
  const year = Number(req.query.year)
  const month = Number(req.query.month)
  const rows = await listNutritionMonth(memberId, gymId, year, month - 1)
  res.json(rows)
})

export const getMemberAttendanceMonth: RequestHandler = asyncHandler(async (req, res) => {
  const { memberId } = requireMember(req)
  const year = Number(req.query.year)
  const month = Number(req.query.month)
  const summary = await monthlyAttendanceSummary(memberId, year, month - 1)
  res.json(summary)
})
