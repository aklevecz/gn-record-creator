import parsePhoneNumberFromString, { getCountryCallingCode } from 'libphonenumber-js';
import { getFieldByKey } from './mappers';

// Updated idToValues function using consolidated structure
/** @param {Record<string, string | string[] | number | null | undefined>} values */
export const idToValues = (values) => {
    return Object.entries(values).reduce((acc, [key, value]) => {
        const field = getFieldByKey(key);
        
        if (!field) {
            console.log(`No field found for key: ${key}`);
            return acc;
        }

        const columnId = field.mondayId;
        const type = field.mondayType;

        // Skip null or undefined values
        if (value === null || value === undefined) {
            return acc;
        }

        console.log(`${key} ${type} ${value}`);

        // Handle special remapping for source
        if (key === 'source' && field.remap && typeof value === 'string') {
            const mondayValue = field.remap[value];
            return {
                ...acc,
                [columnId]: mondayValue
            };
        }

        // Handle different Monday column types
        switch (type) {
            case 'email':
                if (typeof value !== 'string') return acc;
                return {
                    ...acc,
                    [columnId]: {
                        email: value,
                        text: value
                    }
                };

            case 'date':
                if (typeof value !== 'string') return acc;
                return {
                    ...acc,
                    [columnId]: {
                        date: value // Assuming value is in YYYY-MM-DD format
                    }
                };

            case 'numbers':
                const numValue = isNaN(parseFloat(String(value))) ? 0 : parseFloat(String(value));
                return {
                    ...acc,
                    [columnId]: numValue
                };

            case 'location':
                if (typeof value !== 'string') return acc;
                return {
                    ...acc,
                    [columnId]: {
                        lat: 0,
                        lng: 0,
                        address: value
                    }
                };

            case 'phone':
                if (typeof value !== 'string') return acc;
                const parsed = parseUserPhoneInput(value, 'US');
                if (parsed && parsed.isValid()) {
                    return {
                        ...acc,
                        [columnId]: {
                            phone: parsed.nationalNumber,
                            countryShortName: parsed.country
                        }
                    };
                } else {
                    return {
                        ...acc,
                        [columnId]: {
                            phone: value
                        }
                    };
                }

            default:
                // Default case - just pass the value as is for text fields and others
                return {
                    ...acc,
                    [columnId]: value
                };
        }
    }, {});
};

/**
 * Parse a phone number string and handle missing country codes or plus signs
 * @param {string} input - The phone number input
 * @param {import('libphonenumber-js').CountryCode} defaultCountry - Default country to assume if no country code (e.g., 'US', 'NL')
 * @returns {import('libphonenumber-js').PhoneNumber | null} - Parsed phone number or null if invalid
 */
function parseUserPhoneInput(input, defaultCountry = 'US') {
    if (!input) return null;

    // Clean the input
    const cleaned = input
        .toString()
        .replace(/\s+/g, '')
        .replace(/[-().]/g, '');

    // Case 1: Try parsing with a + prefix if it doesn't already have one
    if (!cleaned.startsWith('+')) {
        let phoneNumber = parsePhoneNumberFromString(`+${cleaned}`);

        // Check if this looks like a valid international number
        if (phoneNumber && phoneNumber.isValid()) {
            return phoneNumber;
        }
    }

    // Case 2: Try parsing as is (might already have + or be a local number)
    let phoneNumber = parsePhoneNumberFromString(cleaned, defaultCountry);

    // If valid using the default country, return it
    if (phoneNumber && phoneNumber.isValid()) {
        return phoneNumber;
    }

    // Case 3: If input starts with defaultCountry's calling code but missing +, try that
    const countryCode = getCountryCallingCode(defaultCountry);
    if (cleaned.startsWith(countryCode)) {
        phoneNumber = parsePhoneNumberFromString(`+${cleaned}`);
        if (phoneNumber && phoneNumber.isValid()) {
            return phoneNumber;
        }
    }

    // Case 4: As a last resort, try with original input and default country
    phoneNumber = parsePhoneNumberFromString(input, defaultCountry);
    return phoneNumber || null; // Convert undefined to null if all parsing attempts failed
}
