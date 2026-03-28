import mongoose, { Document, Schema } from 'mongoose'
import { UserRoleType } from '../types/roles'

export type OAuthProvider = 'GOOGLE' | 'FACEBOOK'

export interface IOAuthAccount {
  provider: OAuthProvider
  /** Subject / user id from the IdP (e.g. Google "sub", Facebook id). */
  subject: string
}

export interface IUser extends Document {
  email: string
  /** Present when authMethod is PASSWORD or user also set a password. */
  passwordHash?: string
  authMethod: 'PASSWORD' | 'GOOGLE' | 'FACEBOOK'
  oauthAccounts: IOAuthAccount[]
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

const OAuthAccountSchema = new Schema<IOAuthAccount>(
  {
    provider: { type: String, required: true, enum: ['GOOGLE', 'FACEBOOK'] },
    subject: { type: String, required: true },
  },
  { _id: false }
)

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    authMethod: {
      type: String,
      required: true,
      enum: ['PASSWORD', 'GOOGLE', 'FACEBOOK'],
      default: 'PASSWORD',
    },
    oauthAccounts: { type: [OAuthAccountSchema], default: [] },
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

UserSchema.index(
  { 'oauthAccounts.provider': 1, 'oauthAccounts.subject': 1 },
  { unique: true, sparse: true }
)

export default mongoose.model<IUser>('User', UserSchema)
