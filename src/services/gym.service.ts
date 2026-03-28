import mongoose from 'mongoose'
import Gym from '../models/Gym'
import Member from '../models/Member'
import User from '../models/user'
import type { GymAddress } from '../types/gym'
import type { GymBillingPlan } from '../types/gym'
import { AppError } from '../utils/AppError'
import { defaultGymBillingPlans, mergeGymPlans } from '../utils/gymPlans'
import { slugify } from '../utils/slug'

export async function getGymForOwner(ownerId: string) {
  const gym = await Gym.findOne({ ownerId: new mongoose.Types.ObjectId(ownerId) }).lean()
  if (!gym) throw new AppError('Gym not found', 404)
  return gym
}

export async function updateGymForOwner(
  ownerId: string,
  input: Partial<{
    name: string
    type: 'MEN' | 'WOMEN' | 'MIXED'
    address: Partial<GymAddress>
    phone: string
    contactEmail: string
    gstin: string
    imageUrls: string[]
    plans: Partial<GymBillingPlan>[]
  }>
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
  if (input.address !== undefined) {
    const cur = gym.address ? { ...gym.address } : {}
    Object.assign(cur, input.address)
    gym.address = cur as GymAddress
  }
  if (input.phone !== undefined) gym.phone = input.phone
  if (input.contactEmail !== undefined) gym.contactEmail = input.contactEmail
  if (input.gstin !== undefined) gym.gstin = input.gstin
  if (input.imageUrls !== undefined) gym.imageUrls = input.imageUrls
  if (input.plans !== undefined) {
    const base: GymBillingPlan[] =
      gym.plans?.length
        ? gym.plans.map((p) => ({
            billingPeriod: p.billingPeriod as GymBillingPlan['billingPeriod'],
            enabled: p.enabled,
            price: p.price,
            workoutsIncluded: {
              cardio: Boolean(p.workoutsIncluded?.cardio),
              weightLoss: Boolean(p.workoutsIncluded?.weightLoss),
              weightGain: Boolean(p.workoutsIncluded?.weightGain),
              normal: Boolean(p.workoutsIncluded?.normal),
            },
          }))
        : defaultGymBillingPlans()
    gym.plans = mergeGymPlans(base, input.plans)
  }

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
