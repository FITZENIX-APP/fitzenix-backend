import mongoose from 'mongoose'
import Attendance, { AttendanceStatus } from '../models/Attendance'
import Member from '../models/Member'
import { AppError } from '../utils/AppError'
import {
  addMonthsCalendar,
  endOfUtcMonth,
  startOfUtcDay,
  startOfUtcMonth,
} from '../utils/dates'

export async function findMemberByUniqueId(
  gymId: string,
  uniqueMemberId: string
) {
  const member = await Member.findOne({
    gymId: new mongoose.Types.ObjectId(gymId),
    uniqueMemberId: uniqueMemberId.trim(),
  }).lean()
  if (!member) throw new AppError('Member not found for this gym', 404)
  return member
}

export async function markAttendance(input: {
  gymId: string
  memberId: string
  day?: Date
  status: AttendanceStatus
}) {
  const day = startOfUtcDay(input.day ?? new Date())
  const member = await Member.findById(input.memberId)
  if (!member) throw new AppError('Member not found', 404)
  if (String(member.gymId) !== input.gymId) {
    throw new AppError('Member does not belong to this gym', 403)
  }

  const end = member.subscriptionEndDate
  if (day < startOfUtcDay(member.joinDate)) {
    throw new AppError('Attendance before join date is not allowed', 400)
  }
  if (day > startOfUtcDay(end)) {
    throw new AppError('Subscription expired for this date', 400)
  }

  await Attendance.findOneAndUpdate(
    { memberId: member._id, day },
    {
      $set: {
        gymId: member.gymId,
        status: input.status,
      },
    },
    { upsert: true, new: true }
  )

  return { memberId: String(member._id), day, status: input.status }
}

/**
 * Eligible calendar days in [month] where membership is active (join → expiry),
 * clamped to that month. Used for monthly attendance budgeting.
 */
export function eligibleDaysInMonth(
  joinDate: Date,
  subscriptionEndDate: Date,
  year: number,
  monthIndex0: number
): number {
  const monthStart = startOfUtcMonth(year, monthIndex0)
  const monthEnd = endOfUtcMonth(year, monthIndex0)
  const j = startOfUtcDay(joinDate)
  const e = startOfUtcDay(subscriptionEndDate)

  const rangeStart = j > monthStart ? j : monthStart
  const rangeEnd = e < monthEnd ? e : monthEnd
  if (rangeStart > rangeEnd) return 0

  const msPerDay = 24 * 60 * 60 * 1000
  return Math.floor((rangeEnd.getTime() - rangeStart.getTime()) / msPerDay) + 1
}

export async function monthlyAttendanceSummary(
  memberId: string,
  year: number,
  monthIndex0: number
) {
  const member = await Member.findById(memberId).lean()
  if (!member) throw new AppError('Member not found', 404)

  const monthStart = startOfUtcMonth(year, monthIndex0)
  const nextMonth = startOfUtcMonth(year, monthIndex0 + 1)

  const rows = await Attendance.find({
    memberId: new mongoose.Types.ObjectId(memberId),
    day: { $gte: monthStart, $lt: nextMonth },
  }).lean()

  const present = rows.filter((r) => r.status === 'PRESENT').length
  const absent = rows.filter((r) => r.status === 'ABSENT').length

  const eligible = eligibleDaysInMonth(
    member.joinDate,
    member.subscriptionEndDate,
    year,
    monthIndex0
  )

  const daysWithRecord = present + absent
  const unmarked = Math.max(0, eligible - daysWithRecord)

  return {
    memberId,
    year,
    month: monthIndex0 + 1,
    joinDate: member.joinDate,
    subscriptionEndDate: member.subscriptionEndDate,
    eligibleDaysInMonth: eligible,
    presentDays: present,
    absentDays: absent,
    /** Days in month still without a PRESENT/ABSENT row (within eligible window). */
    unmarkedEligibleDays: unmarked,
  }
}

/** Recompute subscription end from join date + whole months (product rule). */
export function computeSubscriptionEndDate(
  joinDate: Date,
  planDurationMonths: number
): Date {
  return addMonthsCalendar(joinDate, planDurationMonths)
}
