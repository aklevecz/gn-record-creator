/**
 * Map the order-form `details` object to the CalcInputs shape that
 * carbon-svc expects. Pure function — no side effects, easy to unit-test.
 */

const DEFAULT_REGION = 'europe';
const DEFAULT_MIN_ORDER = 500; // Good Neighbor's stated minimum, used when total_units is blank

/**
 * @typedef {object} CarbonInputs
 * @property {number} quantity
 * @property {number} weight_g
 * @property {'pressed'|'injection_moulded'} process
 * @property {'PVC'|'PET'} material
 * @property {number} recycled_pct
 * @property {'global'|'europe'|'north_america'} region
 * @property {'grid'|'renewable_100'} electricity_source
 * @property {'natural_gas'|'electrified'|'none'} heat_source
 * @property {{ sleeve: boolean, outer: boolean, shrink: boolean }} packaging
 * @property {boolean} usingDefaults whether quantity/weight came from form fields or defaults
 */

/**
 * @param {*} details
 * @param {{ region?: 'europe'|'north_america'|'global' }} [opts]
 * @returns {CarbonInputs}
 */
export function mapDetailsToCarbonInputs(details, opts = {}) {
    const region = opts.region ?? DEFAULT_REGION;

    const rawTotalUnits = parseInt(String(details?.total_units?.value ?? '')) || 0;
    const totalUnits = rawTotalUnits > 0 ? rawTotalUnits : DEFAULT_MIN_ORDER;
    const setMultiplier = parseSetSize(details?.records_per_set?.value);
    const quantity = totalUnits * setMultiplier;

    const weight_g = parseWeight(details?.record_format?.value);

    const usingDefaults = rawTotalUnits === 0;

    return {
        quantity: Math.max(quantity, 1),
        weight_g,
        process: 'pressed',
        material: 'PET',
        recycled_pct: 0,
        region,
        electricity_source: 'grid',
        heat_source: 'natural_gas',
        packaging: {
            sleeve: hasInnerSleeve(details?.packaging_sleeve?.value),
            outer: hasOuterJacket(details?.packaging?.value),
            shrink: true
        },
        usingDefaults
    };
}

/**
 * Always returns true now — we always have at least defaults. Kept as a
 * function so we can re-introduce gating later (e.g. only after first user
 * interaction) without touching callers.
 */
export function shouldEstimate() {
    return true;
}

/** @param {*} value e.g. "1LP", "2LP", "3LP", "Not sure" */
function parseSetSize(value) {
    if (!value || typeof value !== 'string') return 1;
    const m = value.match(/^(\d+)/);
    if (!m) return 1;
    const n = parseInt(m[1], 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
}

/** @param {*} value e.g. "33 12in/180g", "45 12in/180g" */
function parseWeight(value) {
    if (!value || typeof value !== 'string') return 140;
    const m = value.match(/(\d+)\s*g/i);
    if (!m) return 140;
    const n = parseInt(m[1], 10);
    return Number.isFinite(n) && n > 0 ? n : 140;
}

/** @param {*} value */
function hasInnerSleeve(value) {
    if (!value || value === 'Not sure') return true;
    return true;
}

/** @param {*} value */
function hasOuterJacket(value) {
    if (!value || value === 'Not sure') return true;
    return true;
}
