//utc dtes read
export const toInputDate = (iso: string): string => iso.slice(0, 10)

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })

//date
export const todayPlus = (days: number): string =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

export const daysLeftLabel = (daysLeft: number): string => {
  if (daysLeft < -1) return `Expired ${Math.abs(daysLeft)} days ago`
  if (daysLeft === -1) return "Expired yesterday"
  if (daysLeft === 0) return "Expires today"
  if (daysLeft === 1) return "Expires tomorrow"
  return `${daysLeft} days left`
}
