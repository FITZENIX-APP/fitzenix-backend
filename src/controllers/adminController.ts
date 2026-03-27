import { RequestHandler } from 'express'
import { listAllGyms, getGymById, countMembers } from '../services/gym.service'
import { revenueSummary, projectedMrr } from '../services/admin.service'
import {
  getPricingSettings,
  updatePricingSettings,
  computePlatformMonthlyPrice,
} from '../services/subscription.service'
import {
  findMembersExpiringSoon,
  sendWhatsAppReminder,
} from '../services/reminder.service'
import { asyncHandler } from '../utils/asyncHandler'

export const getAdminGyms: RequestHandler = asyncHandler(async (_req, res) => {
  const gyms = await listAllGyms()
  const withCounts = await Promise.all(
    gyms.map(async (g) => ({
      ...g,
      memberCount: await countMembers(String(g._id)),
    }))
  )
  res.json(withCounts)
})

export const getAdminGym: RequestHandler = asyncHandler(async (req, res) => {
  const gym = await getGymById(req.params.gymId)
  const members = await countMembers(req.params.gymId)
  const pricing = await computePlatformMonthlyPrice(members)
  res.json({ gym, memberCount: members, platformSubscription: pricing })
})

export const getAdminRevenue: RequestHandler = asyncHandler(async (_req, res) => {
  const [rev, mrr] = await Promise.all([revenueSummary(), projectedMrr()])
  res.json({ invoices: rev, projected: mrr })
})

export const getAdminPricing: RequestHandler = asyncHandler(async (_req, res) => {
  const settings = await getPricingSettings()
  res.json(settings)
})

export const patchAdminPricing: RequestHandler = asyncHandler(async (req, res) => {
  const settings = await updatePricingSettings(req.body)
  res.json(settings)
})

export const postAdminReminderTest: RequestHandler = asyncHandler(async (req, res) => {
  const phone = req.body.phone ?? '+910000000000'
  const message =
    req.body.message ??
    'Your gym subscription is ending soon. Renew to keep access.'
  const result = await sendWhatsAppReminder({
    toPhone: phone,
    body: message,
    memberId: req.body.memberId ?? 'test',
    gymId: 'test',
  })
  res.json(result)
})

export const getAdminExpiringMembers: RequestHandler = asyncHandler(async (req, res) => {
  const daysAhead = Number(req.query.days ?? 7)
  const gymId = req.query.gymId ? String(req.query.gymId) : undefined
  const members = await findMembersExpiringSoon(gymId, daysAhead)
  res.json(members)
})
