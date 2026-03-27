import mongoose from 'mongoose'
import Member from '../models/Member'
import Gym from '../models/Gym'
import { AppError } from '../utils/AppError'
import { computeSubscriptionEndDate } from './attendance.service'

export async function createMember(input: {
  gymId: string
  ownerUserId: string
  uniqueMemberId: string
  name: string
  joinDate: Date
  planDurationMonths: number
  phone?: string
}) {
  const gym = await Gym.findById(input.gymId)
  if (!gym) throw new AppError('Gym not found', 404)
  if (String(gym.ownerId) !== input.ownerUserId) {
    throw new AppError('Forbidden', 403)
  }

  const subscriptionEndDate = computeSubscriptionEndDate(
    input.joinDate,
    input.planDurationMonths
  )

  try {
    const member = await Member.create({
      gymId: gym._id,
      uniqueMemberId: input.uniqueMemberId.trim(),
      name: input.name.trim(),
      joinDate: input.joinDate,
      planDurationMonths: input.planDurationMonths,
      subscriptionEndDate,
      phone: input.phone,
    })
    return member.toObject()
  } catch (e: unknown) {
    if (
      e &&
      typeof e === 'object' &&
      'code' in e &&
      (e as { code: number }).code === 11000
    ) {
      throw new AppError('Unique member ID already exists for this gym', 409)
    }
    throw e
  }
}

export async function listMembers(gymId: string, ownerUserId: string) {
  const gym = await Gym.findById(gymId)
  if (!gym) throw new AppError('Gym not found', 404)
  if (String(gym.ownerId) !== ownerUserId) throw new AppError('Forbidden', 403)

  return Member.find({ gymId: new mongoose.Types.ObjectId(gymId) })
    .sort({ createdAt: -1 })
    .lean()
}

export async function getMember(gymId: string, memberId: string, requester: { role: string; gymId?: string; memberId?: string }) {
  const member = await Member.findById(memberId).lean()
  if (!member || String(member.gymId) !== gymId) {
    throw new AppError('Member not found', 404)
  }
  if (requester.role === 'GYM_MEMBER' && requester.memberId !== memberId) {
    throw new AppError('Forbidden', 403)
  }
  if (
    (requester.role === 'GYM_OWNER' || requester.role === 'GYM_TRAINER') &&
    requester.gymId !== gymId
  ) {
    throw new AppError('Forbidden', 403)
  }
  return member
}

export async function updateMember(
  gymId: string,
  memberId: string,
  ownerUserId: string,
  input: Partial<{
    name: string
    joinDate: Date
    planDurationMonths: number
    phone: string
  }>
) {
  const gym = await Gym.findById(gymId)
  if (!gym) throw new AppError('Gym not found', 404)
  if (String(gym.ownerId) !== ownerUserId) throw new AppError('Forbidden', 403)

  const member = await Member.findOne({
    _id: new mongoose.Types.ObjectId(memberId),
    gymId: new mongoose.Types.ObjectId(gymId),
  })
  if (!member) throw new AppError('Member not found', 404)

  if (input.name !== undefined) member.name = input.name
  if (input.phone !== undefined) member.phone = input.phone
  if (input.joinDate !== undefined) member.joinDate = input.joinDate
  if (input.planDurationMonths !== undefined) {
    member.planDurationMonths = input.planDurationMonths
  }

  member.subscriptionEndDate = computeSubscriptionEndDate(
    member.joinDate,
    member.planDurationMonths
  )

  await member.save()
  return member.toObject()
}
