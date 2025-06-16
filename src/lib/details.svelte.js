// Updated details.svelte.js
import { formFields } from './monday/mappers';
import project from './project.svelte';

/**
 * Create default form state from consolidated form fields
 * @returns {Record<string, {value: string | string[], touched: boolean, errors: string[]}>}
 */
const createDefaultFormState = () => {
    const state = {};
    Object.keys(formFields).forEach(key => {
        const field = formFields[key];
        state[key] = {
            value: field.defaultValue,
            touched: false,
            errors: []
        };
    });
    return state;
};

/** @type {Record<string, {value: string | string[], touched: boolean, errors: string[]}>} */
export const defaultFormState = createDefaultFormState();
export const defaultDetailState = defaultFormState

const createFormManager = () => {
    let formState = $state({ ...defaultFormState });

    return {
        get state() {
            return formState;
        },
        
        get fields() {
            return formFields;
        },

        set(newState) {
            formState = newState;
        },

        /**
         * Get field configuration
         * @param {string} key 
         * @returns {import('./consolidated-form-data').FormField | undefined}
         */
        getField(key) {
            return formFields[key];
        },

        /**
         * Get current field value
         * @param {string} key 
         * @returns {string | string[]}
         */
        getValue(key) {
            return formState[key]?.value ?? '';
        },

        /**
         * Get field options
         * @param {string} key 
         * @returns {Array<{value: string, text: string, index?: number, color?: string, img?: string}>}
         */
        getOptions(key) {
            return formFields[key]?.options ?? [];
        },

        /**
         * Check if field is required
         * @param {string} key 
         * @returns {boolean}
         */
        isRequired(key) {
            return formFields[key]?.required ?? false;
        },

        /**
         * Check if field has been touched
         * @param {string} key 
         * @returns {boolean}
         */
        isTouched(key) {
            return formState[key]?.touched ?? false;
        },

        /**
         * Get field errors
         * @param {string} key 
         * @returns {string[]}
         */
        getErrors(key) {
            return formState[key]?.errors ?? [];
        },

        /**
         * Set field value
         * @param {string} key 
         * @param {string | string[]} value 
         */
        setValue(key, value) {
            if (!formState[key]) {
                formState[key] = { value: '', touched: false, errors: [] };
            }
            
            formState[key].value = value;
            formState[key].touched = true;
            
            // Clear errors when value changes
            formState[key].errors = [];
            
            // Validate the field
            this.validateField(key);
            
            // Custom event handling (like your record color change)
            this.handleSpecialFields(key, value);
            
            // Update project with legacy format for compatibility
            project.updateDetails(this.getLegacyFormat());
        },

        /**
         * Handle special field behaviors
         * @param {string} key 
         * @param {string | string[]} value 
         */
        handleSpecialFields(key, value) {
            if (key === 'record_color') {
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
         * Validate a single field
         * @param {string} key 
         */
        validateField(key) {
            const field = formFields[key];
            const fieldState = formState[key];
            
            if (!field || !fieldState) return;
            
            const errors = [];
            const value = fieldState.value;
            
            // Required field validation
            if (field.required) {
                if (Array.isArray(value)) {
                    if (value.length === 0) {
                        errors.push(`${field.label} is required`);
                    }
                } else {
                    if (!value || value.toString().trim() === '') {
                        errors.push(`${field.label} is required`);
                    }
                }
            }
            
            // Email validation
            if (field.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value.toString())) {
                    errors.push('Please enter a valid email address');
                }
            }
            
            // Phone validation
            if (field.type === 'tel' && value) {
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                if (!phoneRegex.test(value.toString().replace(/[-\s\(\)]/g, ''))) {
                    errors.push('Please enter a valid phone number');
                }
            }
            
            // Max selections validation
            if (field.maxSelections && Array.isArray(value)) {
                if (value.length > field.maxSelections) {
                    errors.push(`Maximum ${field.maxSelections} selections allowed`);
                }
            }
            
            fieldState.errors = errors;
        },

        /**
         * Validate entire form - matches your original validateFormFinished signature
         * @returns {{isValid: boolean, missingFields: string[]}}
         */
        validateFormFinished() {
            let isValid = true;
            const missingFields = [];
            
            Object.keys(formFields).forEach(key => {
                this.validateField(key);
                const fieldErrors = this.getErrors(key);
                
                if (fieldErrors.length > 0) {
                    isValid = false;
                    
                    if (this.isRequired(key) && !this.getValue(key)) {
                        missingFields.push(key);
                    }
                }
            });
            
            return { isValid, missingFields };
        },

        /**
         * Get form data as key-value pairs - matches your original remapDetailsAndStringify signature
         * @param {boolean} stringifyArrays 
         * @returns {Record<string, string | string[]>}
         */
        remapDetailsAndStringify(stringifyArrays = true) {
            const data = {};
            Object.keys(formFields).forEach(key => {
                const value = this.getValue(key);
                if (stringifyArrays && Array.isArray(value)) {
                    data[key] = value.join(',');
                } else {
                    data[key] = value;
                }
            });
            return data;
        },

        /**
         * Reset form to default state
         */
        reset() {
            formState = { ...defaultFormState };
        },

        /**
         * Set entire form state (for loading saved data)
         * @param {Record<string, string | string[]>} data 
         */
        setFormData(data) {
            Object.entries(data).forEach(([key, value]) => {
                if (formFields[key]) {
                    this.setValue(key, value);
                }
            });
        },

        /**
         * Mark field as touched
         * @param {string} key 
         */
        touch(key) {
            if (formState[key]) {
                formState[key].touched = true;
            }
        },

        /**
         * Legacy compatibility - get data in old detailsDict format
         * @returns {Record<string, {label: string, description: string, value: any, type: string, required: boolean}>}
         */
        getLegacyFormat() {
            const legacy = {};
            Object.keys(formFields).forEach(key => {
                const field = formFields[key];
                const value = this.getValue(key);
                legacy[key] = {
                    label: field.label,
                    description: field.description,
                    value: value,
                    type: field.type,
                    required: field.required,
                    ...(field.maxSelections && { maxSelections: field.maxSelections }),
                    ...(field.tooltip && { tooltip: field.tooltip })
                };
            });
            return legacy;
        }
    };
};

const details = createFormManager();

export default details;

// Keep your exact same exports for backwards compatibility
export const validateFormFinished = () => details.validateFormFinished();
export const remapDetailsAndStringify = (stringifyArrays = true) => details.remapDetailsAndStringify(stringifyArrays);

/**
 * Legacy function - Takes remapped details and updates form state
 * @param {Record<string, string>} remappedDetails - Simple object with key-value pairs
 * @param {Record<string, any>} currentDetailsDict - Current detailed dictionary (ignored in new implementation)
 * @returns {Record<string, any>} - Updated form data in legacy format
 */
export const unmapDetails = (remappedDetails, currentDetailsDict = {}) => {
    details.setFormData(remappedDetails);
    return details.getLegacyFormat();
};
// import { detailsDict } from './form-data-model';
// import project from './project.svelte';

// /** @type {Details} */
// export const defaultDetailState = detailsDict;

// const createDetails = () => {
//     let details = $state({ ...defaultDetailState });

//     return {
//         get state() {
//             return details;
//         },
//         /** @param {Details} newState */
//         set(newState) {
//             details = newState;
//         },
//         /** @param {string} key @param {string | string[]} value */
//         setValue(key, value) {
//             // THIS SHOULD BE SOMEWHERE ELSE -- MAYBE THE COMPONENT SHOULD DETECT IMPLICITLY IF IT IS THIS KEY
//             // if (key === 'record_color') {
//             //     const colorHex = questions.record_color.options.find((option) => option.text === value)?.color || '#000000';
//             //     const changeRecordColorEvent = new CustomEvent('change-record-color', {
//             //         detail: { color: colorHex }
//             //     });

//             //     window.dispatchEvent(changeRecordColorEvent);
//             // }

//             // if array then join with DELIMITER
//             // if (value instanceof Array) {
//             //     value = value.join(DELIMITER);
//             // }
//             // or it could turn it into a string when submitting it to the api
//             details[key].value = value;
//             project.updateDetails(details);
//         },
//         // Remap and turn array to strings?
//         remapDetailsAndStringify(stringifyArrays = true) {
//             const responses = Object.entries(details).reduce((/** @type {Record<string, string | string[]>} */ acc, [key, obj]) => {
//                 if (stringifyArrays && Array.isArray(obj.value)) {
//                     acc[key] = obj.value.join(',');
//                 } else {
//                     acc[key] = obj.value;
//                 }
//                 return acc;
//             }, {});
//             return responses;
//         },
//         validateFormFinished() {
//             let isValid = true;
//             /** @type {string[]} missingFields */
//             let missingFields = [];
//             Object.entries(details).forEach(([key, obj]) => {
//                 if (obj.required && !obj.value) {
//                     isValid = false;
//                     missingFields.push(key);
//                 }
//             });
//             return { isValid, missingFields };
//         },
//         reset() {
//             details = { ...defaultDetailState };
//         }
//     };
// };

// const details = createDetails();

// export default details;


// // NOT BEING USED BUT NEEDS TO HANDLE THE ARRAYS AS JOINED STRINGS
// /**
//  * Takes remapped details (just key-value pairs) and updates the detailed dictionary
//  * @param {Record<string, string>} remappedDetails - Simple object with key-value pairs
//  * @param {Record<string, Detail>} currentDetailsDict - Current detailed dictionary
//  * @returns {Record<string, Detail>} - Updated detailed dictionary
//  */
// const unmapDetails = (remappedDetails, currentDetailsDict = { ...detailsDict }) => {
//     // Create a deep copy of the current details dictionary to avoid mutation
//     const updatedDetailsDict = JSON.parse(JSON.stringify(currentDetailsDict));

//     // Update each value in the details dictionary
//     Object.entries(remappedDetails).forEach(([key, value]) => {
//         // Only update keys that exist in the current dictionary
//         if (key in updatedDetailsDict) {
//             updatedDetailsDict[key].value = value;
//         }
//     });

//     return updatedDetailsDict;
// };

// export { unmapDetails };
