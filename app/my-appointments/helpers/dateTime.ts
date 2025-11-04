  // Helpers
export const weekdayKeyFromDate = (date: Date) => {
    // map JS Date.getDay() to keys used in businessHours
    const map = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    return map[date.getDay()]
}

export function convertTo12Hour(time24: string): string {
  // Expect format "HH:mm"
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);

  if (isNaN(hour) || isNaN(parseInt(minute, 10))) return time24; // fallback if invalid

  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // convert 0 or 12 to 12-hour format

  return `${hour}:${minute} ${suffix}`;
}