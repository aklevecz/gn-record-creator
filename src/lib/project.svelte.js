import db from './db';
import projects from './projects.svelte';
import { serializeDeep, toSnakeCase } from './utils';
import r2Api from '$lib/api/r2';
import { cachedKeys } from './storage';
import { DATA_VERSION } from '$lib';

/** @type {Project} */
export const defaultProjectState = {
    id: '',
    mondayId: '',
    version: DATA_VERSION,
    name: 'new project',
    createdAt: new Date(),
    details: null,
    textures: [],
    pricing: {
        record_color: 0,
        total_units: 0,
        records_per_set: 0,
        record_format: 0,
        lacquers: 0,
        metalwork: 0,
        test_prints: 0,
        packaging: 0,
        estimatedCost: 0
    },
    carbonSavings: {
        // Keys based on src/lib/survey-data-model/index.js
        packaging: 0,
        shipping_address: 0, // Placeholder for distance/region calculation
        record_color: 0,
        total_units: 0,
        estimatedCarbonSavings: 0
    }
};


// TODO: MOVE CALCULATOR FUNCTIONS SOMEWHERE ELSE

/** @typedef {keyof Omit<Pricing, 'estimatedCost'>} PricingKey */

/** @type {PricingKey[]} */
const pricingKeys = /** @type {PricingKey[]} */ (
    Object.keys(defaultProjectState.pricing).filter((key) => key !== 'estimatedCost')
);

// /** @typedef {keyof Omit<typeof defaultProjectState.carbonSavings, 'estimatedCarbonSavings'>} CarbonSavingsKey */
/** @typedef {keyof Omit<CarbonSavings, 'estimatedCarbonSavings'>} CarbonSavingsKey */


/** @type {CarbonSavingsKey[]} */
const carbonSavingsKeys = /** @type {CarbonSavingsKey[]} */ (
    Object.keys(defaultProjectState.carbonSavings).filter((key) => key !== 'estimatedCarbonSavings')
);

/** @type {Record<PricingKey, any>} pricingGuide */
const pricingGuide = {
    record_color: {
        habanero: 5,
        type: 'categorical'
    },
    total_units: {
        type: 'scale',
        value: 3
    },
    record_format: {
        type: 'category',
        '33_12in_180g': 3,
        '45_12in_180g': 4
    },
    records_per_set: {
        type: 'categorical',
        '1lp': 1,
        '2lp': 2,
        '3lp': 3,
        '4lp': 4
    },
    lacquers: {
        type: 'categorical',
        yes: 5,
        no: 0
    },
    metalwork: {
        type: 'categorical',
        '2_step_stamper': 2,
        '3_step_stamper': 3
    },
    test_prints: {
        type: 'scale',
        value: 5
    },
    packaging: {
        type: 'categorical',
        single_pocket: 1,
        gatefold: 2,
        single_pocket_with_wide_spine: 3
    }
};

/** @type {Record<CarbonSavingsKey, any>} carbonSavingsGuide */
// Placeholder guide - update with actual calculation logic and values
const carbonSavingsGuide = {
    packaging: {
        type: 'categorical',
        single_pocket: 5, // Example savings points
        gatefold: 3,
        single_pocket_with_wide_spine_2lp: 4, // Ensure snake_case matches toSnakeCase(value)
        no_packaging_required: 10 // Most savings
    },
    shipping_address: {
        // This needs real logic, e.g., distance calculation or zone mapping.
        // Placeholder: Assign points based on address string length (highly inaccurate example)
        type: 'scale',
        value: -0.01 // Example: Longer address string = slightly less savings (bad proxy for distance)
    },
    record_color: {
        type: 'categorical',
        cosmic_black: 2, // Example: Black vinyl might have different impact
        glassy_ice: 1, // Example: Clear vinyl
        default: 0 // Savings for other colors
        // Add other specific colors if they have different impacts
    },
    total_units: {
        type: 'scale',
        // Example: Savings might decrease slightly per unit due to scale, or increase if using bulk eco-materials
        value: 0.005 // Example: Small saving per unit
    }
};

// We now have textures and cachedTextures which is kind of confusing
const createProject = () => {
    let project = $state({ ...defaultProjectState });

    // Could combine these into a textures object
    // Do these need to be reactive?
    /** @type {IDBTextureObject[]} */
    let cachedTextures = $state([]);

    /** @type {string[]} */
    let remoteTextureIds = $state([]);

    let texturesLoaded = $state(false);

    let activeTextureId = $state('');
    let activeTextureUrl = $state('');

    return {
        get state() {
            return project;
        },
        get cachedTextures() {
            return cachedTextures;
        },
        get texturesLoaded() {
            return texturesLoaded;
        },
        get activeTextureId() {
            return activeTextureId;
        },
        get activeTextureUrl() {
            return activeTextureUrl;
        },
        /** @param {Project} newState */
        set(newState) {
            project = newState;
        },
        /**
         * @param {{name?: string, details: Details, textures: Texture[]}} props
         * @returns {Project}
         */
        create({ name, details, textures }) {
            const id = crypto.randomUUID();
            project.id = id;
            project.name = name || id;
            project.details = details;
            project.textures = textures;
            project.createdAt = new Date();
            project.pricing = {
                record_color: 0,
                total_units: 0,
                records_per_set: 0,
                record_format: 0,
                lacquers: 0,
                metalwork: 0,
                test_prints: 0,
                packaging: 0,
                estimatedCost: 0
            };
            project.carbonSavings = {
                // Initialize with new keys
                packaging: 0,
                shipping_address: 0,
                record_color: 0,
                total_units: 0,
                estimatedCarbonSavings: 0
            };

            return {
                id: project.id,
                mondayId: project.mondayId,
                version: project.version,
                name: project.name,
                details: project.details,
                textures: project.textures,
                createdAt: project.createdAt,
                pricing: project.pricing,
                carbonSavings: project.carbonSavings // Include in returned object
            };
        },
        /** @param {{name: string, details: Details, survey: Survey}} props */
        update({ name, details, survey }) {
            project.name = name;
            project.details = details;

            return {
                name: project.name,
                details: project.details,
                createdAt: project.createdAt
            };
        },
        /** @param {string} name */
        updateName(name) {
            project.name = name;
            projects.updateProject(serializeDeep(project));
        },
        /** @param {Details} details */
        updateDetails(details) {
            project.details = details;

            // update pricing -- doesn't need to pass details in? but maybe safer
            this.updatePricing(details);
            this.updateCarbonSavings(details); // Add call to update carbon savings
            // @ts-ignore
            project.name = project.details?.title.value || project.name;
            projects.updateProject(serializeDeep(project));
        },
        /** @param {Details} details */
        updatePricing(details) {
            const pricingObjects = pricingKeys.reduce(
                (/** @type {Record<string, string>} */ acc, key) => {
                    if (details && details[key] && typeof details[key].value !== 'undefined') {
                        acc[key] = toSnakeCase(String(details[key].value));
                    } else {
                        acc[key] = '';
                        // console.warn(`Missing value for pricing key: ${key}`);
                    }
                    return acc;
                },
                {}
            );

            let estimatedCost = 0;

            pricingKeys.forEach((pricingKey) => {
                const guide = pricingGuide[pricingKey];
                const valueStr = pricingObjects[pricingKey];
                let itemCost = 0;

                if (!guide || !valueStr) {
                    project.pricing[pricingKey] = 0;
                    return;
                }

                try {
                    if (guide.type === 'scale') {
                        const valueNum = parseInt(valueStr);
                        if (!isNaN(valueNum) && typeof guide.value === 'number') {
                            itemCost = valueNum * guide.value;
                        }
                    } else if (guide.type === 'categorical' || guide.type === 'category') {
                        const costValue = guide[valueStr];
                        if (typeof costValue === 'number') {
                            itemCost = costValue;
                        } else {
                            const parsedCost = parseInt(costValue);
                            if (!isNaN(parsedCost)) {
                                itemCost = parsedCost;
                            } else {
                                itemCost = 0;
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Error calculating pricing for key ${pricingKey}:`, error);
                    itemCost = 0;
                }

                if (isNaN(itemCost)) {
                    console.warn(`Calculated NaN for pricing key: ${pricingKey}. Setting to 0.`);
                    itemCost = 0;
                }

                if (isNaN(itemCost)) {
                    console.warn(
                        `Calculated NaN for pricing key: ${String(pricingKey)}. Setting to 0.`
                    );
                    itemCost = 0;
                }

                project.pricing[pricingKey] = itemCost;
                estimatedCost += itemCost;
            });

            project.pricing.estimatedCost = estimatedCost;
        },
        /** @param {Details} details */
        updateCarbonSavings(details) {
            // Ensure details object exists
            if (!details) {
                console.warn('Cannot update carbon savings: details object is missing.');
                // Optionally reset savings to 0 or handle as appropriate
                carbonSavingsKeys.forEach((key) => (project.carbonSavings[key] = 0));
                project.carbonSavings.estimatedCarbonSavings = 0;
                return;
            }

            const savingsObjects = carbonSavingsKeys.reduce(
                (/** @type {Record<string, string>} */ acc, key) => {
                    // Check if the key exists in details and has a value property
                    if (details[key] && typeof details[key].value !== 'undefined') {
                        // Convert value to snake_case string for categorical matching
                        // For non-categorical, ensure it's a string for consistent processing initially
                        acc[key] = toSnakeCase(String(details[key].value));
                    } else {
                        acc[key] = ''; // Assign empty string if key or value is missing
                        console.warn(`Missing value for carbon savings key: ${key} in details`);
                    }
                    return acc;
                },
                {}
            );

            let estimatedCarbonSavings = 0;

            carbonSavingsKeys.forEach((savingsKey) => {
                const guide = carbonSavingsGuide[savingsKey];
                // Use the snake_cased string value fetched earlier
                const valueStr = savingsObjects[savingsKey];
                let itemSavings = 0;

                // Skip calculation if guide or value is missing for this key
                if (!guide || valueStr === '') {
                    project.carbonSavings[savingsKey] = 0;
                    return;
                }

                try {
                    if (guide.type === 'scale') {
                        // For scale, parse the original (non-snake-cased) value if possible
                        const originalValue = details[savingsKey]?.value;
                        const valueNum = parseFloat(String(originalValue)); // Use parseFloat for potential decimals
                        if (!isNaN(valueNum) && typeof guide.value === 'number') {
                            // Apply scale calculation (adjust logic as needed, e.g., for address)
                            if (savingsKey === 'shipping_address') {
                                // Replace with actual distance/zone logic
                                itemSavings = String(originalValue).length * guide.value; // Bad placeholder logic
                            } else {
                                itemSavings = valueNum * guide.value;
                            }
                        }
                    } else if (guide.type === 'categorical') {
                        // Use the snake_cased valueStr for lookup
                        const savingsValue = guide[valueStr];
                        if (typeof savingsValue === 'number') {
                            itemSavings = savingsValue;
                        } else if (typeof guide.default === 'number') {
                            // Fallback to default if specific category value not found
                            itemSavings = guide.default;
                        }
                    }
                    // Add other types like 'address' if more complex logic is needed
                } catch (error) {
                    console.error(`Error calculating carbon savings for key ${savingsKey}:`, error);
                    itemSavings = 0;
                }

                // Ensure itemSavings is a number, default to 0 if NaN
                if (isNaN(itemSavings)) {
                    console.warn(
                        `Calculated NaN for carbon savings key: ${String(savingsKey)}. Setting to 0.`
                    );
                    itemSavings = 0;
                }

                project.carbonSavings[savingsKey] = itemSavings;
                estimatedCarbonSavings += itemSavings;
            });

            project.carbonSavings.estimatedCarbonSavings = estimatedCarbonSavings;
        },
        /** @param {Texture} texture */
        addTexture(texture) {
            if (project.textures.find((t) => t.fileHash === texture.fileHash)) return;
            project.textures.push(texture);
            projects.updateProject(serializeDeep(project));
        },
        async checkTextures() {
            // This checks for textures related to a project
            // First it checks IDB, then it checks textures loaded into state initially, and then it checks r2
            // The main question is if we IDB can be reliable or if we need to be smart about checking other sources
            texturesLoaded = false;
            console.log(`Checking textures for project ${project.id}`);

            try {
                // Currently this is ONLY IDB, should it have more of this logic below?
                cachedTextures = await db.getTexturesByProjectId(project.id);
            } catch (error) {
                console.log('Texture from the IDB failed try to fetch remotely...');
            }

            // local texture ids that should match the above from idb
            const textures = project.textures;
            // just in case fetched from the r2
            const remoteTexturesPaths = await r2Api.getAllUploadsByProjectId(project.id);
            remoteTextureIds = remoteTexturesPaths
                .map((path) => path.split('/').pop())
                .filter((path) => path !== undefined);

            // Compare textures to remoteTextureIds
            const remoteOnlyTextures = remoteTextureIds.filter(
                (textureId) => !textures.map((t) => t.fileHash).includes(textureId)
            );
            texturesLoaded = true;
            // Do something with remoteOnlyTextures...
        },

        async generateTextureObjectsWithUrls() {
            const textureObjects = cachedTextures.map((texture) => {
                const blobFromBuffer = new Blob([texture.arrayBuffer], { type: texture.fileType });
                const url = URL.createObjectURL(blobFromBuffer);
                return {
                    url,
                    id: texture.id,
                    seed: texture.seed,
                    fileName: texture.fileName,
                    arrayBuffer: texture.arrayBuffer,
                    fileType: texture.fileType
                };
            });
            return textureObjects;
        },
        /** @param {string} textureId */
        async setActiveTexture(textureId) {
            // do i need to check if it exists?
            cachedKeys.setProjectTexture(project.id, textureId);
            activeTextureId = textureId;
            this.generateActiveTexture();
        },
        async resetActiveTexture() {
            // cachedKeys.setProjectTexture(project.id, '');
            activeTextureId = '';
            activeTextureUrl = '';
            // this.generateActiveTexture();
        },
        async generateActiveTexture() {
            // in theory this could just run whenever activeTextureId changes
            URL.revokeObjectURL(activeTextureUrl);
            // const activeTextureId = cachedKeys.getProjectTexture(project.id);
            if (activeTextureId) {
                try {
                    // This is also only IDB right now
                    const activeTextureArrayBuffer = await db.getTexture(activeTextureId);
                    if (activeTextureArrayBuffer) {
                        const blobFromBuffer = new Blob([activeTextureArrayBuffer], {
                            type: 'image/png'
                        });
                        const url = URL.createObjectURL(blobFromBuffer);
                        activeTextureUrl = url;
                        return url;
                    }
                } catch (error) {
                    console.log('Texture from the IDB failed try to fetch remotely...');
                    // logic to fetch texture remotely and then cache locally or not?
                }
            }
        }
    };
};

const project = createProject();
export default project;

export { createProject };
