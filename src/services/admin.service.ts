import PlatformInvoice from '../models/PlatformInvoice'
import Gym from '../models/Gym'
import { computePlatformMonthlyPrice } from './subscription.service'
import { countMembers } from './gym.service'

export async function revenueSummary() {
  const paid = await PlatformInvoice.aggregate([
    { $match: { status: 'PAID' } },
    {
      $group: {
        _id: null,
        totalInr: { $sum: '$amountInr' },
        count: { $sum: 1 },
      },
    },
  ])

  const pending = await PlatformInvoice.aggregate([
    { $match: { status: 'PENDING' } },
    {
      $group: {
        _id: null,
        totalInr: { $sum: '$amountInr' },
        count: { $sum: 1 },
      },
    },
  ])

  return {
    paid: paid[0] ?? { totalInr: 0, count: 0 },
    pending: pending[0] ?? { totalInr: 0, count: 0 },
  }
}

export async function projectedMrr() {
  const gyms = await Gym.find({ isActive: true }).select('_id').lean()
  let mrr = 0
  for (const g of gyms) {
    const n = await countMembers(String(g._id))
    const p = await computePlatformMonthlyPrice(n)
    mrr += p.monthlyAmountInr
  }
  return { projectedMonthlyRevenueInr: mrr, gymCount: gyms.length }
}
