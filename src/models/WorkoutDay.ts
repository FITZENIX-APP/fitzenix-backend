import mongoose, { Document, Schema } from 'mongoose'

export interface WorkoutExercise {
  name: string
  sets?: number
  reps?: string
  notes?: string
}

export interface IWorkoutDay extends Document {
  gymId: mongoose.Types.ObjectId
  day: Date
  title: string
  description?: string
  exercises: WorkoutExercise[]
  createdAt: Date
  updatedAt: Date
}

const ExerciseSchema = new Schema<WorkoutExercise>(
  {
    name: { type: String, required: true },
    sets: { type: Number },
    reps: { type: String },
    notes: { type: String },
  },
  { _id: false }
)

const WorkoutDaySchema = new Schema<IWorkoutDay>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
    day: { type: Date, required: true },
    title: { type: String, required: true },
    description: { type: String },
    exercises: { type: [ExerciseSchema], default: [] },
  },
  { timestamps: true }
)

WorkoutDaySchema.index({ gymId: 1, day: 1 }, { unique: true })

export default mongoose.model<IWorkoutDay>('WorkoutDay', WorkoutDaySchema)
