// Prisma utility helper functions for common patterns

export const softDeleteWhere = (additionalWhere = {}) => {
  return {
    ...additionalWhere,
    isDeleted: false,
  };
};

export const softDeleteData = () => {
  return {
    isDeleted: true,
    deletedAt: new Date(),
  };
};

// Error handling
export class PrismaServiceError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = "PrismaServiceError";
  }
}

// Handle Prisma unique constraint errors
export const handleUniqueConstraintError = (error, fieldName) => {
  if (error.code === "P2002") {
    const target = error.meta?.target?.[0];
    return {
      statusCode: 409,
      message: `${fieldName || target} already exists`,
    };
  }
  return null;
};

// Handle Prisma not found errors
export const handleNotFoundError = (error, resourceName = "Resource") => {
  if (error.code === "P2025") {
    return {
      statusCode: 404,
      message: `${resourceName} not found`,
    };
  }
  return null;
};

// Generic error handler for Prisma operations
export const handlePrismaError = (error, defaultMessage = "Database error") => {
  console.error("Prisma Error:", error);

  if (error.code === "P2002") {
    return {
      statusCode: 409,
      message: `Duplicate entry. ${error.meta?.target?.[0]} already exists.`,
    };
  }

  if (error.code === "P2025") {
    return {
      statusCode: 404,
      message: "Record not found",
    };
  }

  if (error.code === "P2003") {
    return {
      statusCode: 400,
      message: "Foreign key constraint failed",
    };
  }

  if (error instanceof SyntaxError) {
    return {
      statusCode: 400,
      message: "Invalid request format",
    };
  }

  return {
    statusCode: 500,
    message: defaultMessage,
  };
};

// Convert Prisma object to plain JSON (removes circular references)
export const toJSON = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Pagination helper
export const getPaginationParams = (page = 1, limit = 10) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.max(1, parseInt(limit));
  return {
    skip: (p - 1) * l,
    take: l,
    page: p,
    limit: l,
  };
};

// Build Prisma where clause with soft delete support
export const buildWhereClause = (filters = {}, softDeleteField = "isDeleted") => {
  const where = { ...filters };
  if (softDeleteField && where[softDeleteField] === undefined) {
    where[softDeleteField] = false;
  }
  return where;
};

















