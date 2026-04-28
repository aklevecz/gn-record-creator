<script>
    import project from '$lib/project.svelte';
    import { Tween } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import { onMount } from 'svelte';

    const savedKg = $derived(project.state.carbonSavings?.savedKg ?? 0);
    const savedPct = $derived(project.state.carbonSavings?.savedPct ?? 0);
    const loading = $derived(project.state.carbonSavings?.loading ?? false);

    const sproutScale = new Tween(0.5, { duration: 800, easing: cubicOut });
    const haloAlpha = new Tween(0.25, { duration: 800, easing: cubicOut });
    const dispersion = new Tween(0.15, { duration: 800, easing: cubicOut });

    let textColor = $state('var(--gn-paper)');
    let breezePhase = $state(0);

    $effect(() => {
        const kgLog = savedKg > 0 ? Math.log10(savedKg + 1) : 0;
        const t = Math.min(1, kgLog / Math.log10(201));

        sproutScale.target = 0.55 + t * 0.55;
        haloAlpha.target = 0.3 + t * 0.6;
        dispersion.target = 0.18 + t * 0.82;

        if (t < 0.3) textColor = 'var(--gn-paper)';
        else if (t < 0.7) textColor = 'var(--gn-sunshine)';
        else textColor = 'var(--gn-vinyl-green)';
    });

    /** @typedef {{ id:number, x:number, y:number, vx:number, vy:number, r:number, life:number, max:number, kind:'leafA'|'leafB'|'pollen', rotation:number, rotSpeed:number, sway:number, swayPhase:number, color:string }} Particle */
    /** @type {Particle[]} */
    let particles = $state([]);
    let nextId = 0;
    let raf = 0;
    let last = 0;
    let spawnAcc = 0;

    // Healthy palette: forest → mint → spring, plus a few warm accents (autumn/sun)
    const LEAF_COLORS = [
        '#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2',
        '#7eff9d', '#a8f5c5', '#b8f07d', '#d9f99d',
        '#f4d35e', '#fcd34d', '#fb923c'
    ];
    const POLLEN_COLORS = ['#fef9c3', '#ecfccb', '#f0fdf4', '#fff7d6'];

    function spawn() {
        // Spawn near the sprout so leaves look like they're coming off the plant
        const x = 32 + Math.random() * 36;
        const y = 38 + Math.random() * 38;
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;
        const speed = 1.2 + Math.random() * 3.2;
        const roll = Math.random();
        const kind = roll < 0.55 ? 'leafA' : roll < 0.88 ? 'leafB' : 'pollen';
        const isLeaf = kind !== 'pollen';
        const palette = isLeaf ? LEAF_COLORS : POLLEN_COLORS;
        const color = palette[Math.floor(Math.random() * palette.length)];
        particles.push({
            id: nextId++,
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r: isLeaf ? 2.6 + Math.random() * 2.6 : 0.5 + Math.random() * 1.0,
            life: 0,
            max: 2800 + Math.random() * 3200,
            kind,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 110,
            sway: 0.5 + Math.random() * 1.4,
            swayPhase: Math.random() * Math.PI * 2,
            color
        });
    }

    onMount(() => {
        last = performance.now();
        /** @param {number} now */
        function tick(now) {
            const dt = Math.min(64, now - last);
            last = now;
            breezePhase += dt / 1000;
            const rate = 0.05 + dispersion.current * 0.16;
            spawnAcc += dt * rate;
            while (spawnAcc >= 1) {
                if (particles.length < 55) spawn();
                spawnAcc -= 1;
            }
            for (const p of particles) {
                p.life += dt;
                const swayOffset = Math.sin((p.life / 1000) * 1.8 + p.swayPhase) * p.sway;
                p.x += (p.vx * dt) / 1000 + (swayOffset * dt) / 1000;
                p.y += (p.vy * dt) / 1000;
                p.vy -= (1.0 * dt) / 1000;
                p.vx *= 0.997;
                if (p.kind !== 'pollen') p.rotation += (p.rotSpeed * dt) / 1000;
            }
            particles = particles.filter(
                (p) => p.life < p.max && p.y > -12 && p.x > -14 && p.x < 114
            );
            raf = requestAnimationFrame(tick);
        }
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    });

    const formattedKg = $derived(formatKg(savedKg));
    const formattedPct = $derived(savedPct > 0 ? `${(savedPct * 100).toFixed(1)}%` : '0%');

    /** @param {number} kg */
    function formatKg(kg) {
        if (!kg || !Number.isFinite(kg)) return '0';
        if (kg >= 1000) return `${(kg / 1000).toFixed(2)}t`;
        if (kg >= 100) return Math.round(kg).toString();
        return kg.toFixed(1);
    }

    const sway = $derived(Math.sin(breezePhase * 0.7) * 1.6);
</script>

<div
    class="carbon"
    title="Cradle-to-gate manufacturing emissions vs. global industry baseline. Source: Music Climate Pact / Vinyl Alliance Phase 1 (2025)."
>
    <svg
        class="viz"
        xmlns="http://www.w3.org/2000/svg"
        width="88"
        height="88"
        viewBox="0 0 100 100"
    >
        <defs>
            <radialGradient id="cs-halo" cx="50%" cy="60%" r="60%">
                <stop offset="0%" stop-color="#b8f5c0" stop-opacity="0.75" />
                <stop offset="55%" stop-color="#52b788" stop-opacity="0.22" />
                <stop offset="100%" stop-color="#1b4332" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="cs-leafA-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#a8f5c5" />
                <stop offset="100%" stop-color="#2d6a4f" />
            </linearGradient>
            <linearGradient id="cs-leafB-fill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#d9f99d" />
                <stop offset="100%" stop-color="#52b788" />
            </linearGradient>
            <linearGradient id="cs-stem" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stop-color="#1b4332" />
                <stop offset="100%" stop-color="#74c69d" />
            </linearGradient>

            <!-- Almond leaf, unit-scale, centered. -->
            <path id="cs-leafA" d="M 0,-1 C 0.62,-0.62 0.62,0.62 0,1 C -0.62,0.62 -0.62,-0.62 0,-1 Z" />
            <!-- Teardrop leaf with broader base. -->
            <path id="cs-leafB" d="M 0,-1 C 0.88,-0.4 0.62,0.95 0,0.95 C -0.62,0.95 -0.88,-0.4 0,-1 Z" />
        </defs>

        <!-- soft halo -->
        <circle cx="50" cy="60" r="48" fill="url(#cs-halo)" opacity={haloAlpha.current} />

        <!-- ground hint -->
        <ellipse cx="50" cy="90" rx="24" ry="2.6" fill="#1b4332" opacity="0.22" />

        <!-- sprout: scales from base, sways gently in breeze -->
        <g
            transform="translate(50 90) scale({sproutScale.current}) rotate({sway}) translate(-50 -90)"
        >
            <!-- stem -->
            <path
                d="M 50,90 Q 47,72 50,54 Q 53,42 50,28"
                stroke="url(#cs-stem)"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
            />
            <!-- left leaf with vein -->
            <g transform="translate(38 64) rotate(-58)">
                <use href="#cs-leafB" transform="scale(8.5)" fill="url(#cs-leafA-fill)" />
                <line
                    x1="0"
                    y1="-7.6"
                    x2="0"
                    y2="7.6"
                    stroke="rgba(0,0,0,0.18)"
                    stroke-width="0.45"
                    stroke-linecap="round"
                />
            </g>
            <!-- right leaf with vein -->
            <g transform="translate(62 50) rotate(58)">
                <use href="#cs-leafB" transform="scale(7.5)" fill="url(#cs-leafB-fill)" />
                <line
                    x1="0"
                    y1="-6.6"
                    x2="0"
                    y2="6.6"
                    stroke="rgba(0,0,0,0.15)"
                    stroke-width="0.4"
                    stroke-linecap="round"
                />
            </g>
            <!-- top bud -->
            <g transform="translate(50 26)">
                <use href="#cs-leafA" transform="scale(4.5)" fill="url(#cs-leafB-fill)" />
            </g>
            <!-- sun-glint accent on bud -->
            <circle cx="48.5" cy="24" r="1.1" fill="#fef9c3" opacity="0.95" />
        </g>

        <!-- drifting leaves and pollen -->
        {#each particles as p (p.id)}
            {@const fade = 1 - p.life / p.max}
            {#if p.kind === 'pollen'}
                <circle
                    cx={p.x}
                    cy={p.y}
                    r={p.r * (0.6 + fade * 0.4)}
                    fill={p.color}
                    opacity={fade * 0.9}
                />
            {:else}
                <use
                    href={p.kind === 'leafA' ? '#cs-leafA' : '#cs-leafB'}
                    transform="translate({p.x} {p.y}) rotate({p.rotation}) scale({p.r *
                        (0.55 + fade * 0.45)})"
                    fill={p.color}
                    opacity={fade * 0.88}
                />
            {/if}
        {/each}
    </svg>

    <div class="text">
        <span class="label">CO₂ Saved {#if loading}<span class="loading">…</span>{/if}</span>
        <span class="value" style="color: {textColor}">{formattedKg} kg</span>
        <span class="sub">{formattedPct} below industry avg</span>
    </div>
</div>

<style>
    .carbon {
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: var(--gn-font-sans);
        line-height: 1.1;
    }
    .viz {
        flex-shrink: 0;
    }
    .text {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--gn-fg-on-ink-2);
    }
    .loading {
        margin-left: 4px;
        opacity: 0.6;
    }
    .value {
        font-family: var(--gn-font-display);
        font-size: 26px;
        font-weight: 700;
        letter-spacing: -0.02em;
        line-height: 1;
        transition: color var(--gn-dur-2) var(--gn-ease);
    }
    .sub {
        font-size: 11px;
        color: var(--gn-fg-on-ink-2);
        letter-spacing: -0.01em;
    }
    @media (max-width: 540px) {
        .viz {
            width: 64px;
            height: 64px;
        }
        .value {
            font-size: 20px;
        }
        .label,
        .sub {
            font-size: 9px;
        }
    }
</style>
