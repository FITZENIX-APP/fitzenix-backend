import mongoose from 'mongoose'
import WorkoutDay from '../models/WorkoutDay'
import Gym from '../models/Gym'
import { AppError } from '../utils/AppError'
import { startOfUtcDay } from '../utils/dates'

export async function upsertWorkoutForDay(input: {
  gymId: string
  ownerUserId: string
  day: Date
  title: string
  description?: string
  exercises: { name: string; sets?: number; reps?: string; notes?: string }[]
}) {
  const gym = await Gym.findById(input.gymId)
  if (!gym) throw new AppError('Gym not found', 404)
  if (String(gym.ownerId) !== input.ownerUserId) throw new AppError('Forbidden', 403)

  const day = startOfUtcDay(input.day)

  const doc = await WorkoutDay.findOneAndUpdate(
    { gymId: new mongoose.Types.ObjectId(input.gymId), day },
    {
      $set: {
        title: input.title,
        description: input.description,
        exercises: input.exercises ?? [],
      },
    },
    { new: true, upsert: true }
  )

  return doc.toObject()
}

export async function getWorkoutForDay(gymId: string, day: Date) {
  const d = startOfUtcDay(day)
  const w = await WorkoutDay.findOne({
    gymId: new mongoose.Types.ObjectId(gymId),
    day: d,
  }).lean()
  return w
}

export async function getTodayWorkoutForMember(gymId: string) {
  return getWorkoutForDay(gymId, new Date())
}
