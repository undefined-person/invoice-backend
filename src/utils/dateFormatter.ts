export const dateFormatter = (date: Date) => {
  const newDate = new Date(date)
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return formatter.format(newDate)
}
