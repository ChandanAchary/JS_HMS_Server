/**
 * File Utilities
 * Helper functions for file handling (uploads, URLs, etc.)
 */

/**
 * Extract file URL from uploaded file object
 * Handles both Cloudinary uploads and local disk storage
 * @param {Object} file - The req.file object from multer
 * @returns {string|null} The file URL or path, or null if no valid file
 */
export const getFileUrl = (file) => {
  if (!file) return null;
  
  // Check for Cloudinary URL (uploaded to Cloudinary)
  if (file.url) {
    return file.url;
  }
  
  // Check for Cloudinary secure_url (alternative Cloudinary property)
  if (file.secure_url) {
    return file.secure_url;
  }
  
  // Check for local disk storage filename (only if filename is defined and not 'undefined')
  if (file.filename && file.filename !== 'undefined') {
    return `uploads/${file.filename}`;
  }
  
  // Fallback to path property (only if path is defined and not 'undefined')
  if (file.path && file.path !== 'undefined') {
    return file.path;
  }
  
  return null;
};

/**
 * Process profile picture URL for response
 * Converts relative paths to full URLs
 * @param {string} profilePic - The stored profile picture path
 * @param {Object} req - Express request object (for building full URL)
 * @returns {string|null} The full URL or null
 */
export const processProfilePicUrl = (profilePic, req) => {
  if (!profilePic || profilePic === '' || profilePic === 'uploads/undefined') {
    return null;
  }
  
  // If it's already a full URL (Cloudinary or external), return as-is
  if (profilePic.startsWith('http://') || profilePic.startsWith('https://')) {
    return profilePic;
  }
  
  // If it's a relative path and we have request context, construct full URL
  if (req) {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/${profilePic}`;
  }
  
  return profilePic;
};

/**
 * Delete local file (for cleanup when updating profile photos)
 * @param {string} filePath - Path to the file to delete
 */
export const deleteLocalFile = async (filePath) => {
  if (!filePath || filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return false;
  }
  
  try {
    const fs = await import('fs');
    const path = await import('path');
    const fullPath = path.resolve(process.cwd(), filePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
  } catch (error) {
    console.warn('Failed to delete file:', error.message);
  }
  
  return false;
};

export default {
  getFileUrl,
  processProfilePicUrl,
  deleteLocalFile
};

















