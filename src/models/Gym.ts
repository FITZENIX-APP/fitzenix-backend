import mongoose, { Document, Schema } from 'mongoose'
import { GymAddress, GymAudienceTypeValue, GymBillingPlan } from '../types/gym'

export interface IGym extends Document {
  ownerId: mongoose.Types.ObjectId
  name: string
  slug: string
  type: GymAudienceTypeValue
  address?: GymAddress
  phone?: string
  contactEmail?: string
  gstin?: string
  imageUrls: string[]
  /** Four fixed slots: monthly, quarterly, half-yearly, yearly — toggles and pricing per gym. */
  plans: GymBillingPlan[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const AddressSchema = new Schema<GymAddress>(
  {
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  { _id: false }
)

const WorkoutsIncludedSchema = new Schema(
  {
    cardio: { type: Boolean, default: false },
    weightLoss: { type: Boolean, default: false },
    weightGain: { type: Boolean, default: false },
    normal: { type: Boolean, default: false },
  },
  { _id: false }
)

const PlanSchema = new Schema<GymBillingPlan>(
  {
    billingPeriod: {
      type: String,
      required: true,
      enum: ['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'],
    },
    enabled: { type: Boolean, default: false },
    price: { type: Number, required: true, min: 0, default: 0 },
    workoutsIncluded: { type: WorkoutsIncludedSchema, required: true },
  },
  { _id: false }
)

const GymSchema = new Schema<IGym>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['MEN', 'WOMEN', 'MIXED'],
    },
    address: { type: AddressSchema },
    phone: { type: String, trim: true },
    contactEmail: { type: String, lowercase: true, trim: true },
    gstin: { type: String, trim: true },
    imageUrls: {
      type: [String],
      validate: [(v: string[]) => v.length <= 10, 'Max 10 images'],
      default: [],
    },
    plans: {
      type: [PlanSchema],
      default: [],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.model<IGym>('Gym', GymSchema)
