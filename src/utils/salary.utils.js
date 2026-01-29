// Helpers for salary and attendance date calculations
export const getMonthStartEnd = (year, month) => {
  // month: 1-12
  const m = Number(month) - 1;
  const start = new Date(year, m, 1);
  const end = new Date(year, m + 1, 0); // last day of month
  const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
  return { start, end, startStr, endStr };
};

export const getTotalWorkingDays = (year, month) => {
  // Count Monday-Saturday in the given month (exclude Sundays)
  const m = Number(month) - 1;
  const start = new Date(year, m, 1);
  const end = new Date(year, m + 1, 0);

  let total = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay(); // 0 = Sunday
    if (day !== 0) total += 1; // count Mon-Sat
  }
  return total;
};

export default { getMonthStartEnd, getTotalWorkingDays };
