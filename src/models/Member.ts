import mongoose, { Document, Schema } from 'mongoose'

export interface IMember extends Document {
  gymId: mongoose.Types.ObjectId
  userId?: mongoose.Types.ObjectId
  uniqueMemberId: string
  name: string
  joinDate: Date
  /** Plan length in whole months (maps to calendar month expiry, e.g. Feb 5 + 1 month → Mar 5). */
  planDurationMonths: number
  subscriptionEndDate: Date
  phone?: string
  createdAt: Date
  updatedAt: Date
}

const MemberSchema = new Schema<IMember>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    uniqueMemberId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    joinDate: { type: Date, required: true },
    planDurationMonths: { type: Number, required: true, min: 1 },
    subscriptionEndDate: { type: Date, required: true, index: true },
    phone: { type: String },
  },
  { timestamps: true }
)

MemberSchema.index({ gymId: 1, uniqueMemberId: 1 }, { unique: true })

export default mongoose.model<IMember>('Member', MemberSchema)
