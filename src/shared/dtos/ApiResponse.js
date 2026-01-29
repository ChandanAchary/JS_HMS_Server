/**
 * API Response DTO
 * Standard response format for all API endpoints
 */

export class ApiResponse {
  constructor(statusCode, data, message, success) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = success;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Create a success response
   */
  static success(data = null, message = 'Success', statusCode = 200) {
    return {
      statusCode,
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create an error response
   */
  static error(message = 'An error occurred', statusCode = 500, errors = null) {
    return {
      statusCode,
      success: false,
      data: null,
      message,
      errors,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a paginated response
   */
  static paginated(data, total, page, limit, message = 'Success') {
    return {
      statusCode: 200,
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      message,
      timestamp: new Date().toISOString()
    };
  }
}

export default ApiResponse;
