/**
 * Payment Status Utilities
 * Handles automatic monthly reset and payment state management
 */

/**
 * Check if payout should be reset based on month change
 * @param {Number} lastPaidMonth - Last month user was paid (1-12, null if never)
 * @param {Number} lastPaidYear - Last year user was paid (null if never)
 * @param {Number} currentMonth - Current month (1-12)
 * @param {Number} currentYear - Current year
 * @returns {Boolean} true if reset is needed
 */
export const shouldResetPaymentStatus = (lastPaidMonth, lastPaidYear, currentMonth, currentYear) => {
  // First time: no previous payment
  if (lastPaidMonth === null || lastPaidYear === null) {
    return false; // Status already "PAY" by default
  }

  // Month has changed
  if (lastPaidMonth !== currentMonth || lastPaidYear !== currentYear) {
    return true;
  }

  return false;
};

/**
 * Reset payment status for a user/group
 * Called on global refresh or month change
 * @returns {Object} update payload
 */
export const getResetPaymentPayload = () => {
  return {
    paymentStatus: "PAY",
    lastPaidMonth: null,
    lastPaidYear: null
  };
};

/**
 * Mark user as paid for current month
 * @param {Number} currentMonth - Current month (1-12)
 * @param {Number} currentYear - Current year
 * @returns {Object} update payload
 */
export const getPaymentConfirmationPayload = (currentMonth, currentYear) => {
  return {
    paymentStatus: "PAID",
    lastPaidMonth: currentMonth,
    lastPaidYear: currentYear
  };
};

export default {
  shouldResetPaymentStatus,
  getResetPaymentPayload,
  getPaymentConfirmationPayload
};

















