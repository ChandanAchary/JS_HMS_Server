/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user info to request for RBAC checks
 * 
 * KEY BEHAVIOR:
 * 1. Validates JWT token and extracts claims
 * 2. Falls back to role-permissions mapping if token missing permissions
 * 3. Ensures req.user always has both `role` and `permissions` for RBAC
 * 4. Supports single-tenant mode with hospital ID validation
 */

import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../../shared/exceptions/AppError.js';
import { getPermissionsForRole } from '../../rbac/rolePermissions.js';

/**
 * Protect middleware (JWT authentication + permission normalization)
 * 
 * For single-tenant: Ensure token is valid and belongs to the single hospital
 * Token MUST contain `role` to support RBAC
 * Permissions are either in token or derived from role
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
      throw new AuthenticationError('No authorization token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // token must include role at minimum
    if (!decoded || !decoded.role) {
      throw new AuthenticationError('Invalid token payload: missing role');
    }

    // Attach decoded token as `req.user` for controllers to use
    req.user = decoded;

    // CRITICAL: Ensure permissions array exists
    // If token has permissions, use them; otherwise derive from role
    if (!req.user.permissions || !Array.isArray(req.user.permissions)) {
      req.user.permissions = getPermissionsForRole(decoded.role) || [];
    }

    // GLOBAL SUPER_ADMIN: allow system-level users
    if (decoded.role === 'SUPER_ADMIN') {
      return next();
    }

    // For single-tenant: prefer hospitalId from token, otherwise fall back to resolved tenant
    let hospitalId = decoded.hospitalId || req.hospitalId || req.hospital?.id;

    // If still not found, and Prisma client is available (resolveTenant should have attached it), try to load the single hospital
    if (!hospitalId && req.prisma) {
      try {
        const hospital = await req.prisma.hospital.findFirst({ 
          where: { isActive: true }, 
          select: { id: true } 
        });
        hospitalId = hospital?.id;
      } catch (err) {
        // ignore DB errors here; we'll throw below if still not found
      }
    }

    if (!hospitalId) {
      // In a multi-tenant system you'd require hospitalId on token; for single-tenant we can infer it
      throw new AuthenticationError('Token missing hospitalId');
    }

    // Attach hospital ID to request
    req.tenantId = hospitalId;
    req.hospitalId = hospitalId;

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return res.status(error.statusCode).json(error.toJSON());
    }
    return res.status(401).json(new AuthenticationError('Invalid token').toJSON());
  }
};

/**
 * Optional: Debug endpoint to inspect user context (staging/dev only)
 * Returns req.user data for RBAC debugging without exposing sensitive data
 * 
 * Usage: GET /api/auth/debug (requires auth header)
 * Response: { id, role, permissions, hospitalId, email }
 * 
 * SECURITY: Only enabled in non-production environments
 */
export const debugUserContext = (req, res) => {
  // Only allow in development/staging
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ 
      error: 'Debug endpoint disabled in production' 
    });
  }

  const user = req.user || {};
  const debugInfo = {
    authenticated: !!user.id,
    id: user.id || null,
    role: user.role || null,
    permissions: user.permissions || [],
    hospitalId: user.hospitalId || null,
    email: user.email || null,
    permissionCount: (user.permissions || []).length,
    timestamp: new Date().toISOString(),
  };

  res.json(debugInfo);
};

export default {
  protect,
  debugUserContext,
};
