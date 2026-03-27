import mongoose from 'mongoose'
import Member from '../models/Member'
import config from '../config'
import { startOfUtcDay } from '../utils/dates'

export type ReminderPayload = {
  toPhone: string
  body: string
  memberId: string
  gymId: string
}

/**
 * Placeholder integration: Twilio WhatsApp or mock (logs only).
 */
export async function sendWhatsAppReminder(payload: ReminderPayload): Promise<{
  ok: boolean
  provider: string
  detail?: string
}> {
  if (config.whatsapp.provider === 'mock' || !config.whatsapp.twilioAccountSid) {
    console.log(
      `[WhatsApp mock] → ${payload.toPhone}: ${payload.body.slice(0, 120)}…`
    )
    return { ok: true, provider: 'mock' }
  }

  try {
    const auth = Buffer.from(
      `${config.whatsapp.twilioAccountSid}:${config.whatsapp.twilioAuthToken}`
    ).toString('base64')
    const url = `https://api.twilio.com/2010-04-01/Accounts/${config.whatsapp.twilioAccountSid}/Messages.json`
    const body = new URLSearchParams({
      From: config.whatsapp.twilioWhatsAppFrom,
      To: `whatsapp:${payload.toPhone}`,
      Body: payload.body,
    })
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })
    if (!res.ok) {
      const text = await res.text()
      return { ok: false, provider: 'twilio', detail: text }
    }
    return { ok: true, provider: 'twilio' }
  } catch (e) {
    return {
      ok: false,
      provider: 'twilio',
      detail: e instanceof Error ? e.message : String(e),
    }
  }
}

/** Members whose subscription ends within `daysAhead` calendar days (for cron). */
export async function findMembersExpiringSoon(
  gymId: string | undefined,
  daysAhead: number
) {
  const start = startOfUtcDay(new Date())
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + daysAhead)

  const q: Record<string, unknown> = {
    subscriptionEndDate: { $gte: start, $lte: end },
    phone: { $exists: true, $ne: '' },
  }
  if (gymId) q.gymId = new mongoose.Types.ObjectId(gymId)

  return Member.find(q).lean()
}
