<script>
    import project from '$lib/project.svelte';
    import { Tween } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import { onMount } from 'svelte';

    const savedKg = $derived(project.state.carbonSavings?.savedKg ?? 0);

    const intensity = new Tween(0.4, { duration: 900, easing: cubicOut });

    /** @type {HTMLCanvasElement | undefined} */
    let canvas;

    /** @typedef {{ x:number, y:number, vx:number, vy:number, r:number, rotation:number, rotSpeed:number, sway:number, swayPhase:number, life:number, max:number, color:string, kind:'leafA'|'leafB'|'pollen', depth:number }} P */
    /** @type {P[]} */
    let particles = [];
    let raf = 0;
    let lastT = 0;
    let spawnAcc = 0;
    let dpr = 1;
    let w = 0;
    let h = 0;

    const LEAF_COLORS = [
        '#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2',
        '#7eff9d', '#a8f5c5', '#b8f07d', '#d9f99d',
        '#f4d35e', '#fcd34d', '#fb923c'
    ];
    const POLLEN_COLORS = ['#fef9c3', '#ecfccb', '#f0fdf4', '#fff7d6'];

    $effect(() => {
        const kgLog = savedKg > 0 ? Math.log10(savedKg + 1) : 0;
        const t = Math.min(1, kgLog / Math.log10(201));
        intensity.target = 0.45 + t * 0.5;
    });

    function resize() {
        if (!canvas) return;
        dpr = window.devicePixelRatio || 1;
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn() {
        const depth = Math.random();
        const roll = Math.random();
        const kind = roll < 0.5 ? 'leafA' : roll < 0.85 ? 'leafB' : 'pollen';
        const isLeaf = kind !== 'pollen';
        const palette = isLeaf ? LEAF_COLORS : POLLEN_COLORS;
        // From bottom edge, occasionally biased toward bottom-left where the viz lives
        const fromCorner = Math.random() < 0.35;
        const x = fromCorner
            ? Math.random() * (w * 0.4)
            : -40 + Math.random() * (w + 80);
        particles.push({
            x,
            y: h + 30 + Math.random() * 60,
            vx: (Math.random() - 0.5) * 0.4 + (fromCorner ? 0.15 : 0),
            vy: -(0.18 + depth * 0.6 + Math.random() * 0.3),
            r: isLeaf ? 5 + depth * 9 + Math.random() * 3 : 1 + Math.random() * 1.6,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.7,
            sway: 8 + Math.random() * 22,
            swayPhase: Math.random() * Math.PI * 2,
            life: 0,
            max: 14000 + Math.random() * 14000,
            color: palette[Math.floor(Math.random() * palette.length)],
            kind,
            depth
        });
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {P} p
     * @param {number} alpha
     */
    function drawLeaf(ctx, p, alpha) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(p.r, p.r);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        if (p.kind === 'leafA') {
            ctx.moveTo(0, -1);
            ctx.bezierCurveTo(0.62, -0.62, 0.62, 0.62, 0, 1);
            ctx.bezierCurveTo(-0.62, 0.62, -0.62, -0.62, 0, -1);
        } else {
            ctx.moveTo(0, -1);
            ctx.bezierCurveTo(0.88, -0.4, 0.62, 0.95, 0, 0.95);
            ctx.bezierCurveTo(-0.62, 0.95, -0.88, -0.4, 0, -1);
        }
        ctx.closePath();
        ctx.fill();
        // vein
        ctx.strokeStyle = 'rgba(0,0,0,0.18)';
        ctx.lineWidth = 0.06;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -0.85);
        ctx.lineTo(0, 0.85);
        ctx.stroke();
        ctx.restore();
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {P} p
     * @param {number} alpha
     */
    function drawPollen(ctx, p, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        // soft glow
        ctx.globalAlpha = alpha * 0.25;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    /** @param {number} now */
    function tick(now) {
        if (!canvas) {
            raf = requestAnimationFrame(tick);
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dt = lastT ? Math.min(64, now - lastT) : 16;
        lastT = now;

        const kgLog = savedKg > 0 ? Math.log10(savedKg + 1) : 0;
        const t = Math.min(1, kgLog / Math.log10(201));
        const targetCount = Math.floor(25 + t * 75);
        const spawnRate = 0.018 + t * 0.05;

        spawnAcc += dt * spawnRate;
        while (spawnAcc >= 1) {
            if (particles.length < targetCount) spawn();
            spawnAcc -= 1;
        }

        ctx.clearRect(0, 0, w, h);

        const remaining = [];
        for (const p of particles) {
            p.life += dt;
            const swayOffset = Math.sin((p.life / 1000) * 0.6 + p.swayPhase) * p.sway;
            p.x += (p.vx * dt) / 16 + (swayOffset * dt) / 1000;
            p.y += (p.vy * dt) / 16;
            if (p.kind !== 'pollen') p.rotation += (p.rotSpeed * dt) / 1000;

            const fadeIn = Math.min(1, p.life / 1800);
            const fadeOut = 1 - p.life / p.max;
            const alpha = Math.max(0, Math.min(0.55, fadeIn * fadeOut * (0.4 + p.depth * 0.5)));

            if (p.kind === 'pollen') drawPollen(ctx, p, alpha);
            else drawLeaf(ctx, p, alpha);

            if (p.life < p.max && p.y > -60 && p.x > -80 && p.x < w + 80) {
                remaining.push(p);
            }
        }
        particles = remaining;

        raf = requestAnimationFrame(tick);
    }

    onMount(() => {
        resize();
        window.addEventListener('resize', resize);
        // pre-seed so the viewport doesn't start empty
        for (let i = 0; i < 30; i++) {
            spawn();
            const p = particles[particles.length - 1];
            p.y = Math.random() * h;
            p.life = Math.random() * 4000;
        }
        raf = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
        };
    });
</script>

<div class="vignette" aria-hidden="true" style="opacity: {intensity.current}"></div>
<canvas bind:this={canvas} class="particles" aria-hidden="true"></canvas>

<style>
    .vignette {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 9999;
        background:
            radial-gradient(
                ellipse 80% 65% at 50% 42%,
                transparent 30%,
                rgba(45, 106, 79, 0.22) 70%,
                rgba(27, 67, 50, 0.55) 100%
            ),
            radial-gradient(
                circle at 8% 96%,
                rgba(126, 255, 157, 0.32) 0%,
                rgba(82, 183, 136, 0.12) 22%,
                transparent 45%
            ),
            radial-gradient(
                circle at 92% 4%,
                rgba(217, 249, 157, 0.18) 0%,
                transparent 30%
            );
        mix-blend-mode: multiply;
        transition: opacity 900ms var(--gn-ease, ease);
    }
    .particles {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 10000;
    }
    @media (prefers-reduced-motion: reduce) {
        .particles {
            display: none;
        }
    }
</style>
