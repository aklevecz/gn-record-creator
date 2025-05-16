import { questions } from '$lib/form-data-model';
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
            let index = null;
            if (questions[key]) {
                 index = Math.max(
                    questions[key].options.findIndex((option) => option.text === value),
                    0
                );
            } else {
                // FOR ITEMS THAT ARE NOT IN THE FORM BUT APPEAR IN MONDAY OR WHATEVER CRM
                index = intakeFormFields[key].options[value.toLowerCase()];
            }
            return {
                ...acc,
                [columnId]: {
                    index
                }
            };
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
            const splitPhone = value.split('-');
            const countryCode = splitPhone[0];
            const phoneNumber = `+${splitPhone[1]}`;
            return {
                ...acc,
                [columnId]: {
                    phone: phoneNumber,
                    countryShortName: countryCode
                }
            };
        }

        // Default case - just pass the value as is for text fields and others
        return {
            ...acc,
            [columnId]: value
        };
    }, {});
};
