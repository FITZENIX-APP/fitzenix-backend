export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  GYM_OWNER: 'GYM_OWNER',
  GYM_TRAINER: 'GYM_TRAINER',
  GYM_MEMBER: 'GYM_MEMBER',
} as const

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole]
