/**
 * Date Utilities
 * Re-exports from core/utils for convenience
 */

export {
  getDate,
  getTodayDate,
  getYesterdayDate,
  getWeekStartDate,
  getMonthStartDate,
  formatDate,
  addDays,
  subtractDays,
  getDaysDifference,
  localDateString,
} from '../core/utils/date.utils.js';

// Default export for backward compatibility
export { localDateString as default } from '../core/utils/date.utils.js';
