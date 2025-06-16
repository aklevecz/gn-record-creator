// Updated details.svelte.js
import { formFields } from './monday/mappers';
import project from './project.svelte';

/**
 * Create default detail state from consolidated form fields
 * @returns {Details}
 */
const createDefaultDetailState = () => {
    /** @type {Details} */
    const state = {};
    Object.keys(formFields).forEach(key => {
        /** @type {FormField} */
        const field = formFields[key];
        state[key] = {
            label: field.label,
            description: field.description,
            value: field.defaultValue,
            type: field.type,
            required: field.required,
            ...(field.maxSelections && { maxSelections: field.maxSelections }),
            ...(field.tooltip && { tooltip: field.tooltip })
        };
    });
    return state;
};

/** @type {Details} */
export const defaultDetailState = createDefaultDetailState();

const createDetails = () => {
    /** @type {Details} */
    let details = $state({ ...defaultDetailState });

    return {
        get state() {
            return details;
        },
        
        get fields() {
            return formFields;
        },

        /**
         * Set new state
         * @param {Details} newState 
         */
        set(newState) {
            details = newState;
        },

        /**
         * Set field value
         * @param {string} key 
         * @param {string|string[]} value 
         */
        setValue(key, value) {
            // Handle special fields (like your record color change)
            this.handleSpecialFields(key, value);
            
            details[key].value = value;
            project.updateDetails(details);
        },

        /**
         * Handle special field behaviors
         * @param {string} key 
         * @param {string|string[]} value 
         */
        handleSpecialFields(key, value) {
            if (key === 'record_color') {
                /** @type {FormField} */
                const field = formFields[key];
                const selectedOption = field.options?.find(option => option.value === value);
                if (selectedOption?.color) {
                    const changeRecordColorEvent = new CustomEvent('change-record-color', {
                        detail: { color: selectedOption.color }
                    });
                    window.dispatchEvent(changeRecordColorEvent);
                }
            }
        },

        /**
         * Remap and stringify
         * @param {boolean} stringifyArrays 
         * @returns {Record<string, string|string[]>}
         */
        remapDetailsAndStringify(stringifyArrays = true) {
            const responses = Object.entries(details).reduce((/** @type {Record<string, string|string[]>} */ acc, [key, obj]) => {
                if (stringifyArrays && Array.isArray(obj.value)) {
                    acc[key] = obj.value.join(',');
                } else {
                    acc[key] = obj.value;
                }
                return acc;
            }, {});
            return responses;
        },

        /**
         * Validate form
         * @returns {{isValid: boolean, missingFields: string[]}}
         */
        validateFormFinished() {
            let isValid = true;
            /** @type {string[]} */
            let missingFields = [];
            Object.entries(details).forEach(([key, obj]) => {
                if (obj.required && !obj.value) {
                    isValid = false;
                    missingFields.push(key);
                }
            });
            return { isValid, missingFields };
        },

        /**
         * Reset form state
         */
        reset() {
            details = { ...defaultDetailState };
        }
    };
};

const details = createDetails();

export default details;

// Export the methods directly for backwards compatibility
export const validateFormFinished = () => details.validateFormFinished();
export const remapDetailsAndStringify = (stringifyArrays = true) => details.remapDetailsAndStringify(stringifyArrays);

/**
 * Legacy function - Takes remapped details and updates form state
 * @param {Record<string, string>} remappedDetails - Simple object with key-value pairs
 * @param {Details} currentDetailsDict - Current detailed dictionary (defaults to current state)
 * @returns {Details} - Updated detailed dictionary
 */
export const unmapDetails = (remappedDetails, currentDetailsDict = details.state) => {
    // Create a deep copy to avoid mutation
    const updatedDetailsDict = JSON.parse(JSON.stringify(currentDetailsDict));

    // Update each value in the details dictionary
    Object.entries(remappedDetails).forEach(([key, value]) => {
        // Only update keys that exist in the current dictionary
        if (key in updatedDetailsDict) {
            updatedDetailsDict[key].value = value;
        }
    });

    return updatedDetailsDict;
};
