import mongoose, { Document, Schema } from 'mongoose'
import { GymTypeValue } from '../types/roles'

export interface IGym extends Document {
  ownerId: mongoose.Types.ObjectId
  name: string
  slug: string
  type: GymTypeValue
  address?: string
  phone?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const GymSchema = new Schema<IGym>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['CARDIO', 'NORMAL', 'MIXED'],
    },
    address: { type: String },
    phone: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.model<IGym>('Gym', GymSchema)
