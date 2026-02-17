/**
 * Postal PIN Code Service
 * Integration with India Postal PIN Code API (https://api.postalpincode.in)
 * 
 * Free, no rate limits, no API key required.
 */

const BASE_URL = 'https://api.postalpincode.in';

/**
 * Fetch post office details by postal PIN code.
 * @param {string|number} pincode - 6-digit Indian postal PIN code
 * @returns {Promise<{ status: string, message: string, postOffices: Array|null }>}
 */
export const getPostOfficesByPinCode = async (pincode) => {
    const pin = String(pincode).trim();

    if (!/^\d{6}$/.test(pin)) {
        return {
            status: 'Error',
            message: 'PIN code must be a 6-digit number',
            postOffices: null
        };
    }

    try {
        const response = await fetch(`${BASE_URL}/pincode/${pin}`);
        const data = await response.json();

        // API returns an array with one element
        const result = Array.isArray(data) ? data[0] : data;

        return {
            status: result.Status || 'Error',
            message: result.Message || 'No records found',
            postOffices: result.PostOffice || null
        };
    } catch (error) {
        return {
            status: 'Error',
            message: `Failed to fetch PIN code data: ${error.message}`,
            postOffices: null
        };
    }
};

/**
 * Fetch post office details by branch name.
 * @param {string} branchName - Post office branch name (e.g., "New Delhi")
 * @returns {Promise<{ status: string, message: string, postOffices: Array|null }>}
 */
export const getPostOfficesByName = async (branchName) => {
    const name = String(branchName).trim();

    if (!name || name.length < 2) {
        return {
            status: 'Error',
            message: 'Branch name must be at least 2 characters',
            postOffices: null
        };
    }

    try {
        const encodedName = encodeURIComponent(name);
        const response = await fetch(`${BASE_URL}/postoffice/${encodedName}`);
        const data = await response.json();

        const result = Array.isArray(data) ? data[0] : data;

        return {
            status: result.Status || 'Error',
            message: result.Message || 'No records found',
            postOffices: result.PostOffice || null
        };
    } catch (error) {
        return {
            status: 'Error',
            message: `Failed to fetch post office data: ${error.message}`,
            postOffices: null
        };
    }
};

export default { getPostOfficesByPinCode, getPostOfficesByName };
