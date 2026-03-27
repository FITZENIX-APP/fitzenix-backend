import mongoose, { Document, Schema } from 'mongoose'

export interface INutritionLog extends Document {
  memberId: mongoose.Types.ObjectId
  gymId: mongoose.Types.ObjectId
  day: Date
  calories: number
  proteinG: number
  createdAt: Date
  updatedAt: Date
}

const NutritionLogSchema = new Schema<INutritionLog>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    day: { type: Date, required: true },
    calories: { type: Number, required: true, min: 0 },
    proteinG: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
)

NutritionLogSchema.index({ memberId: 1, day: 1 }, { unique: true })

export default mongoose.model<INutritionLog>('NutritionLog', NutritionLogSchema)
