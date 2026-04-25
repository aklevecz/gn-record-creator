import { CARBON_SVC_URL, CARBON_SVC_API_KEY } from '$env/static/private';
import { error, json } from '@sveltejs/kit';

/**
 * Proxy to the standalone carbon-svc Cloudflare Worker.
 *
 * Performs ONE upstream call to /compare with two scenarios:
 *   a = "global industry baseline" (virgin PVC, grid electricity, natural gas, global avg)
 *   b = customer's actual configuration
 *
 * This gives an apples-to-apples comparison at the same record weight, so a
 * 180g order isn't unfairly compared to the worker's 140g baseline.
 *
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request, fetch: svelteFetch }) {
    /** @type {import('$lib/carbon/mapDetailsToInputs').CarbonInputs} */
    const customer = await request.json();
    console.log('[carbon-debug:server] received customer inputs', customer);
    console.log('[carbon-debug:server] CARBON_SVC_URL =', CARBON_SVC_URL, 'API key set?', !!CARBON_SVC_API_KEY);

    const baseline = {
        ...customer,
        region: 'global',
        material: customer.material === 'PET' ? 'PET' : 'PVC',
        recycled_pct: 0,
        electricity_source: 'grid',
        heat_source: customer.process === 'injection_moulded' ? 'none' : 'natural_gas'
    };

    let upstream;
    try {
        upstream = await svelteFetch(`${CARBON_SVC_URL}/compare`, {
            method: 'POST',
            headers: {
                authorization: `Bearer ${CARBON_SVC_API_KEY}`,
                'content-type': 'application/json',
                'x-internal-service': 'gn-record-creator'
            },
            body: JSON.stringify({ a: baseline, b: customer })
        });
    } catch (err) {
        console.error('[carbon-debug:server] carbon-svc unreachable', err);
        return error(502, 'carbon service unreachable');
    }

    console.log('[carbon-debug:server] upstream status', upstream.status);
    if (!upstream.ok) {
        const text = await upstream.text();
        console.error('[carbon-debug:server] carbon-svc error', upstream.status, text);
        return error(502, 'carbon service error');
    }

    const data = /** @type {{ a: any, b: any, delta: any }} */ (await upstream.json());

    const baselinePerRecord = data.a.per_record_kg;
    const emittedPerRecord = data.b.per_record_kg;
    const savedPerRecord = baselinePerRecord - emittedPerRecord;
    const savedPct = baselinePerRecord > 0 ? savedPerRecord / baselinePerRecord : 0;

    return json({
        quantity: customer.quantity,
        per_record_kg: round(emittedPerRecord, 4),
        total_kg: round(emittedPerRecord * customer.quantity, 2),
        baseline_per_record_kg: round(baselinePerRecord, 4),
        baseline_total_kg: round(baselinePerRecord * customer.quantity, 2),
        saved_per_record_kg: round(savedPerRecord, 4),
        saved_total_kg: round(savedPerRecord * customer.quantity, 2),
        saved_pct: round(savedPct, 4),
        breakdown_kg: data.b.breakdown_kg,
        factors_version: data.b.factors_version,
        boundary: data.b.boundary
    });
}

/** @param {number} n  @param {number} [dp] */
function round(n, dp = 4) {
    return Math.round(n * 10 ** dp) / 10 ** dp;
}
