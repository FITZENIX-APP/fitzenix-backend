import mongoose from 'mongoose'
import Gym from '../models/Gym'
import Member from '../models/Member'
import User from '../models/user'
import { AppError } from '../utils/AppError'
import { slugify } from '../utils/slug'

export async function getGymForOwner(ownerId: string) {
  const gym = await Gym.findOne({ ownerId: new mongoose.Types.ObjectId(ownerId) }).lean()
  if (!gym) throw new AppError('Gym not found', 404)
  return gym
}

export async function updateGymForOwner(
  ownerId: string,
  input: Partial<{ name: string; type: 'CARDIO' | 'NORMAL' | 'MIXED'; address: string; phone: string }>
) {
  const gym = await Gym.findOne({ ownerId: new mongoose.Types.ObjectId(ownerId) })
  if (!gym) throw new AppError('Gym not found', 404)

  if (input.name) {
    gym.name = input.name
    const base = slugify(input.name) || gym.slug
    let slug = base
    let n = 1
    while (await Gym.findOne({ slug, _id: { $ne: gym._id } })) {
      slug = `${base}-${n++}`
    }
    gym.slug = slug
  }
  if (input.type) gym.type = input.type
  if (input.address !== undefined) gym.address = input.address
  if (input.phone !== undefined) gym.phone = input.phone

  await gym.save()
  return gym.toObject()
}

export async function listAllGyms() {
  return Gym.find({}).sort({ createdAt: -1 }).lean()
}

export async function getGymById(gymId: string) {
  const gym = await Gym.findById(gymId).lean()
  if (!gym) throw new AppError('Gym not found', 404)
  return gym
}

export async function countMembers(gymId: string): Promise<number> {
  return Member.countDocuments({ gymId: new mongoose.Types.ObjectId(gymId) })
}

export async function listTrainers(gymId: string) {
  return User.find({
    gymId: new mongoose.Types.ObjectId(gymId),
    role: 'GYM_TRAINER',
    isActive: true,
  })
    .select('email role gymId createdAt')
    .lean()
}
