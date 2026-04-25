# Record Carbon Footprint — Technical Reference

Source: *Music Climate Pact × Vinyl Alliance — Sustainable Supplier Programme, Phase 1 Insights Report* (ClimatePartner, 2025). All figures are **cradle-to-gate** kg CO₂e per finished, packaged record. Boundary excludes outbound shipping to the consumer, playback energy, and end-of-life.

The reference unit throughout is **one packaged 140 g, 12-inch record** unless noted.

---

## 1. Baseline Product Carbon Footprints (PCFs)

### 1.1 Traditionally pressed PVC (140 g, 12", 100% virgin)

| Region | kg CO₂e / record | Notes |
|---|---|---|
| Global average | **0.93** | 7-supplier mean, mixed grids |
| Europe | **0.75** | Lower-carbon grid mix |
| North America | **1.17** | Higher-carbon grid mix |

### 1.2 Injection-moulded PET (140 g, 12", 100% virgin, 100% renewable elec.)

| Variant | kg CO₂e / record |
|---|---|
| Virgin PET, 100% renewable | **0.54** |
| 100% rPET, 100% renewable | **0.38** |

### 1.3 Phase breakdown (avg global pressed PVC, 0.93 kg total)

| Life-cycle phase | kg CO₂e | % of total |
|---|---|---|
| Raw materials (record body) | 0.36 | 39.0% |
| Raw materials (stamper disc) | 0.01 | 1.2% |
| Packaging — paper sleeve | 0.02 | 2.7% |
| Packaging — cardboard outer | 0.02 | 2.6% |
| Packaging — shrink wrap | 0.01 | 0.9% |
| Inbound logistics | 0.04 | 3.8% |
| Manufacture — record pressing | 0.40 | 42.8% |
| Manufacture — stamper disc | 0.01 | 1.2% |
| Waste | 0.00 | 0.3% |
| General / overhead emissions | 0.05 | 5.6% |
| **Total** | **0.93** | **100%** |

### 1.4 Regional breakdown of pressed PVC (kg CO₂e / record)

| Phase | Global | Europe | N. America |
|---|---|---|---|
| Raw materials | 0.37 | 0.32 | 0.44 |
| Packaging | 0.06 | 0.06 | 0.05 |
| Inbound logistics | 0.04 | 0.03 | 0.04 |
| Manufacture | 0.41 | 0.30 | 0.56 |
| Waste | 0.00 | 0.00 | 0.00 |
| General | 0.05 | 0.04 | 0.06 |
| **Total** | **0.93** | **0.75** | **1.17** |

The variance between regions is driven almost entirely by **grid electricity carbon intensity at the pressing plant**.

---

## 2. Reduction Levers (deltas vs. 0.93 kg pressed-PVC baseline)

| Lever | Resulting PCF | Δ vs baseline |
|---|---|---|
| Electrify (eliminate natural gas) | 0.66 | −29% |
| Switch to 100% renewable electricity | 0.81 | −12.5% (−85% of elec emissions) |
| 50% recycled PVC blend | ~0.85 | −8.1% |
| 100% recycled PVC | ~0.78 | −16.2% |
| Bio-attributed PVC (biogenic excluded) | 0.91 | −2% |
| Switch to injection-moulded virgin PET | 0.54 | −42% |
| Switch to injection-moulded 100% rPET | 0.38 | −59% |

Stacked best-case savings reach **40–60%**.

### 2.1 Raw-material-only deltas

- **Recycled PVC vs virgin PVC**: −39% on raw-material emissions (VinyLoop LCA)
- **Recycled PET vs virgin PET**: −36% on raw-material emissions (mechanical recycling)
- **Virgin PET vs virgin PVC**: +10–11.8% on raw-material emissions (offset by lower manufacturing emissions in injection moulding)

### 2.2 Energy consumption per record (excluding galvanics)

| Process | Electricity (kWh) | Natural gas (kWh) |
|---|---|---|
| Pressed | 0.41 | 1.16 |
| Injection-moulded | 0.15 | 0 |

Injection moulding uses ~62% less electricity than pressing and requires no fossil-fuel heat.

### 2.3 Weight scaling

- Raw-material emissions scale ~linearly with record mass
- A 180 g record is ~28.6% heavier than 140 g → expect a proportional bump on the raw-materials portion (manufacture, packaging, logistics largely unchanged per unit)
- Lighter records also reduce downstream shipping emissions (outside the cradle-to-gate boundary)

---

## 3. Calculation Model

### 3.1 Inputs

```
quantity            integer   — number of records
weight_g            number    — record mass in grams (typ. 140, 180, 200)
process             enum      — "pressed" | "injection_moulded"
material            enum      — "PVC" | "PET"
recycled_pct        number    — 0–100 (% recycled feedstock)
region              enum      — "global" | "europe" | "north_america"
electricity_source  enum      — "grid" | "renewable_100"
heat_source         enum      — "natural_gas" | "electrified" | "none"   (none for IM)
packaging.sleeve    boolean
packaging.outer     boolean
packaging.shrink    boolean
```

### 3.2 Per-record formula

```
total = raw_materials
      + packaging
      + inbound_logistics
      + manufacture
      + waste
      + general

raw_materials = base_raw[material]
              × (weight_g / 140)
              × (1 − recycled_pct/100 × recycled_reduction[material])

manufacture   = base_manufacture[process][region]
              × electricity_multiplier
              × heat_multiplier

packaging     = (sleeve ? 0.02 : 0)
              + (outer  ? 0.02 : 0)
              + (shrink ? 0.01 : 0)

inbound_logistics = 0.04   // override with supplier-specific data when available
waste             = 0.003
general           = 0.05
```

Where:

```
base_raw = { PVC: 0.36, PET: 0.42 }                 // kg CO₂e at 140 g
recycled_reduction = { PVC: 0.39, PET: 0.36 }       // fraction reduced when 100% recycled

base_manufacture = {
  pressed:           { global: 0.41, europe: 0.30, north_america: 0.56 },
  injection_moulded: { global: 0.02, europe: 0.02, north_america: 0.02 } // ~flat, low
}

electricity_multiplier = electricity_source === "renewable_100" ? 0.15 : 1.0
                          // ~85% reduction on the electricity portion of manufacture

heat_multiplier        = heat_source === "natural_gas"  ? 1.0
                       : heat_source === "electrified"  ? 0.30
                       : /* none */                       0.05
```

> The multipliers above are derived from the report's stated reductions (−29% from electrification, −12.5% from renewables) backed out against the 0.93 baseline. They are coarse — refine with supplier-specific data when ingested.

### 3.3 Aggregate

```
total_emissions_kg = per_record_total × quantity
```

### 3.4 Savings vs. baseline

```
baseline_per_record = baseline_pcf[region]            // 0.93 / 0.75 / 1.17
savings_per_record  = baseline_per_record − per_record_total
savings_total_kg    = savings_per_record × quantity
savings_pct         = savings_per_record / baseline_per_record
```

### 3.5 Worked example

`1000 × 140g pressed PVC, Europe, 50% recycled, 100% renewable, electrified, full packaging`:

```
raw_materials = 0.36 × 1.0 × (1 − 0.5 × 0.39)         = 0.290
manufacture   = 0.30 × 0.15 × 0.30                    = 0.0135
packaging     = 0.02 + 0.02 + 0.01                    = 0.05
inbound_logistics                                     = 0.04
waste                                                 = 0.003
general                                               = 0.05
per_record_total                                      ≈ 0.447 kg CO₂e

vs Europe baseline 0.75 → savings ≈ 0.30 kg/record (~40%)
1000 records → 447 kg emitted, 303 kg saved
```

---

## 4. Reference Data (machine-readable)

```json
{
  "version": "2025-phase1",
  "unit": "kg_co2e_per_record_140g_12in",
  "boundary": "cradle_to_gate",
  "baselines": {
    "pressed_pvc": { "global": 0.93, "europe": 0.75, "north_america": 1.17 },
    "injection_moulded_pet_renewable": 0.54,
    "injection_moulded_rpet_renewable": 0.38
  },
  "phases_avg_pressed_pvc": {
    "raw_materials_record": 0.36,
    "raw_materials_stamper": 0.01,
    "packaging_sleeve": 0.02,
    "packaging_outer": 0.02,
    "packaging_shrink": 0.01,
    "inbound_logistics": 0.04,
    "manufacture_pressing": 0.40,
    "manufacture_stamper": 0.01,
    "waste": 0.003,
    "general": 0.05
  },
  "raw_material_factors": {
    "virgin_pvc_140g": 0.36,
    "virgin_pet_140g": 0.42,
    "recycled_reduction_pvc": 0.39,
    "recycled_reduction_pet": 0.36,
    "pet_vs_pvc_uplift": 0.118
  },
  "energy_per_record": {
    "pressed":           { "electricity_kwh": 0.41, "natural_gas_kwh": 1.16 },
    "injection_moulded": { "electricity_kwh": 0.15, "natural_gas_kwh": 0 }
  },
  "lever_deltas_vs_baseline": {
    "electrify_no_gas": -0.29,
    "renewable_100": -0.125,
    "blend_50_recycled": -0.081,
    "recycled_100": -0.162,
    "bio_attributed_pvc": -0.02,
    "switch_to_im_virgin_pet": -0.42,
    "switch_to_im_rpet": -0.59
  },
  "weight_scaling": "raw_materials portion scales linearly with weight_g / 140"
}
```

---

## 5. Cloudflare Worker — standalone service

This is a **standalone Worker** — its own repo, its own `wrangler.jsonc`, its own D1, deployable independently. It's a shared backend that the record-creator app, the Monday integrations, and any future tools (quote PDFs, label dashboards, agents) can call.

Working name: **`carbon-svc`** (rename freely).

### 5.1 Consumption patterns

Two ways consumers reach it:

1. **HTTP + bearer token** — for browser apps, external tools, anything outside the Cloudflare account. Public endpoint, e.g. `https://carbon-svc.<account>.workers.dev`.
2. **Service binding** — for sibling Cloudflare Workers/Pages projects in the same account. Zero-latency, no public hop, no token needed. The consumer adds:
   ```jsonc
   "services": [{ "binding": "CARBON", "service": "carbon-svc" }]
   ```
   then calls `env.CARBON.fetch(new Request("https://carbon/estimate", ...))`.

Design every endpoint to work identically over both transports.

### 5.2 Endpoints

```
GET  /healthz                            liveness
GET  /factors                            current factors doc (§4)
GET  /factors/:version                   pinned historical factors
POST /estimate                           pure calculation
     body: CalcInputs (§3.1)
     resp: { per_record, total, breakdown, savings, baseline, factors_version }
POST /compare                            two scenarios in one call
     body: { a: CalcInputs, b: CalcInputs }
     resp: { a: EstimateResult, b: EstimateResult, delta }
POST /quote                              persists an estimate
     body: { external_ref?: string, inputs: CalcInputs }
     resp: { id, ...EstimateResult }
GET  /quote/:id                          recall + (optionally) recompute at latest factors
```

`/estimate` and `/compare` are pure — no DB writes, safe to call from anywhere. `/quote` is the persistence layer.

### 5.3 Auth

- HTTP: `Authorization: Bearer <key>` checked against `env.API_KEYS` (a comma-separated secret, or a D1 `api_keys` table once we have >1 consumer).
- Service binding: trusted by default — Cloudflare guarantees the caller is in the same account. Skip the bearer check on service-binding requests (detect via `request.cf?.hostMetadata` or just by not exposing the binding path publicly).
- CORS: allowlist origins per consumer; default closed.

### 5.4 D1 schema

The Worker owns its own database, named e.g. `carbon-svc-db`.

```sql
CREATE TABLE carbon_factors (
  version       TEXT PRIMARY KEY,
  source        TEXT NOT NULL,
  published_at  TEXT NOT NULL,
  payload_json  TEXT NOT NULL              -- the §4 JSON
);

CREATE TABLE carbon_estimates (
  id              TEXT PRIMARY KEY,        -- uuid
  external_ref    TEXT,                    -- e.g. monday deal id, order id
  inputs_json     TEXT NOT NULL,
  result_json     TEXT NOT NULL,
  factors_version TEXT NOT NULL,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (factors_version) REFERENCES carbon_factors(version)
);

CREATE INDEX idx_estimates_external_ref ON carbon_estimates(external_ref);
```

Pinning every row to a `factors_version` keeps quotes reproducible when ClimatePartner publishes Phase 2.

### 5.5 R2 usage

Optional bucket for source-of-truth provenance (the actual PDFs that the factors derive from):

- `R2://carbon-svc/reports/sustainable_supplier_phase1.pdf`
- `R2://carbon-svc/reports/suppliers/<name>-<date>.pdf`

Useful when an agent needs to cite where a number came from.

### 5.6 Stack

- **TypeScript** end-to-end.
- **Hono** as the router (`hono/cloudflare-workers`). Small, type-safe, great DX on Workers.
- **Zod** for request validation — share the inferred types between the calc engine and the HTTP layer.
- **Vitest** + `@cloudflare/vitest-pool-workers` for tests that run in a real Workers runtime (D1 bindings work in tests).

### 5.7 Repo layout

```
carbon-svc/
  wrangler.jsonc
  package.json
  tsconfig.json
  worker-configuration.d.ts   // generated: wrangler types
  src/
    index.ts                  // Hono app + route mounting
    bindings.ts               // type for Env (D1, R2, secrets, service bindings)
    middleware/
      auth.ts                 // bearer + service-binding gate
      cors.ts
    routes/
      estimate.ts
      compare.ts
      factors.ts
      quote.ts
      health.ts
    lib/
      calculate.ts            // pure: (inputs, factors) -> result
      schema.ts               // zod schemas → inferred CalcInputs / EstimateResult
      factors-loader.ts       // loads from D1 with in-memory cache
      defaults.ts
  migrations/
    0001_init.sql
    0002_seed_factors_2025_phase1.sql
  test/
    calculate.test.ts         // golden cases incl. the §3.5 worked example
    routes.test.ts            // HTTP-level happy paths
```

`lib/calculate.ts` stays framework-agnostic — pure function over typed inputs, no Hono/D1/HTTP imports — so it can be imported by an agent tool, a CLI, or another Worker.

### 5.8 Type sharing with consumers

Export the public types from a tiny entry so other apps can install/depend on them:

```ts
// src/types.ts (re-exported from package.json "exports")
export type { CalcInputs, EstimateResult, FactorsDoc, CompareResult } from "./lib/schema";
```

Consumers either:
- Import the types directly if they're in the same monorepo / npm workspace.
- Or rely on the OpenAPI/JSON schema we can generate from the Zod schemas (`zod-to-openapi`) for non-TS callers.

### 5.7 Versioning

- API: prefix routes with `/v1/` once a second consumer ships. Until then, single unversioned surface is fine — but keep responses additive only.
- Factors: `version` strings like `2025-phase1`, `2026-phase2`. Default to latest; allow `?factors=<version>` on `/estimate` for back-testing.

### 5.9 Local dev

```
wrangler dev                 # local Worker
wrangler d1 execute carbon-svc-db --local --file migrations/0001_init.sql
```

Consumer apps point at `http://localhost:8787` via env var until the Worker is deployed.

---

## 6. Roadmap to an agent

The worker exposes the calculator as a typed tool. An LLM (Claude via the Anthropic SDK on Workers) gets these tools:

```
tools:
  carbon_estimate(inputs: CalcInputs) -> EstimateResult
  carbon_factors() -> FactorsDoc
  carbon_lookup_deal(deal_id) -> CalcInputs
  carbon_compare(scenario_a: CalcInputs, scenario_b: CalcInputs) -> Diff
```

Use cases:
- "What's the carbon for the Springfield order?" → `lookup_deal` → `estimate`
- "What if we switched them to rPET injection moulded?" → `compare`
- "Generate the line for our quote PDF" → `estimate` then format

Keep the calculator deterministic; let the agent only orchestrate. Never let the LLM do arithmetic — it always calls the tool.

---

## 7. Known gaps & limitations

- **Cradle-to-gate only.** No outbound shipping, playback, or EOL emissions.
- **Print finishing on sleeves** is excluded from the source PCFs — add when supplier data is available.
- **rPVC factor** (−39%) comes from one secondary source (VinyLoop LCA), not primary supplier data.
- **Injection-moulded baseline** assumes 100% renewable electricity (both participating suppliers used it). Grid-mix IM would be higher.
- **Plant size** showed no statistically significant correlation with emissions in Phase 1 — do not use scale as a proxy.
- **General / overhead emissions (5.6%)** are CCF-derived allocations; they vary per supplier and are not record-specific.
- Factors will be re-baselined in Phase 2; pin every estimate to a `factors_version` so historical quotes don't silently shift.
