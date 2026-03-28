import { OAuth2Client } from 'google-auth-library'
import config from '../config'
import { AppError } from '../utils/AppError'
import type { OAuthProvider } from '../models/user'

export type VerifiedOAuthIdentity = {
  provider: OAuthProvider
  subject: string
  email: string
  emailVerified: boolean
}

let googleClient: OAuth2Client | null = null

function getGoogleClient(): OAuth2Client {
  if (!googleClient) googleClient = new OAuth2Client()
  return googleClient
}

export async function verifyGoogleIdToken(idToken: string): Promise<VerifiedOAuthIdentity> {
  const audiences = config.googleOAuthClientIds
  if (!audiences.length) {
    throw new AppError('Google OAuth is not configured (GOOGLE_OAUTH_CLIENT_IDS)', 503)
  }
  const client = getGoogleClient()
  const ticket = await client.verifyIdToken({
    idToken,
    audience: audiences,
  })
  const payload = ticket.getPayload()
  if (!payload?.sub) {
    throw new AppError('Invalid Google token payload', 401)
  }
  const email = payload.email
  if (!email) {
    throw new AppError('Google account has no email scope', 400)
  }
  return {
    provider: 'GOOGLE',
    subject: payload.sub,
    email: email.toLowerCase(),
    emailVerified: Boolean(payload.email_verified),
  }
}

type FacebookMe = {
  id: string
  email?: string
}

export async function verifyFacebookAccessToken(
  accessToken: string
): Promise<VerifiedOAuthIdentity> {
  if (!config.facebookAppId) {
    throw new AppError('Facebook OAuth is not configured (FACEBOOK_APP_ID)', 503)
  }
  const url = new URL('https://graph.facebook.com/me')
  url.searchParams.set('fields', 'id,email')
  url.searchParams.set('access_token', accessToken)

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new AppError('Invalid Facebook access token', 401)
  }
  const data = (await res.json()) as FacebookMe
  if (!data.id) {
    throw new AppError('Invalid Facebook response', 401)
  }
  if (!data.email) {
    throw new AppError(
      'Facebook account has no email. Grant email permission or use another login method.',
      400
    )
  }
  return {
    provider: 'FACEBOOK',
    subject: data.id,
    email: data.email.toLowerCase(),
    emailVerified: true,
  }
}
