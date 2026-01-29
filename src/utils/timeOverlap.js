/**
 * Time Overlap Detection Utility
 * Used for checking assignment conflicts and scheduling overlaps
 */

/**
 * Check if there's time overlap between a new time range and existing assignments
 * @param {Array} existing - Array of existing assignments with startDateTime, endDateTime
 * @param {Date} newStart - New assignment start time
 * @param {Date} newEnd - New assignment end time
 * @returns {boolean} true if overlap detected
 * 
 * @example
 * const existing = [
 *   { startDateTime: "2026-01-22T09:00:00Z", endDateTime: "2026-01-22T17:00:00Z" },
 *   { startDateTime: "2026-01-23T10:00:00Z", endDateTime: "2026-01-23T18:00:00Z" }
 * ];
 * const hasConflict = hasOverlap(existing, new Date("2026-01-22T14:00:00Z"), new Date("2026-01-22T16:00:00Z"));
 * // Returns: true (overlaps with first assignment)
 */
export const hasOverlap = (existing, newStart, newEnd) => {
  if (!existing || existing.length === 0) {
    return false;
  }

  return existing.some(assignment => {
    // Convert both to Date objects if they're strings
    const existStart = new Date(assignment.startDateTime);
    const existEnd = new Date(assignment.endDateTime);

    // Check if new time range overlaps with existing range
    // Overlap occurs if: new starts before existing ends AND new ends after existing starts
    return newStart < existEnd && newEnd > existStart;
  });
};

/**
 * Find all overlapping assignments from a list
 * @param {Array} existing - Array of existing assignments
 * @param {Date} newStart - New assignment start time
 * @param {Date} newEnd - New assignment end time
 * @returns {Array} Array of overlapping assignments
 */
export const findOverlaps = (existing, newStart, newEnd) => {
  if (!existing || existing.length === 0) {
    return [];
  }

  return existing.filter(assignment => {
    const existStart = new Date(assignment.startDateTime);
    const existEnd = new Date(assignment.endDateTime);
    return newStart < existEnd && newEnd > existStart;
  });
};

/**
 * Check if two time ranges are exactly adjacent (end time of one equals start time of other)
 * Useful for determining if assignments are back-to-back
 * @param {Date} firstEnd - End time of first assignment
 * @param {Date} secondStart - Start time of second assignment
 * @returns {boolean} true if they're adjacent
 */
export const isAdjacent = (firstEnd, secondStart) => {
  const firstTime = new Date(firstEnd).getTime();
  const secondTime = new Date(secondStart).getTime();
  return firstTime === secondTime;
};

/**
 * Check if a time range is within another time range (fully contained)
 * @param {Date} containerStart - Start of containing range
 * @param {Date} containerEnd - End of containing range
 * @param {Date} innerStart - Start of range to check
 * @param {Date} innerEnd - End of range to check
 * @returns {boolean} true if inner is fully contained in container
 */
export const isWithinTimeRange = (containerStart, containerEnd, innerStart, innerEnd) => {
  const cStart = new Date(containerStart).getTime();
  const cEnd = new Date(containerEnd).getTime();
  const iStart = new Date(innerStart).getTime();
  const iEnd = new Date(innerEnd).getTime();

  return iStart >= cStart && iEnd <= cEnd;
};
