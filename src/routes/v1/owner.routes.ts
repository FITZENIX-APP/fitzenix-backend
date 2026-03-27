import { Router } from 'express'
import {
  getOwnerGym,
  patchOwnerGym,
  getOwnerTrainers,
  postOwnerMembers,
  getOwnerMembers,
  patchOwnerMember,
  postAttendanceLookup,
  postAttendanceMark,
  getMemberAttendanceMonth,
  putWorkoutDay,
  getOwnerWorkoutToday,
} from '../../controllers/ownerController'
import { getMember } from '../../services/member.service'
import { asyncHandler } from '../../utils/asyncHandler'
import { requireAuth } from '../../middleware/auth'
import { requireRoles } from '../../middleware/rbac'
import { UserRole } from '../../types/roles'
import { validateBody, validateQuery } from '../../middleware/validate'
import {
  updateGymSchema,
  createMemberSchema,
  updateMemberSchema,
  attendanceLookupSchema,
  attendanceMarkSchema,
  monthQuerySchema,
  workoutUpsertSchema,
} from '../../validators/schemas'

const r = Router()

r.use(requireAuth, requireRoles(UserRole.GYM_OWNER))

r.get('/gym', getOwnerGym)
r.patch('/gym', validateBody(updateGymSchema), patchOwnerGym)

r.get('/trainers', getOwnerTrainers)

r.post('/members', validateBody(createMemberSchema), postOwnerMembers)
r.get('/members', getOwnerMembers)
r.get(
  '/members/:memberId/attendance/month',
  validateQuery(monthQuerySchema),
  getMemberAttendanceMonth
)
r.get(
  '/members/:memberId',
  asyncHandler(async (req, res) => {
    if (!req.user?.gymId) return
    const member = await getMember(req.user.gymId, req.params.memberId, {
      role: 'GYM_OWNER',
      gymId: req.user.gymId,
    })
    res.json(member)
  })
)
r.patch('/members/:memberId', validateBody(updateMemberSchema), patchOwnerMember)

r.post('/attendance/lookup', validateBody(attendanceLookupSchema), postAttendanceLookup)
r.post('/attendance/mark', validateBody(attendanceMarkSchema), postAttendanceMark)

r.put('/workouts/day', validateBody(workoutUpsertSchema), putWorkoutDay)
r.get('/workouts/today', getOwnerWorkoutToday)

export default r
