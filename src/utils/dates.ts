/**
 * Normalize a Date to UTC midnight for the same calendar day (stable storage key).
 */
export function startOfUtcDay(d: Date): Date {
  const x = new Date(d)
  return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()))
}

/** Same calendar day next month (UTC), e.g. Feb 5 + 1 month → Mar 5. */
export function addMonthsCalendar(anchor: Date, months: number): Date {
  const d = new Date(anchor)
  const day = d.getUTCDate()
  d.setUTCMonth(d.getUTCMonth() + months)
  if (d.getUTCDate() !== day) {
    d.setUTCDate(0)
  }
  return d
}

export function endOfUtcMonth(year: number, monthIndex0: number): Date {
  return new Date(Date.UTC(year, monthIndex0 + 1, 0, 23, 59, 59, 999))
}

export function startOfUtcMonth(year: number, monthIndex0: number): Date {
  return new Date(Date.UTC(year, monthIndex0, 1))
}
