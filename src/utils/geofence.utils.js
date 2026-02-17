/**
 * Geofence Utility
 * Haversine-based distance calculation and geofence enforcement
 */

/** Earth's radius in meters */
const EARTH_RADIUS_METERS = 6_371_000;

/** Default geofence radius in meters */
export const DEFAULT_GEOFENCE_RADIUS_METERS = 50;

/**
 * Convert degrees to radians
 */
const toRadians = (degrees) => (degrees * Math.PI) / 180;

/**
 * Calculate the distance between two GPS coordinates using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
export const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
};

/**
 * Check if a user's coordinates are within the geofence of a target location.
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @param {number} hospitalLat - Hospital's latitude
 * @param {number} hospitalLng - Hospital's longitude
 * @param {number} [radiusMeters=50] - Allowed radius in meters
 * @returns {{ allowed: boolean, distanceMeters: number }}
 */
export const isWithinGeofence = (
  userLat,
  userLng,
  hospitalLat,
  hospitalLng,
  radiusMeters = DEFAULT_GEOFENCE_RADIUS_METERS
) => {
  const distanceMeters = haversineDistance(userLat, userLng, hospitalLat, hospitalLng);

  return {
    allowed: distanceMeters <= radiusMeters,
    distanceMeters: Math.round(distanceMeters)
  };
};

export default { haversineDistance, isWithinGeofence, DEFAULT_GEOFENCE_RADIUS_METERS };
