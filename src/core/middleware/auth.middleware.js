/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user info to request
 */

import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../../shared/exceptions/AppError.js';

/**
 * Protect middleware (JWT)
 * For single-tenant: Ensure token is valid and belongs to the single hospital
 * Token MUST contain `role` to support RBAC
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
      throw new AuthenticationError('Invalid token payload');
    }

    // Attach decoded token as `req.user` for controllers to use
    req.user = decoded;

    // GLOBAL SUPER_ADMIN: allow system-level users
    if (decoded.role === 'SUPER_ADMIN') {
      return next();
    }

    // For single-tenant: prefer hospitalId from token, otherwise fall back to resolved tenant
    let hospitalId = decoded.hospitalId || req.hospitalId || req.hospital?.id;

    // If still not found, and Prisma client is available (resolveTenant should have attached it), try to load the single hospital
    if (!hospitalId && req.prisma) {
      try {
        const hospital = await req.prisma.hospital.findFirst({ where: { isActive: true }, select: { id: true } });
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

    // Ensure permissions array exists on token (RBAC)
    if (!decoded.permissions) {
      req.user.permissions = [];
    }

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return res.status(error.statusCode).json(error.toJSON());
    }
    return res.status(401).json(new AuthenticationError('Invalid token').toJSON());
  }
};
