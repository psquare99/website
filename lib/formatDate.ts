const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatDate(date: string) {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return date;
  }

  const [, year, month, day] = match;

  const monthIndex = Number(month) - 1;

  if (monthIndex < 0 || monthIndex > 11) {
    return date;
  }

  return `${Number(day)} ${months[monthIndex]} ${year}`;
}