import crypto from 'crypto'

export function generateSixDigitOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex')
}
