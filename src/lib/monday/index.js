import { questions } from '$lib/form-data-model';
import parsePhoneNumberFromString, { getCountryCallingCode } from 'libphonenumber-js';
import { intakeFormFields, intakeFormIdToTitleAndType, keyToId } from './mappers';

/** @param {Record<string, string>} values */
export const idToValues = (values) => {
    return Object.entries(values).reduce((acc, [key, value]) => {
        const columnId = keyToId[key];
        // @ts-ignore
        // const {type} = dealTrackerColumnIdToTitleAndType[columnId];
        if (!columnId) {
            console.log(`No column ID found for key: ${key}`);
        }
        const { type } = intakeFormIdToTitleAndType[columnId];

        // Skip null or undefined values
        if (value === null || value === undefined) {
            return acc;
        }

        // Handle different column types based on their ID or expected format

        // Handle email columns
        if (type === 'email') {
            return {
                ...acc,
                [columnId]: {
                    email: value,
                    text: value // You can customize the display text if needed
                }
            };
        }

        // TO DO: FIX THIS -- MAYBE THIS IS A MODEL FOR MOVING AWAY FROM `questions`
        else if (type === 'status') {
            // let index = null;
            // if (questions[key]) {
            //     index = Math.max(
            //         questions[key].options.findIndex((option) => option.text === value),
            //         0
            //     );
            // } else {
            //     // FOR ITEMS THAT ARE NOT IN THE FORM BUT APPEAR IN MONDAY OR WHATEVER CRM
            //     index = intakeFormFields[key].options[value.toLowerCase()];
            // }
            // return {
            //     ...acc,
            //     [columnId]: {
            //         index
            //     }
            // };
        }

        // Handle date columns
        else if (type === 'date') {
            return {
                ...acc,
                [columnId]: {
                    date: value // Assuming value is in YYYY-MM-DD format
                }
            };
        }

        // Handle number columns
        else if (type === 'numbers') {
            // Ensure value is sent as a numeric value
            const numValue = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
            return {
                ...acc,
                [columnId]: numValue
            };
        } else if (type === 'location') {
            return {
                ...acc,
                [columnId]: {
                    lat: 0,
                    lng: 0,
                    address: value
                }
            };
        } else if (type === 'phone') {
            // console.log(value);
            // const parsed = parsePhoneNumberFromString(value, 'US');
            // console.log(parsed);
            // const countryCode = parsed.countryCallingCode;
            // const phoneNumber = parsed.nationalNumber;
            // // const splitPhone = value.split('-');
            // // const countryCode = splitPhone[0];
            // // const phoneNumber = `+${splitPhone[1]}`;
            // return {
            //     ...acc,
            //     [columnId]: {
            //         phone: phoneNumber,
            //         countryShortName: parsed.country
            //     }
            // };
            const parsed = parseUserPhoneInput(value, 'US');
            if (parsed && parsed.isValid()) {
                return {
                    ...acc,
                    [columnId]: {
                        phone: parsed.nationalNumber,
                        countryShortName: parsed.country
                        // countryCallingCode: parsed.countryCallingCode,
                        // formattedNumber: parsed.formatInternational()
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
        }

        // Default case - just pass the value as is for text fields and others
        return {
            ...acc,
            [columnId]: value
        };
    }, {});
};

/**
 * Parse a phone number string and handle missing country codes or plus signs
 * @param {string} input - The phone number input
 * @param {string} defaultCountry - Default country to assume if no country code (e.g., 'US', 'NL')
 * @returns {Object|null} - Parsed phone number or null if invalid
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
    return phoneNumber; // May be null if all parsing attempts failed
}
