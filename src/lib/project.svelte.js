import db from './db';
import projects from './projects.svelte';
import { serializeDeep, toSnakeCase, generateUUID } from './utils';
import r2Api from '$lib/api/r2';
import { cachedKeys } from './storage';
import { DATA_VERSION } from '$lib';
import { mapDetailsToCarbonInputs, shouldEstimate } from './carbon/mapDetailsToInputs';

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
        // Real cradle-to-gate emissions from carbon-svc.
        // See CARBON_CALC.md in the gn-record-creator repo for the model.
        emittedKg: 0,             // total kg CO₂e for the order
        savedKg: 0,               // total kg CO₂e saved vs. global industry baseline
        savedPct: 0,              // savedKg / baselineKg
        baselineKg: 0,            // global-baseline equivalent for the same order
        perRecordKg: 0,           // emitted per record
        factorsVersion: '',       // pinned factors version, for traceability
        loading: false,
        error: '',
        // Legacy keys retained so older serialised projects keep deserialising.
        // They are no longer populated.
        estimatedCarbonSavings: 0
    },
    hasSubmitted: false
};

// TODO: MOVE CALCULATOR FUNCTIONS SOMEWHERE ELSE

/** @typedef {keyof Omit<Pricing, 'estimatedCost'>} PricingKey */

/** @type {PricingKey[]} */
const pricingKeys = /** @type {PricingKey[]} */ (Object.keys(defaultProjectState.pricing).filter((key) => key !== 'estimatedCost'));

/** Carbon estimation comes from the standalone carbon-svc Worker via /api/carbon/estimate.
 *  Debounced so we don't fire on every keystroke. AbortController cancels prior in-flight
 *  requests when the form changes again before the previous response lands. */
const CARBON_DEBOUNCE_MS = 300;
/** @type {ReturnType<typeof setTimeout> | null} */
let carbonDebounceTimer = null;
/** @type {AbortController | null} */
let carbonAbortCtrl = null;
/** Where Good Neighbor records are pressed today. Will become "north_america" once
 *  the NA plant comes online; expose this via a project-level field at that point. */
const CARBON_REGION = 'europe';

/** @returns {CarbonSavings} */
function freshCarbonSavings() {
    return {
        emittedKg: 0,
        savedKg: 0,
        savedPct: 0,
        baselineKg: 0,
        perRecordKg: 0,
        factorsVersion: '',
        loading: false,
        error: '',
        estimatedCarbonSavings: 0
    };
}

/** Mutate in place — preserves the Svelte 5 $state proxy on existing carbonSavings.
 *  @param {CarbonSavings} cs */
function resetCarbonSavings(cs) {
    cs.emittedKg = 0;
    cs.savedKg = 0;
    cs.savedPct = 0;
    cs.baselineKg = 0;
    cs.perRecordKg = 0;
    cs.factorsVersion = '';
    cs.loading = false;
    cs.error = '';
}

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
            // Older projects loaded from IDB may lack the carbonSavings fields
            // we added when integrating carbon-svc. Backfill them so the UI
            // doesn't read undefined and so subsequent mutations are reactive.
            if (newState && (!newState.carbonSavings || typeof newState.carbonSavings.savedKg !== 'number')) {
                newState.carbonSavings = freshCarbonSavings();
            }
            project = newState;
        },
        /**
         * @param {{name?: string, details: Details, textures: Texture[]}} props
         * @returns {Project}
         */
        create({ name, details, textures }) {
            const id = generateUUID();
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
            project.carbonSavings = freshCarbonSavings();

            return {
                id: project.id,
                mondayId: project.mondayId,
                version: project.version,
                name: project.name,
                details: project.details,
                textures: project.textures,
                createdAt: project.createdAt,
                pricing: project.pricing,
                carbonSavings: project.carbonSavings, // Include in returned object
                hasSubmitted: project.hasSubmitted
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
            console.log('[carbon-debug] updateDetails called');
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
            const pricingObjects = pricingKeys.reduce((/** @type {Record<string, string>} */ acc, key) => {
                if (details && details[key] && typeof details[key].value !== 'undefined') {
                    acc[key] = toSnakeCase(String(details[key].value));
                } else {
                    acc[key] = '';
                    // console.warn(`Missing value for pricing key: ${key}`);
                }
                return acc;
            }, {});

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
                    console.warn(`Calculated NaN for pricing key: ${String(pricingKey)}. Setting to 0.`);
                    itemCost = 0;
                }

                project.pricing[pricingKey] = itemCost;
                estimatedCost += itemCost;
            });

            project.pricing.estimatedCost = estimatedCost;
        },
        /** @param {Details} details */
        updateCarbonSavings(details) {
            console.log('[carbon-debug] updateCarbonSavings entered');
            if (!details) {
                console.log('[carbon-debug] no details — reset and bail');
                resetCarbonSavings(project.carbonSavings);
                return;
            }

            const inputs = mapDetailsToCarbonInputs(details, { region: CARBON_REGION });
            console.log('[carbon-debug] mapped inputs', inputs);
            if (!shouldEstimate(inputs, details)) {
                console.log('[carbon-debug] shouldEstimate=false — reset and bail');
                resetCarbonSavings(project.carbonSavings);
                return;
            }

            if (carbonDebounceTimer) clearTimeout(carbonDebounceTimer);
            console.log('[carbon-debug] scheduling fetch in', CARBON_DEBOUNCE_MS, 'ms');
            carbonDebounceTimer = setTimeout(async () => {
                console.log('[carbon-debug] debounce fired — about to fetch');
                if (carbonAbortCtrl) carbonAbortCtrl.abort();
                carbonAbortCtrl = new AbortController();
                project.carbonSavings.loading = true;
                project.carbonSavings.error = '';
                try {
                    const res = await fetch('/api/carbon/estimate', {
                        method: 'POST',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify(inputs),
                        signal: carbonAbortCtrl.signal
                    });
                    console.log('[carbon-debug] fetch returned', res.status);
                    if (!res.ok) {
                        const text = await res.text().catch(() => '');
                        throw new Error(`carbon estimate failed: ${res.status} ${text}`);
                    }
                    const data = await res.json();
                    console.log('[carbon-debug] response data', data);
                    project.carbonSavings.emittedKg = data.total_kg ?? 0;
                    project.carbonSavings.savedKg = data.saved_total_kg ?? 0;
                    project.carbonSavings.savedPct = data.saved_pct ?? 0;
                    project.carbonSavings.baselineKg = data.baseline_total_kg ?? 0;
                    project.carbonSavings.perRecordKg = data.per_record_kg ?? 0;
                    project.carbonSavings.factorsVersion = data.factors_version ?? '';
                    project.carbonSavings.loading = false;
                    project.carbonSavings.error = '';
                } catch (err) {
                    if (err instanceof DOMException && err.name === 'AbortError') {
                        console.log('[carbon-debug] fetch aborted');
                        return;
                    }
                    console.error('[carbon-debug] carbon estimate error', err);
                    project.carbonSavings.loading = false;
                    project.carbonSavings.error = err instanceof Error ? err.message : String(err);
                }
            }, CARBON_DEBOUNCE_MS);
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
            remoteTextureIds = remoteTexturesPaths.map((path) => path.split('/').pop()).filter((path) => path !== undefined);

            // Compare textures to remoteTextureIds
            const remoteOnlyTextures = remoteTextureIds.filter((textureId) => !textures.map((t) => t.fileHash).includes(textureId));
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
