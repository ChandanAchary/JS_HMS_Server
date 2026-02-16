/**
 * Standardized API Response DTO
 * Ensures consistent response format across all endpoints
 */
export class ApiResponse {
  constructor(statusCode = 200, data = null, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    this.timestamp = new Date().toISOString();
  }

  static success(data = null, message = 'Success', statusCode = 200) {
    return new ApiResponse(statusCode, data, message);
  }

  static created(data = null, message = 'Resource created successfully') {
    return new ApiResponse(201, data, message);
  }

  static error(message = 'An error occurred', statusCode = 500, errors = null) {
    const resp = new ApiResponse(statusCode, null, message);
    resp.success = false;
    if (errors) resp.errors = errors;
    return resp;
  }

  static badRequest(message = 'Bad request') {
    return new ApiResponse(400, null, message);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiResponse(401, null, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiResponse(403, null, message);
  }

  static notFound(message = 'Not found') {
    return new ApiResponse(404, null, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiResponse(409, null, message);
  }

  /**
   * Legacy-style paginated response compatible with previous shape
   */
  static paginated(data, total = 0, page = 1, limit = 10, message = 'Success') {
    return {
      statusCode: 200,
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      message,
      timestamp: new Date().toISOString(),
    };
  }

  toJSON() {
    return {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
      ...(this.errors ? { errors: this.errors } : {}),
    };
  }
}

/**
 * Paginated Response DTO
 */
export class PaginatedResponse extends ApiResponse {
  constructor(data = [], total = 0, page = 1, pageSize = 10, message = 'Success') {
    super(200, null, message);
    this.data = {
      items: data,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  static success(data = [], total = 0, page = 1, pageSize = 10, message = 'Success') {
    return new PaginatedResponse(data, total, page, pageSize, message);
  }
}

export default ApiResponse;

















