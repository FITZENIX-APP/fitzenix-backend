import { Router } from 'express'
import authRoutes from './auth.routes'
import ownerRoutes from './owner.routes'
import memberRoutes from './member.routes'
import adminRoutes from './admin.routes'

const v1 = Router()

v1.use('/auth', authRoutes)
v1.use('/owner', ownerRoutes)
v1.use('/member', memberRoutes)
v1.use('/admin', adminRoutes)

export default v1
