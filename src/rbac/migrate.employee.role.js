/**
 * Employee Role Normalization Migration Helper
 * 
 * PURPOSE:
 * Populate employee.role from latest joinRequest.appliedRole for employees where role is missing
 * 
 * BACKGROUND:
 * - JoinRequest stores what role the employee applied for (appliedRole)
 * - Upon approval, this should be copied to Employee.role
 * - Some legacy records may have missing employee.role despite having a joinRequest
 * 
 * USAGE:
 * // One-time backfill (run manually in migration or seed script)
 * const { normalizeEmployeeRoles } = await import('./src/rbac/migrate.employee.role.js');
 * await normalizeEmployeeRoles(prisma, { hospitalId: 'specific-hospital-id' });
 * 
 * // Or in batch for all hospitals:
 * await normalizeEmployeeRoles(prisma, { dryRun: true }); // Preview changes
 * await normalizeEmployeeRoles(prisma); // Execute
 */

import logger from '../core/utils/logger.js';

/**
 * Normalize employee roles from join requests
 * 
 * @param {Object} prisma - Prisma client instance
 * @param {Object} options - Options object
 * @param {string} options.hospitalId - (Optional) Limit to specific hospital
 * @param {boolean} options.dryRun - (Default: false) Preview changes without applying
 * @param {boolean} options.verbose - (Default: true) Log details
 * @returns {Promise<Object>} Migration result { processed, updated, skipped, errors }
 */
export async function normalizeEmployeeRoles(prisma, options = {}) {
  const {
    hospitalId = null,
    dryRun = false,
    verbose = true,
  } = options;

  const result = {
    processed: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    examples: [],
  };

  try {
    // Step 1: Find all employees with missing/empty role
    const whereClause = {
      OR: [
        { role: null },
        { role: '' },
        { role: { equals: '' } },
      ],
    };

    if (hospitalId) {
      whereClause.hospitalId = hospitalId;
    }

    const employeesWithMissingRole = await prisma.employee.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        hospitalId: true,
      },
    });

    if (verbose) {
      logger.info(`[RBAC Migration] Found ${employeesWithMissingRole.length} employees with missing role`);
    }

    // Step 2: For each employee, look up latest joinRequest
    for (const employee of employeesWithMissingRole) {
      result.processed++;

      try {
        const joinRequest = await prisma.joinRequest.findFirst({
          where: {
            email: employee.email.toLowerCase(),
          },
          orderBy: {
            submittedAt: 'desc',
          },
          select: {
            id: true,
            appliedRole: true,
            specialization: true,
            formData: true,
          },
        });

        if (!joinRequest) {
          if (verbose) {
            logger.warn(`[RBAC Migration] No join request found for employee ${employee.email}`);
          }
          result.skipped++;
          continue;
        }

        // Extract role from joinRequest
        let role = joinRequest.appliedRole || joinRequest.specialization || null;

        // Fallback: parse formData if needed
        if (!role && joinRequest.formData) {
          try {
            const formData = typeof joinRequest.formData === 'string'
              ? JSON.parse(joinRequest.formData)
              : joinRequest.formData;

            role = formData?.appliedRole
              || formData?.roleApplied
              || formData?.roleAppliedFor
              || formData?.specialization
              || formData?.speciality
              || null;
          } catch (err) {
            if (verbose) {
              logger.warn(`[RBAC Migration] Failed to parse formData for employee ${employee.email}`);
            }
          }
        }

        if (!role) {
          if (verbose) {
            logger.warn(`[RBAC Migration] Could not extract role from join request for ${employee.email}`);
          }
          result.skipped++;
          continue;
        }

        // Step 3: Update employee.role (if not in dryRun mode)
        if (!dryRun) {
          await prisma.employee.update({
            where: { id: employee.id },
            data: { role },
          });

          result.updated++;
          if (result.examples.length < 5) {
            result.examples.push({
              email: employee.email,
              name: employee.name,
              role,
            });
          }

          if (verbose) {
            logger.info(`[RBAC Migration] Updated employee ${employee.email} with role: ${role}`);
          }
        } else {
          result.updated++;
          if (result.examples.length < 5) {
            result.examples.push({
              email: employee.email,
              name: employee.name,
              role,
              dryRun: true,
            });
          }

          if (verbose) {
            logger.info(`[RBAC Migration] DRY RUN: Would update employee ${employee.email} with role: ${role}`);
          }
        }
      } catch (err) {
        result.errors++;
        if (verbose) {
          logger.error(`[RBAC Migration] Error processing employee ${employee.email}:`, err);
        }
      }
    }

    if (verbose) {
      logger.info('[RBAC Migration] Complete:', result);
    }

    return result;
  } catch (err) {
    logger.error('[RBAC Migration] Fatal error:', err);
    throw err;
  }
}

/**
 * Verify that all employees now have roles
 * Useful to run after migration to confirm success
 * 
 * @param {Object} prisma - Prisma client instance
 * @param {string} hospitalId - (Optional) Limit to specific hospital
 * @returns {Promise<Object>} { total, withRole, withoutRole, details }
 */
export async function verifyEmployeeRoles(prisma, hospitalId = null) {
  const whereClause = hospitalId ? { hospitalId } : {};

  const total = await prisma.employee.count({ where: whereClause });

  const withoutRole = await prisma.employee.count({
    where: {
      ...whereClause,
      OR: [
        { role: null },
        { role: '' },
      ],
    },
  });

  const withRole = total - withoutRole;

  const details = await prisma.employee.findMany({
    where: {
      ...whereClause,
      OR: [
        { role: null },
        { role: '' },
      ],
    },
    select: {
      email: true,
      name: true,
    },
  });

  return {
    total,
    withRole,
    withoutRole,
    details,
    coveragePercent: total > 0 ? ((withRole / total) * 100).toFixed(2) : 0,
  };
}

/**
 * Reset employee roles to null (for testing migration)
 * WARNING: Only use in development/testing
 * 
 * @param {Object} prisma - Prisma client instance
 * @param {string} hospitalId - (Required for safety) Specific hospital to reset
 * @returns {Promise<number>} Number of employees reset
 */
export async function resetEmployeeRoles(prisma, hospitalId) {
  if (!hospitalId) {
    throw new Error('hospitalId is required for safety');
  }

  const result = await prisma.employee.updateMany({
    where: { hospitalId },
    data: { role: null },
  });

  logger.warn(`[RBAC Migration] Reset ${result.count} employee roles for hospital ${hospitalId}`);
  return result.count;
}

export default {
  normalizeEmployeeRoles,
  verifyEmployeeRoles,
  resetEmployeeRoles,
};
