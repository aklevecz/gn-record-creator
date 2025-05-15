import { detailsDict } from './form-data-model';
import project from './project.svelte';

/** @type {Details} */
export const defaultDetailState = detailsDict;

const createDetails = () => {
    let details = $state({ ...defaultDetailState });

    return {
        get state() {
            return details;
        },
        /** @param {Details} newState */
        set(newState) {
            details = newState;
        },
        /** @param {string} key @param {string} value */
        setValue(key, value) {
            // THIS SHOULD BE SOMEWHERE ELSE -- MAYBE THE COMPONENT SHOULD DETECT IMPLICITLY IF IT IS THIS KEY
            // if (key === 'record_color') {
            //     const colorHex = questions.record_color.options.find((option) => option.text === value)?.color || '#000000';
            //     const changeRecordColorEvent = new CustomEvent('change-record-color', {
            //         detail: { color: colorHex }
            //     });

            //     window.dispatchEvent(changeRecordColorEvent);
            // }
            details[key].value = value;
            project.updateDetails(details);
        },
        remapDetails() {
            const responses = Object.entries(details).reduce((/** @type {Record<string, string>} */ acc, [key, obj]) => {
                acc[key] = obj.value;
                return acc;
            }, {});
            return responses;
        },
        validateFormFinished() {
            let isValid = true;
            /** @type {string[]} missingFields */
            let missingFields = [];
            Object.entries(details).forEach(([key, obj]) => {
                if (obj.required && !obj.value) {
                    isValid = false;
                    missingFields.push(key);
                }
            });
            return { isValid, missingFields };
        },
        reset() {
            details = { ...defaultDetailState };
        }
    };
};

const details = createDetails();

export default details;

/**
 * Takes remapped details (just key-value pairs) and updates the detailed dictionary
 * @param {Record<string, string>} remappedDetails - Simple object with key-value pairs
 * @param {Record<string, Detail>} currentDetailsDict - Current detailed dictionary
 * @returns {Record<string, Detail>} - Updated detailed dictionary
 */
const unmapDetails = (remappedDetails, currentDetailsDict = { ...detailsDict }) => {
    // Create a deep copy of the current details dictionary to avoid mutation
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

export { unmapDetails };
