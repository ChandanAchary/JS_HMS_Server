import crypto from "crypto";

/**
 * Generate a secure random password
 * @param {number} length - Password length (default 12)
 * @returns {string} - Generated password
 */
export function generateSecurePassword(length = 12) {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specialChars = "!@#$%^&*";

  const allChars = uppercase + lowercase + numbers + specialChars;

  // Use crypto for secure randomness
  const getRandomChar = (pool) => pool[crypto.randomInt(0, pool.length)];

  let password = "";
  // Ensure at least one character from each category
  password += getRandomChar(uppercase);
  password += getRandomChar(lowercase);
  password += getRandomChar(numbers);
  password += getRandomChar(specialChars);

  // Fill the rest securely
  for (let i = password.length; i < length; i++) {
    password += getRandomChar(allChars);
  }

  // Shuffle using Fisher-Yates with crypto
  const arr = password.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}
