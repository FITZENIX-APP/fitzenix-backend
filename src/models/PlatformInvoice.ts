import mongoose, { Document, Schema } from 'mongoose'

export interface IPlatformInvoice extends Document {
  gymId: mongoose.Types.ObjectId
  amountInr: number
  memberCountSnapshot: number
  periodStart: Date
  periodEnd: Date
  status: 'PENDING' | 'PAID' | 'VOID'
  createdAt: Date
}

const PlatformInvoiceSchema = new Schema<IPlatformInvoice>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    amountInr: { type: Number, required: true, min: 0 },
    memberCountSnapshot: { type: Number, required: true, min: 0 },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'VOID'],
      default: 'PENDING',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export default mongoose.model<IPlatformInvoice>('PlatformInvoice', PlatformInvoiceSchema)
