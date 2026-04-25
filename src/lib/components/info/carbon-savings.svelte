<script>
    import project from '$lib/project.svelte';
    import { Tween } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import { onMount } from 'svelte';

    const savedKg = $derived(project.state.carbonSavings?.savedKg ?? 0);
    const savedPct = $derived(project.state.carbonSavings?.savedPct ?? 0);
    const loading = $derived(project.state.carbonSavings?.loading ?? false);

    const cloudScale = new Tween(1, { duration: 600, easing: cubicOut });
    const cloudAlpha = new Tween(0.85, { duration: 600, easing: cubicOut });
    const haloAlpha = new Tween(0, { duration: 600, easing: cubicOut });
    const dispersion = new Tween(0, { duration: 600, easing: cubicOut });

    let textColor = $state('var(--gn-paper)');

    $effect(() => {
        // savedPct is nearly constant (Europe vs global grid factor only).
        // Drive the visual from savedKg on a log scale so it actually responds
        // to order size — the only thing users can change that moves the needle.
        // log10(201) ≈ 2.3 means ~200 kg saved = fully dispersed cloud.
        const kgLog = savedKg > 0 ? Math.log10(savedKg + 1) : 0;
        const t = Math.min(1, kgLog / Math.log10(201));

        cloudScale.target = 1 - t * 0.65;
        cloudAlpha.target = 0.95 - t * 0.65;
        haloAlpha.target = t * 0.85;
        dispersion.target = t;

        if (t < 0.3) textColor = 'var(--gn-paper)';
        else if (t < 0.7) textColor = 'var(--gn-sunshine)';
        else textColor = 'var(--gn-vinyl-green)';
    });

    /** @typedef {{ id:number, x:number, y:number, vx:number, vy:number, r:number, life:number, max:number, type:'dot'|'leaf', rotation:number, rotSpeed:number, color:string }} Particle */
    /** @type {Particle[]} */
    let particles = $state([]);
    let nextId = 0;
    let raf = 0;
    let last = 0;
    let spawnAcc = 0;

    const LEAF_COLORS = ['#7eff9d', '#4ecb71', '#b8f07d', '#56c596', '#a8f5c5'];

    function spawn() {
        const x = 10 + Math.random() * 80;
        const y = 50 + Math.random() * 35;
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;
        const speed = 1.5 + Math.random() * 3.5;
        const isLeaf = Math.random() > 0.4;
        const color = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];
        particles.push({
            id: nextId++,
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r: isLeaf ? 3.5 + Math.random() * 2.5 : 0.5 + Math.random() * 1.0,
            life: 0,
            max: 2800 + Math.random() * 2800,
            type: isLeaf ? 'leaf' : 'dot',
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 90,
            color
        });
    }

    onMount(() => {
        last = performance.now();
        /** @param {number} now */
        function tick(now) {
            const dt = Math.min(64, now - last);
            last = now;
            const rate = dispersion.current * 0.12;
            spawnAcc += dt * rate;
            while (spawnAcc >= 1) {
                if (particles.length < 45) spawn();
                spawnAcc -= 1;
            }
            for (const p of particles) {
                p.life += dt;
                p.x += (p.vx * dt) / 1000;
                p.y += (p.vy * dt) / 1000;
                p.vy -= (1.2 * dt) / 1000;
                p.vx *= 0.998;
                if (p.type === 'leaf') p.rotation += (p.rotSpeed * dt) / 1000;
            }
            particles = particles.filter((p) => p.life < p.max && p.y > -10);
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
</script>

<div
    class="carbon"
    title="Cradle-to-gate manufacturing emissions vs. global industry baseline. Source: Music Climate Pact / Vinyl Alliance Phase 1 (2025)."
>
    <svg
        class="viz"
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 100 100"
    >
        <defs>
            <radialGradient id="cs-halo" cx="50%" cy="58%" r="55%">
                <stop offset="0%" stop-color="#7eff9d" stop-opacity="0.95" />
                <stop offset="55%" stop-color="#3c9b4b" stop-opacity="0.35" />
                <stop offset="100%" stop-color="#3c9b4b" stop-opacity="0" />
            </radialGradient>
            <radialGradient id="cs-cloud" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#ffb784" />
                <stop offset="100%" stop-color="#a83f2a" />
            </radialGradient>
            <filter id="cs-blur" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="0.8" />
            </filter>
            <!-- Unit-scale leaf (almond shape) centered at origin, scaled per particle -->
            <path id="cs-leaf" d="M 0,-1 C 0.6,-0.5 0.6,0.5 0,1 C -0.6,0.5 -0.6,-0.5 0,-1 Z" />
        </defs>

        <circle cx="50" cy="58" r="48" fill="url(#cs-halo)" opacity={haloAlpha.current} />

        <g
            transform="translate(50 58) scale({cloudScale.current}) translate(-50 -58)"
            opacity={cloudAlpha.current}
            filter="url(#cs-blur)"
        >
            <circle cx="34" cy="62" r="11" fill="url(#cs-cloud)" />
            <circle cx="46" cy="54" r="15" fill="url(#cs-cloud)" />
            <circle cx="60" cy="56" r="13" fill="url(#cs-cloud)" />
            <circle cx="66" cy="64" r="10" fill="url(#cs-cloud)" />
            <circle cx="52" cy="66" r="13" fill="url(#cs-cloud)" />
            <circle cx="40" cy="68" r="10" fill="url(#cs-cloud)" />
        </g>

        {#each particles as p (p.id)}
            {@const fade = 1 - p.life / p.max}
            {#if p.type === 'leaf'}
                <use
                    href="#cs-leaf"
                    transform="translate({p.x} {p.y}) rotate({p.rotation}) scale({p.r * (0.5 + fade * 0.5)})"
                    fill={p.color}
                    opacity={fade * 0.82}
                />
            {:else}
                <circle
                    cx={p.x}
                    cy={p.y}
                    r={p.r * (0.7 + fade * 0.3)}
                    fill={p.color}
                    opacity={fade * 0.9}
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
            width: 48px;
            height: 48px;
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
