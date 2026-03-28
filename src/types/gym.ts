/** Who the gym primarily serves (multi-tenant gym profile). */
export const GymAudienceType = {
  MEN: 'MEN',
  WOMEN: 'WOMEN',
  MIXED: 'MIXED',
} as const

export type GymAudienceTypeValue = (typeof GymAudienceType)[keyof typeof GymAudienceType]

/** Fixed SaaS billing periods for member subscriptions. */
export const BillingPeriod = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  HALF_YEARLY: 'HALF_YEARLY',
  YEARLY: 'YEARLY',
} as const

export type BillingPeriodValue = (typeof BillingPeriod)[keyof typeof BillingPeriod]

export type WorkoutsIncluded = {
  cardio: boolean
  weightLoss: boolean
  weightGain: boolean
  normal: boolean
}

export type GymBillingPlan = {
  billingPeriod: BillingPeriodValue
  enabled: boolean
  /** Price in smallest currency unit or whole currency unit — document per deployment. */
  price: number
  workoutsIncluded: WorkoutsIncluded
}

export type GymAddress = {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}
