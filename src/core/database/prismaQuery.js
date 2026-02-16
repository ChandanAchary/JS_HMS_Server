/**
 * Build a safe Prisma query object
 * Omits `select` if empty (Prisma requires at least one truthy field in select)
 * 
 * @param {Object} queryBase - base query object with `where`, etc.
 * @param {Object} requestedSelect - requested select object
 * @returns {Object} safe query for Prisma
 */
export const buildFindQuery = (queryBase, requestedSelect) => {
  const query = { ...queryBase };

  // only attach select if it has at least one truthy key
  if (requestedSelect && typeof requestedSelect === "object") {
    const truthyKeys = Object.entries(requestedSelect)
      .filter(([, val]) => val === true || val === 1)
      .map(([key]) => key);

    if (truthyKeys.length > 0) {
      query.select = {};
      truthyKeys.forEach((key) => {
        query.select[key] = true;
      });
    }
  }

  // if no select was provided or it's empty, omit select entirely
  // (Prisma will return default/full objects)

  return query;
};

















