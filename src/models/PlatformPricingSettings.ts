import mongoose, { Document, Schema } from 'mongoose'

/**
 * Singleton-style platform SaaS pricing (Super Admin editable).
 * Spec: ≤30 free; >100 base ₹500; each extra 100 members +₹500.
 * Gap 31–100: charged as first paid block (configurable).
 */
export interface IPlatformPricingSettings extends Document {
  key: string
  freeTierMaxMembers: number
  /** Members 31–100 (inclusive) bill this flat amount in INR per month. */
  midTierFlatInr: number
  /** When member count > 100, this is the base monthly amount before extra blocks. */
  baseAbove100Inr: number
  /** Each additional block of this many members adds `blockPriceInr`. */
  memberBlockSize: number
  blockPriceInr: number
  updatedAt: Date
}

const PlatformPricingSettingsSchema = new Schema<IPlatformPricingSettings>(
  {
    key: { type: String, required: true, unique: true, default: 'default' },
    freeTierMaxMembers: { type: Number, required: true, default: 30 },
    midTierFlatInr: { type: Number, required: true, default: 500 },
    baseAbove100Inr: { type: Number, required: true, default: 500 },
    memberBlockSize: { type: Number, required: true, default: 100 },
    blockPriceInr: { type: Number, required: true, default: 500 },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
)

export default mongoose.model<IPlatformPricingSettings>(
  'PlatformPricingSettings',
  PlatformPricingSettingsSchema
)
