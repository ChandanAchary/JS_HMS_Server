/**
 * Attendance Validators
 * Validation functions for attendance-related operations
 */

import { ValidationError } from '../../shared/exceptions/AppError.js';

/**
 * Validate check-in input
 */
export const validateCheckIn = (data) => {
  const errors = [];

  if (data.latitude === undefined || data.latitude === null) {
    errors.push('Latitude is required for check-in');
  } else {
    const lat = parseFloat(data.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push('Invalid latitude');
    }
  }

  if (data.longitude === undefined || data.longitude === null) {
    errors.push('Longitude is required for check-in');
  } else {
    const lng = parseFloat(data.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push('Invalid longitude');
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return {
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude)
  };
};

/**
 * Validate check-out input
 */
export const validateCheckOut = (data) => {
  const errors = [];

  if (data.latitude === undefined || data.latitude === null) {
    errors.push('Latitude is required for check-out');
  } else {
    const lat = parseFloat(data.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push('Invalid latitude');
    }
  }

  if (data.longitude === undefined || data.longitude === null) {
    errors.push('Longitude is required for check-out');
  } else {
    const lng = parseFloat(data.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push('Invalid longitude');
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return {
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude)
  };
};

/**
 * Parse location from request body/query
 */
export const parseLocationInput = (req) => {
  const latitudeRaw = req.body?.latitude ?? req.body?.lat ?? req.query?.latitude ?? req.query?.lat;
  const longitudeRaw = req.body?.longitude ?? req.body?.lng ?? req.query?.longitude ?? req.query?.lng;
  
  return {
    latitude: latitudeRaw,
    longitude: longitudeRaw
  };
};

/**
 * Validate user ID from request
 */
export const validateUserId = (userId) => {
  if (!userId) {
    throw new ValidationError('Invalid user id');
  }
  return userId;
};

export default {
  validateCheckIn,
  validateCheckOut,
  parseLocationInput,
  validateUserId
};
