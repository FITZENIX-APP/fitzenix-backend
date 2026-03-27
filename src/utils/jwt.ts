import jwt, { SignOptions } from 'jsonwebtoken'
import config from '../config'
import { UserRoleType } from '../types/roles'

export type JwtPayload = {
  sub: string
  role: UserRoleType
  gymId?: string
  memberId?: string
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as SignOptions)
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload
}
