import PlatformPricingSettings from '../models/PlatformPricingSettings'

export type PricingBreakdown = {
  memberCount: number
  monthlyAmountInr: number
  freeTierMaxMembers: number
  notes: string[]
}

/**
 * Platform SaaS pricing for a gym based on active member count.
 *
 * Rules (from product defaults, editable via PlatformPricingSettings):
 * - Up to `freeTierMaxMembers` → FREE
 * - 31–100 members → `midTierFlatInr` / month (covers gap in original spec)
 * - Above 100 → `baseAbove100Inr` + ceil((n - 100) / memberBlockSize) * blockPriceInr
 */
export async function computePlatformMonthlyPrice(
  memberCount: number
): Promise<PricingBreakdown> {
  const settings =
    (await PlatformPricingSettings.findOne({ key: 'default' })) ??
    (await PlatformPricingSettings.create({
      key: 'default',
      freeTierMaxMembers: 30,
      midTierFlatInr: 500,
      baseAbove100Inr: 500,
      memberBlockSize: 100,
      blockPriceInr: 500,
    }))

  const notes: string[] = []
  const n = Math.max(0, Math.floor(memberCount))
  const freeMax = settings.freeTierMaxMembers

  if (n <= freeMax) {
    return {
      memberCount: n,
      monthlyAmountInr: 0,
      freeTierMaxMembers: freeMax,
      notes: [`Free tier: up to ${freeMax} members.`],
    }
  }

  if (n <= 100) {
    notes.push('Mid tier: between free limit and 100 members (flat).')
    return {
      memberCount: n,
      monthlyAmountInr: settings.midTierFlatInr,
      freeTierMaxMembers: freeMax,
      notes,
    }
  }

  const above100 = n - 100
  const extraBlocks = Math.ceil(above100 / settings.memberBlockSize)
  const amount =
    settings.baseAbove100Inr + extraBlocks * settings.blockPriceInr

  notes.push(
    `Above 100 members: base ₹${settings.baseAbove100Inr} + ${extraBlocks} × block (₹${settings.blockPriceInr} per ${settings.memberBlockSize} members).`
  )

  return {
    memberCount: n,
    monthlyAmountInr: amount,
    freeTierMaxMembers: freeMax,
    notes,
  }
}

export async function updatePricingSettings(input: {
  freeTierMaxMembers?: number
  midTierFlatInr?: number
  baseAbove100Inr?: number
  memberBlockSize?: number
  blockPriceInr?: number
}) {
  const doc = await PlatformPricingSettings.findOneAndUpdate(
    { key: 'default' },
    { $set: input },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
  return doc
}

export async function getPricingSettings() {
  return (
    (await PlatformPricingSettings.findOne({ key: 'default' })) ??
    (await PlatformPricingSettings.create({
      key: 'default',
      freeTierMaxMembers: 30,
      midTierFlatInr: 500,
      baseAbove100Inr: 500,
      memberBlockSize: 100,
      blockPriceInr: 500,
    }))
  )
}
