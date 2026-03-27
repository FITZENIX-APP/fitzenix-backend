import { Router } from 'express'
import {
  getAdminGyms,
  getAdminGym,
  getAdminRevenue,
  getAdminPricing,
  patchAdminPricing,
  postAdminReminderTest,
  getAdminExpiringMembers,
} from '../../controllers/adminController'
import { requireAuth } from '../../middleware/auth'
import { requireRoles } from '../../middleware/rbac'
import { UserRole } from '../../types/roles'
import { validateBody } from '../../middleware/validate'
import { pricingUpdateSchema, reminderTestSchema } from '../../validators/schemas'

const r = Router()

r.use(requireAuth, requireRoles(UserRole.SUPER_ADMIN))

r.get('/gyms', getAdminGyms)
r.get('/gyms/:gymId', getAdminGym)
r.get('/revenue', getAdminRevenue)
r.get('/pricing', getAdminPricing)
r.patch('/pricing', validateBody(pricingUpdateSchema), patchAdminPricing)
r.post('/reminders/test', validateBody(reminderTestSchema), postAdminReminderTest)
r.get('/members/expiring', getAdminExpiringMembers)

export default r
