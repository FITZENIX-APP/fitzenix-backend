import mongoose from 'mongoose'
import NutritionLog from '../models/NutritionLog'
import Member from '../models/Member'
import { AppError } from '../utils/AppError'
import { startOfUtcDay } from '../utils/dates'

export async function upsertNutritionLog(input: {
  memberId: string
  gymId: string
  day?: Date
  calories: number
  proteinG: number
}) {
  const member = await Member.findById(input.memberId)
  if (!member) throw new AppError('Member not found', 404)
  if (String(member.gymId) !== input.gymId) throw new AppError('Forbidden', 403)

  const day = startOfUtcDay(input.day ?? new Date())

  const doc = await NutritionLog.findOneAndUpdate(
    { memberId: member._id, day },
    {
      $set: {
        gymId: member.gymId,
        calories: input.calories,
        proteinG: input.proteinG,
      },
    },
    { new: true, upsert: true }
  )

  return doc.toObject()
}

export async function getNutritionForDay(memberId: string, gymId: string, day: Date) {
  const d = startOfUtcDay(day)
  return NutritionLog.findOne({
    memberId: new mongoose.Types.ObjectId(memberId),
    gymId: new mongoose.Types.ObjectId(gymId),
    day: d,
  }).lean()
}

export async function listNutritionMonth(
  memberId: string,
  gymId: string,
  year: number,
  monthIndex0: number
) {
  const start = new Date(Date.UTC(year, monthIndex0, 1))
  const end = new Date(Date.UTC(year, monthIndex0 + 1, 1))

  return NutritionLog.find({
    memberId: new mongoose.Types.ObjectId(memberId),
    gymId: new mongoose.Types.ObjectId(gymId),
    day: { $gte: start, $lt: end },
  })
    .sort({ day: 1 })
    .lean()
}
