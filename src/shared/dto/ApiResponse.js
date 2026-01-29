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

  static error(message = 'Error', statusCode = 500, data = null) {
    return new ApiResponse(statusCode, data, message);
  }

  static created(data = null, message = 'Resource created successfully') {
    return new ApiResponse(201, data, message);
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

  toJSON() {
    return {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
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
