import mongoose, { Document, Schema } from 'mongoose'

export type AttendanceStatus = 'PRESENT' | 'ABSENT'

export interface IAttendance extends Document {
  memberId: mongoose.Types.ObjectId
  gymId: mongoose.Types.ObjectId
  /** UTC date at start of local calendar day (store normalized YYYY-MM-DD via service). */
  day: Date
  status: AttendanceStatus
  createdAt: Date
  updatedAt: Date
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    day: { type: Date, required: true },
    status: { type: String, required: true, enum: ['PRESENT', 'ABSENT'] },
  },
  { timestamps: true }
)

AttendanceSchema.index({ memberId: 1, day: 1 }, { unique: true })

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema)
