/**
 * Date Utilities
 * Common date manipulation functions
 */

export const getDate = (dateString) => {
  return new Date(dateString);
};

export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

export const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

export const getWeekStartDate = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day;
  return new Date(today.setDate(diff)).toISOString().split('T')[0];
};

export const getMonthStartDate = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  return firstDay.toISOString().split('T')[0];
};

export const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  if (format === 'YYYY-MM-DD') {
    return d.toISOString().split('T')[0];
  }
  if (format === 'DD-MM-YYYY') {
    return [
      String(d.getDate()).padStart(2, '0'),
      String(d.getMonth() + 1).padStart(2, '0'),
      d.getFullYear(),
    ].join('-');
  }
  return d.toString();
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
};

export const subtractDays = (date, days) => {
  return addDays(date, -days);
};

export const getDaysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Return local YYYY-MM-DD string to avoid UTC drift issues
 * This is the preferred function when working with local dates
 */
export const localDateString = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
