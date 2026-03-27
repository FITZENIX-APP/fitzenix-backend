import mongoose, { Document, Schema } from 'mongoose'
import { UserRoleType } from '../types/roles'

export interface IUser extends Document {
  email: string
  passwordHash: string
  role: UserRoleType
  gymId?: mongoose.Types.ObjectId
  memberId?: mongoose.Types.ObjectId
  isVerified: boolean
  verificationOtpHash?: string
  verificationOtpExpiresAt?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['SUPER_ADMIN', 'GYM_OWNER', 'GYM_TRAINER', 'GYM_MEMBER'],
    },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', index: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', index: true },
    isVerified: { type: Boolean, default: false, index: true },
    verificationOtpHash: { type: String },
    verificationOtpExpiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.model<IUser>('User', UserSchema)
