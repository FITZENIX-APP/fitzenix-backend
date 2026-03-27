import { RequestHandler } from 'express'
import {
  getGymForOwner,
  updateGymForOwner,
  listTrainers,
  countMembers,
} from '../services/gym.service'
import { createMember, listMembers, updateMember } from '../services/member.service'
import {
  findMemberByUniqueId,
  markAttendance,
  monthlyAttendanceSummary,
} from '../services/attendance.service'
import { upsertWorkoutForDay, getTodayWorkoutForMember } from '../services/workout.service'
import { computePlatformMonthlyPrice } from '../services/subscription.service'
import { asyncHandler } from '../utils/asyncHandler'
import { AppError } from '../utils/AppError'

function requireOwner(req: Express.Request) {
  if (!req.user?.sub || !req.user.gymId) throw new AppError('Unauthorized', 401)
  if (req.user.role !== 'GYM_OWNER') throw new AppError('Forbidden', 403)
  return { ownerId: req.user.sub, gymId: req.user.gymId }
}

export const getOwnerGym: RequestHandler = asyncHandler(async (req, res) => {
  const { ownerId } = requireOwner(req)
  const gym = await getGymForOwner(ownerId)
  const members = await countMembers(String(gym._id))
  const pricing = await computePlatformMonthlyPrice(members)
  res.json({ gym, memberCount: members, platformSubscription: pricing })
})

export const patchOwnerGym: RequestHandler = asyncHandler(async (req, res) => {
  const { ownerId } = requireOwner(req)
  const gym = await updateGymForOwner(ownerId, req.body)
  res.json(gym)
})

export const getOwnerTrainers: RequestHandler = asyncHandler(async (req, res) => {
  const { gymId } = requireOwner(req)
  const trainers = await listTrainers(gymId)
  res.json(trainers)
})

export const postOwnerMembers: RequestHandler = asyncHandler(async (req, res) => {
  const { ownerId, gymId } = requireOwner(req)
  const member = await createMember({ ...req.body, gymId, ownerUserId: ownerId })
  res.status(201).json(member)
})

export const getOwnerMembers: RequestHandler = asyncHandler(async (req, res) => {
  const { ownerId, gymId } = requireOwner(req)
  const members = await listMembers(gymId, ownerId)
  res.json(members)
})

export const patchOwnerMember: RequestHandler = asyncHandler(async (req, res) => {
  const { ownerId, gymId } = requireOwner(req)
  const member = await updateMember(gymId, req.params.memberId, ownerId, req.body)
  res.json(member)
})

export const postAttendanceLookup: RequestHandler = asyncHandler(async (req, res) => {
  const { gymId } = requireOwner(req)
  const member = await findMemberByUniqueId(gymId, req.body.uniqueMemberId)
  res.json({ member })
})

export const postAttendanceMark: RequestHandler = asyncHandler(async (req, res) => {
  const { gymId } = requireOwner(req)
  const out = await markAttendance({
    gymId,
    memberId: req.body.memberId,
    status: req.body.status,
    day: req.body.day,
  })
  res.json(out)
})

export const getMemberAttendanceMonth: RequestHandler = asyncHandler(async (req, res) => {
  requireOwner(req)
  const { year, month } = req.query as unknown as {
    year: number
    month: number
  }
  const summary = await monthlyAttendanceSummary(
    req.params.memberId,
    year,
    month - 1
  )
  res.json(summary)
})

export const putWorkoutDay: RequestHandler = asyncHandler(async (req, res) => {
  const { ownerId, gymId } = requireOwner(req)
  const w = await upsertWorkoutForDay({
    gymId,
    ownerUserId: ownerId,
    day: req.body.day,
    title: req.body.title,
    description: req.body.description,
    exercises: req.body.exercises,
  })
  res.json(w)
})

export const getOwnerWorkoutToday: RequestHandler = asyncHandler(async (req, res) => {
  const { gymId } = requireOwner(req)
  const w = await getTodayWorkoutForMember(gymId)
  res.json(w ?? null)
})
