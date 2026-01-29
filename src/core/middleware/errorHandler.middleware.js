/**
 * Error Handler Middleware
 * Centralized error handling for all requests
 */

import { AppError } from '../../shared/exceptions/AppError.js';
import logger from '../utils/logger.js';

/**
 * Global error handler middleware
 * Must be the last middleware in the chain
 */
export const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // If it's an AppError, use its statusCode
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      errorCode: 'DUPLICATE_ENTRY',
      statusCode: 409,
      timestamp: new Date().toISOString(),
    });
  }

  // Prisma not found error
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Resource not found',
      errorCode: 'NOT_FOUND',
      statusCode: 404,
      timestamp: new Date().toISOString(),
    });
  }

  // Prisma validation error
  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Invalid reference or constraint violation',
      errorCode: 'VALIDATION_ERROR',
      statusCode: 400,
      timestamp: new Date().toISOString(),
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      errorCode: 'INVALID_TOKEN',
      statusCode: 401,
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      errorCode: 'TOKEN_EXPIRED',
      statusCode: 401,
      timestamp: new Date().toISOString(),
    });
  }

  // Default error response
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    errorCode: err.errorCode || 'INTERNAL_ERROR',
    statusCode: err.statusCode || 500,
    timestamp: new Date().toISOString(),
  });
};
