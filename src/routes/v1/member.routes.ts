import { Router } from 'express'
import {
  getMemberProfile,
  getMemberWorkoutToday,
  putMemberNutrition,
  getMemberNutritionDay,
  getMemberNutritionMonth,
  getMemberAttendanceMonth,
} from '../../controllers/memberPortalController'
import { requireAuth } from '../../middleware/auth'
import { requireRoles } from '../../middleware/rbac'
import { UserRole } from '../../types/roles'
import { validateBody, validateQuery } from '../../middleware/validate'
import { nutritionUpsertSchema, monthQuerySchema } from '../../validators/schemas'

const r = Router()

r.use(requireAuth, requireRoles(UserRole.GYM_MEMBER))

r.get('/profile', getMemberProfile)
r.get('/workouts/today', getMemberWorkoutToday)

r.put('/nutrition', validateBody(nutritionUpsertSchema), putMemberNutrition)
r.get('/nutrition/day', getMemberNutritionDay)
r.get(
  '/nutrition/month',
  validateQuery(monthQuerySchema),
  getMemberNutritionMonth
)

r.get(
  '/attendance/month',
  validateQuery(monthQuerySchema),
  getMemberAttendanceMonth
)

export default r
