import parsePhoneNumberFromString, { getCountryCallingCode } from 'libphonenumber-js';

/**
 * Parse a phone number string and handle missing country codes or plus signs
 * @param {string} input - The phone number input
 * @param {import('libphonenumber-js').CountryCode} defaultCountry - Default country to assume if no country code (e.g., 'US', 'NL')
 * @returns {import('libphonenumber-js').PhoneNumber | null} - Parsed phone number or null if invalid
 */
function parseUserPhoneInput(input, defaultCountry = 'US') {
    if (!input) return null;

    // Check if input is in "COUNTRY-NUMBER" format from our phone input component
    const countryNumberMatch = input.match(/^([A-Z]{2})-(.+)$/);
    if (countryNumberMatch) {
        const [, country, number] = countryNumberMatch;
        // Strip any leading 0s from the number part (trunk prefix should not be included with country code)
        const cleanedNumber = number.replace(/^0+/, '');
        // Try parsing with the extracted country code
        const phoneNumber = parsePhoneNumberFromString(cleanedNumber, /** @type {import('libphonenumber-js').CountryCode} */ (country));
        if (phoneNumber && phoneNumber.isValid()) {
            return phoneNumber;
        }
        // If that didn't work, fall through to other methods
    }

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

// Test cases
const testCases = [
    // Valid COUNTRY-NUMBER format (from database - these worked)
    { input: 'US-14159671642', expected: { valid: true, country: 'US', national: '4159671642' } },
    { input: 'US-9499399130', expected: { valid: true, country: 'US', national: '9499399130' } },
    { input: 'GB-7878022330', expected: { valid: true, country: 'GB', national: '7878022330' } },
    { input: 'US-3237654932', expected: { valid: true, country: 'US', national: '3237654932' } },
    { input: 'US-19704201278', expected: { valid: true, country: 'US', national: '9704201278' } },
    { input: 'US-6198662036', expected: { valid: true, country: 'US', national: '6198662036' } },

    // COUNTRY-NUMBER with leading 0 (should strip the 0 and parse correctly)
    { input: 'GB-07739870860', expected: { valid: true, country: 'GB', national: '7739870860' } },
    { input: 'GB-07878022330', expected: { valid: true, country: 'GB', national: '7878022330' } },
    { input: 'DE-01234567890', expected: { valid: true, country: 'DE', national: '1234567890' } },
    { input: 'FR-0123456789', expected: { valid: true, country: 'FR', national: '123456789' } },
    { input: 'NL-0612345678', expected: { valid: true, country: 'NL', national: '612345678' } },

    // More valid international numbers
    { input: 'CA-4165551234', expected: { valid: true, country: 'CA', national: '4165551234' } },
    { input: 'AU-412345678', expected: { valid: true, country: 'AU', national: '412345678' } },
    { input: 'JP-9012345678', expected: { valid: true, country: 'JP', national: '9012345678' } },

    // Invalid cases (should return null or be invalid)
    { input: 'XX-1234567890', expected: { valid: false } }, // Invalid country code
    { input: 'US-123', expected: { valid: false } }, // Too short
    { input: 'GB-12345', expected: { valid: false } }, // Too short for GB
    { input: '', expected: { valid: false } }, // Empty
];

console.log('Testing phone number parsing...\n');

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
    const result = parseUserPhoneInput(test.input);
    const isValid = result && result.isValid();

    let testPassed = false;

    if (test.expected.valid) {
        // Should be valid
        if (isValid &&
            result.country === test.expected.country &&
            result.nationalNumber === test.expected.national) {
            testPassed = true;
        }
    } else {
        // Should be invalid or null
        if (!isValid || !result) {
            testPassed = true;
        }
    }

    if (testPassed) {
        console.log(`✓ Test ${index + 1}: ${test.input}`);
        if (result && isValid) {
            console.log(`  → Parsed: +${result.countryCallingCode} ${result.nationalNumber} (${result.country})`);
        }
        passed++;
    } else {
        console.log(`✗ Test ${index + 1}: ${test.input}`);
        console.log(`  Expected: ${JSON.stringify(test.expected)}`);
        if (result) {
            console.log(`  Got: valid=${isValid}, country=${result.country}, national=${result.nationalNumber}`);
        } else {
            console.log(`  Got: null`);
        }
        failed++;
    }
    console.log('');
});

console.log(`\n${passed}/${testCases.length} tests passed`);
if (failed > 0) {
    console.log(`${failed} tests failed`);
    process.exit(1);
}
