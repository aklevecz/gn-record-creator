<script>
    import { colors } from '$lib';
    import { onDestroy, onMount } from 'svelte';

    /** @type {import('$lib/MockupScene').default | null} */
    let mockup = $state(null);
    /** @type {HTMLElement | null} */
    let stage = $state(null);

    let vinylColor = $state('cosmicBlack');
    let slide = $state(0.55);
    let gloss = $state(false);
    let autoRotate = $state(true);
    let exporting = $state(false);
    /** camera angle around the sleeve, degrees */
    let azimuth = $state(0);
    let spinSeconds = $state(8);
    /** 0–1 while a spin video is rendering, null otherwise */
    let recordProgress = $state(/** @type {number | null} */ (null));
    let recordError = $state('');

    // Polygondwanaland: King Gizzard released it free for anyone to press, artwork included
    const DEFAULT_COVER = '/covers/polygondwanaland.jpg';

    /** @type {Record<'cover' | 'back' | 'label', string>} */
    let art = $state({ cover: '', back: '', label: '' });

    /** @param {string} key */
    const prettyName = (key) => key.replace(/([A-Z])/g, ' $1').toLowerCase();

    onMount(async () => {
        const { default: MockupScene } = await import('$lib/MockupScene.js');
        if (!stage) return;
        mockup = new MockupScene(stage);
        mockup.onAutoRotateChange = (on) => (autoRotate = on);
        mockup.onAzimuthChange = (radians) => (azimuth = (radians * 180) / Math.PI);
        mockup.setAutoRotate(true);
    });

    onDestroy(() => {
        mockup?.dispose();
        for (const url of Object.values(art)) if (url) URL.revokeObjectURL(url);
    });

    $effect(() => {
        if (mockup && !art.cover) mockup.model.setCoverImage(DEFAULT_COVER);
    });
    $effect(() => {
        mockup?.model.setVinylColor(colors[vinylColor]);
    });
    $effect(() => {
        mockup?.model.setSlide(slide);
    });
    $effect(() => {
        mockup?.model.setGloss(gloss);
    });
    $effect(() => {
        mockup?.setAutoRotate(autoRotate);
    });

    /**
     * @param {'cover' | 'back' | 'label'} slot
     * @param {Event} event
     */
    function upload(slot, event) {
        const input = /** @type {HTMLInputElement} */ (event.target);
        const file = input.files?.[0];
        input.value = '';
        if (!file || !mockup) return;
        if (art[slot]) URL.revokeObjectURL(art[slot]);
        art[slot] = URL.createObjectURL(file);
        apply(slot);
    }

    /** @param {'cover' | 'back' | 'label'} slot */
    function clear(slot) {
        if (art[slot]) URL.revokeObjectURL(art[slot]);
        art[slot] = '';
        apply(slot);
    }

    /** @param {'cover' | 'back' | 'label'} slot */
    function apply(slot) {
        if (!mockup) return;
        const url = art[slot] || null;
        if (slot === 'cover') mockup.model.setCoverImage(url || DEFAULT_COVER);
        if (slot === 'back') mockup.model.setBackImage(url);
        if (slot === 'label') mockup.model.setLabelImage(url);
    }

    /**
     * @param {Blob} blob
     * @param {string} name
     * @param {string} extension
     */
    function download(blob, name, extension) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${name}-${prettyName(vinylColor).replace(/ /g, '-')}.${extension}`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }

    async function savePng() {
        if (!mockup) return;
        exporting = true;
        const blob = await mockup.exportPng();
        exporting = false;
        if (blob) download(blob, 'record-mockup', 'png');
    }

    async function recordMp4() {
        if (!mockup) return;
        recordError = '';
        recordProgress = 0;
        try {
            const blob = await mockup.recordSpin({ seconds: spinSeconds, onProgress: (p) => (recordProgress = p) });
            download(blob, 'record-spin', 'mp4');
        } catch (/** @type {any} */ error) {
            recordError = error?.message ?? 'Recording failed';
        } finally {
            recordProgress = null;
        }
    }

    /** @param {Event} event */
    function scrub(event) {
        const degrees = Number(/** @type {HTMLInputElement} */ (event.target).value);
        mockup?.scrubTo((degrees * Math.PI) / 180);
    }

    const busy = $derived(!mockup || exporting || recordProgress !== null);

    const artSlots = /** @type {const} */ ([
        ['cover', 'Front cover'],
        ['back', 'Back cover'],
        ['label', 'Center label']
    ]);
</script>

<svelte:head>
    <title>Record Mockup - Good Neighbor Record Creator</title>
</svelte:head>

<div class="mockup">
    <div class="stage" bind:this={stage}>
        {#if !mockup}<p class="loading gn-small">Pressing the record…</p>{/if}
        <p class="hint gn-label">Drag to rotate</p>

        {#if mockup}
            <div class="scrubber">
                <button class="arrow" onclick={() => mockup?.nudge(-Math.PI / 6)} aria-label="Rotate left" disabled={busy}>‹</button>
                <input type="range" min="0" max="360" step="0.5" value={azimuth} oninput={scrub} aria-label="Rotate view" disabled={busy} />
                <button class="arrow" onclick={() => mockup?.nudge(Math.PI / 6)} aria-label="Rotate right" disabled={busy}>›</button>
            </div>
        {/if}

        {#if recordProgress !== null}
            <div class="recording">
                <p class="gn-label">Recording spin · {Math.round(recordProgress * 100)}%</p>
                <div class="progress"><div style="width: {recordProgress * 100}%"></div></div>
            </div>
        {/if}
    </div>

    <aside class="panel">
        <section>
            <h2 class="gn-label">Artwork</h2>
            {#each artSlots as [slot, name]}
                <div class="art-row">
                    <label class="gn-btn--paper gn-btn--small file-btn">
                        <input type="file" accept="image/*" onchange={(e) => upload(slot, e)} />
                        {art[slot] ? 'Replace' : 'Upload'}
                    </label>
                    <span class="gn-small art-name">
                        {name}
                        {#if slot === 'cover' && !art.cover}<em>(Polygondwanaland)</em>{/if}
                    </span>
                    {#if art[slot]}<button class="gn-btn--small clear" onclick={() => clear(slot)} aria-label="Remove {name}">×</button>{/if}
                </div>
            {/each}
        </section>

        <section>
            <h2 class="gn-label">Vinyl · {prettyName(vinylColor)}</h2>
            <div class="swatches">
                {#each Object.entries(colors) as [key, hex]}
                    <button
                        class="swatch"
                        class:active={vinylColor === key}
                        style="--swatch: {hex}"
                        title={prettyName(key)}
                        aria-label={prettyName(key)}
                        onclick={() => (vinylColor = key)}
                    ></button>
                {/each}
            </div>
        </section>

        <section>
            <h2 class="gn-label">Record out of sleeve</h2>
            <input type="range" min="0" max="1" step="0.01" bind:value={slide} />
        </section>

        <section class="toggles">
            <label class="gn-small"><input type="checkbox" bind:checked={gloss} /> Gloss jacket</label>
            <label class="gn-small"><input type="checkbox" bind:checked={autoRotate} /> Turntable spin</label>
        </section>

        <section class="exports">
            <button class="gn-btn--sunshine save" onclick={savePng} disabled={busy}>
                {exporting ? 'Rendering…' : 'Save PNG'}
            </button>
            <p class="gn-small note">Transparent background, 3× screen resolution: ready for a deck.</p>

            <div class="video-row">
                <button class="gn-btn--lilac save" onclick={recordMp4} disabled={busy}>
                    {recordProgress !== null ? 'Recording…' : 'Record MP4'}
                </button>
                <select bind:value={spinSeconds} disabled={busy} aria-label="Spin length">
                    <option value={4}>4s</option>
                    <option value={8}>8s</option>
                    <option value={12}>12s</option>
                </select>
            </div>
            <p class="gn-small note">One seamless 360° loop from the current angle, 1080×1080 at 30fps.</p>
            {#if recordError}<p class="gn-small error">{recordError}</p>{/if}
        </section>
    </aside>
</div>

<style>
    .mockup {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 320px;
        height: calc(100dvh - 76px);
        min-height: 520px;
    }
    .stage {
        position: relative;
        min-height: 0;
        background: radial-gradient(ellipse at 50% 40%, #fff 0%, var(--gn-paper) 55%, var(--gn-n-200) 100%);
        overflow: hidden;
        cursor: grab;
        touch-action: none;
    }
    .stage :global(canvas) {
        position: absolute;
        inset: 0;
        display: block;
    }
    .stage:active {
        cursor: grabbing;
    }
    .loading,
    .hint {
        position: absolute;
        left: 20px;
        margin: 0;
        color: var(--gn-fg-3);
        pointer-events: none;
    }
    .loading {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    .hint {
        top: 16px;
        z-index: 1;
    }
    .scrubber {
        position: absolute;
        z-index: 1;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 10px;
        width: min(440px, calc(100% - 32px));
        padding: 6px;
        border-radius: var(--gn-r-full);
        background: rgba(255, 255, 255, 0.75);
        backdrop-filter: blur(8px);
        box-shadow: 0 1px 2px rgba(20, 20, 18, 0.12);
        cursor: default;
    }
    .arrow {
        flex: none;
        width: 32px;
        height: 32px;
        padding: 0;
        border-radius: var(--gn-r-full);
        font-size: 20px;
        line-height: 1;
    }
    .recording {
        position: absolute;
        z-index: 2;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        background: rgba(244, 244, 244, 0.85);
        backdrop-filter: blur(6px);
        cursor: progress;
    }
    .recording p {
        margin: 0;
    }
    .progress {
        width: min(280px, 70%);
        height: 6px;
        border-radius: var(--gn-r-full);
        background: var(--gn-n-300);
        overflow: hidden;
    }
    .progress div {
        height: 100%;
        background: var(--gn-ink);
    }
    .panel {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 24px;
        overflow-y: auto;
        background: var(--gn-paper-warm);
        border-left: 1px solid var(--gn-n-150);
    }
    section h2 {
        margin-bottom: 10px;
        color: var(--gn-fg-2);
    }
    .art-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 0;
    }
    .file-btn {
        display: inline-flex;
        min-width: 86px;
        justify-content: center;
        border-radius: var(--gn-r-md);
        font-weight: 700;
        cursor: pointer;
    }
    .file-btn input {
        display: none;
    }
    .art-name {
        flex: 1;
    }
    .art-name em {
        color: var(--gn-fg-3);
        font-style: normal;
    }
    .clear {
        padding: 4px 10px;
        background: transparent;
        color: var(--gn-fg-2);
        font-size: 18px;
    }
    .clear:hover:not(:disabled) {
        background: var(--gn-n-200);
    }
    .swatches {
        display: grid;
        grid-template-columns: repeat(6, 36px);
        gap: 10px;
    }
    .swatch {
        width: 36px;
        height: 36px;
        padding: 0;
        border-radius: var(--gn-r-full);
        background: var(--swatch);
        box-shadow:
            inset 0 0 0 1px rgba(0, 0, 0, 0.15),
            0 0 0 0 var(--gn-ink);
    }
    .swatch:hover:not(:disabled) {
        background: var(--swatch);
    }
    .swatch.active {
        box-shadow:
            inset 0 0 0 1px rgba(0, 0, 0, 0.15),
            0 0 0 2px var(--gn-paper-warm),
            0 0 0 4px var(--gn-ink);
    }
    input[type='range'] {
        width: 100%;
        padding: 0;
        border: 0;
        accent-color: var(--gn-ink);
        background: transparent;
    }
    input[type='range']:focus {
        box-shadow: none;
    }
    .toggles {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .toggles label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
    }
    .toggles input {
        accent-color: var(--gn-ink);
    }
    .exports {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .save {
        width: 100%;
    }
    .video-row {
        display: flex;
        gap: 8px;
        margin-top: 8px;
    }
    .video-row .save {
        flex: 1;
    }
    .video-row select {
        border-radius: var(--gn-r-md);
        padding: 0 12px;
    }
    .note {
        margin: 0;
        color: var(--gn-fg-3);
    }
    .error {
        margin: 0;
        color: var(--gn-vinyl-red);
    }

    @media (max-width: 860px) {
        .mockup {
            grid-template-columns: minmax(0, 1fr);
            grid-template-rows: 62vh auto;
            height: auto;
        }
        .panel {
            border-left: 0;
            border-top: 1px solid var(--gn-n-150);
            padding: 20px 16px;
        }
    }
</style>
