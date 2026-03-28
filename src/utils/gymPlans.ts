import { BillingPeriod } from '../types/gym'
import type { GymBillingPlan } from '../types/gym'

const emptyWorkouts = {
  cardio: false,
  weightLoss: false,
  weightGain: false,
  normal: false,
}

/** Four fixed plan slots for every gym (SaaS product definition). */
export function defaultGymBillingPlans(): GymBillingPlan[] {
  return [
    {
      billingPeriod: BillingPeriod.MONTHLY,
      enabled: false,
      price: 0,
      workoutsIncluded: { ...emptyWorkouts },
    },
    {
      billingPeriod: BillingPeriod.QUARTERLY,
      enabled: false,
      price: 0,
      workoutsIncluded: { ...emptyWorkouts },
    },
    {
      billingPeriod: BillingPeriod.HALF_YEARLY,
      enabled: false,
      price: 0,
      workoutsIncluded: { ...emptyWorkouts },
    },
    {
      billingPeriod: BillingPeriod.YEARLY,
      enabled: false,
      price: 0,
      workoutsIncluded: { ...emptyWorkouts },
    },
  ]
}

/** Merge client-provided plan toggles onto defaults (by billingPeriod). */
export function mergeGymPlans(
  defaults: GymBillingPlan[],
  input: Partial<GymBillingPlan>[] | undefined
): GymBillingPlan[] {
  if (!input?.length) return defaults
  const byPeriod = new Map(defaults.map((p) => [p.billingPeriod, { ...p }]))
  for (const row of input) {
    if (!row.billingPeriod) continue
    const cur = byPeriod.get(row.billingPeriod as (typeof defaults)[0]['billingPeriod'])
    if (!cur) continue
    if (row.enabled !== undefined) cur.enabled = row.enabled
    if (row.price !== undefined) cur.price = row.price
    if (row.workoutsIncluded) {
      cur.workoutsIncluded = {
        ...cur.workoutsIncluded,
        ...row.workoutsIncluded,
      }
    }
  }
  return Array.from(byPeriod.values())
}
