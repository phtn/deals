export const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

export const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'full',
  timeZone: 'Asia/Manila',
})

export const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'Asia/Manila',
})

// const createdAtFormatter = new Intl.DateTimeFormat('en-US', {
//   dateStyle: 'medium',
//   timeStyle: 'short'
// })
export const createdAtNano = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function formatEventDate(timestamp: number, fallback: string) {
  return fallback || dateFormatter.format(new Date(timestamp))
}
