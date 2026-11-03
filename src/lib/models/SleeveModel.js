import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Scene units match RecordModel: a 12" record has a radius of 8.9.
const RECORD_RADIUS = 8.9;
const RECORD_THICKNESS = 0.15;
const LABEL_RADIUS = RECORD_RADIUS * (2 / 6); // 4" label on a 12" record
const SPINDLE_RADIUS = 0.1;
// 12.375" jacket, ~3mm board (slightly exaggerated so the edge reads on screen)
export const JACKET_SIZE = RECORD_RADIUS * 2 * (12.375 / 12);
const JACKET_THICKNESS = 0.32;
const JACKET_WALL = 0.05;
const PAPER = '#f4f1ea';

/**
 * Draws an image center-cropped into a square canvas.
 * @param {CanvasImageSource & { width: number, height: number }} image
 * @param {number} size
 */
function squareCanvas(image, size) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
    const side = Math.min(image.width, image.height);
    ctx.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, size, size);
    return canvas;
}

/** @param {string} url */
function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

/**
 * Bakes the groove detail into two textures:
 * - surface: R = bump height, G = roughness
 * - aniso: RG = groove direction (tangent to the circle), B = strength
 * The circular anisotropy is what gives vinyl its signature bow-tie highlight.
 */
function createGrooveTextures() {
    const size = 2048;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
    const surface = ctx.createImageData(size, size);

    const anisoSize = 512;
    const anisoCanvas = document.createElement('canvas');
    anisoCanvas.width = anisoCanvas.height = anisoSize;
    const anisoCtx = /** @type {CanvasRenderingContext2D} */ (anisoCanvas.getContext('2d'));
    const aniso = anisoCtx.createImageData(anisoSize, anisoSize);

    const grooveStart = 0.36;
    const grooveEnd = 0.955;
    const trackGaps = [0.47, 0.6, 0.71, 0.8, 0.88];
    // Per-radius "loudness" so the grooves have bands like real music
    const bands = Array.from({ length: 64 }, () => 0.55 + Math.random() * 0.45);

    /** @param {number} r */
    const inGrooves = (r) => r > grooveStart && r < grooveEnd && !trackGaps.some((g) => Math.abs(r - g) < 0.0045);

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dx = ((x + 0.5) / size) * 2 - 1;
            const dy = 1 - ((y + 0.5) / size) * 2;
            const r = Math.hypot(dx, dy);
            const i = (y * size + x) * 4;
            let height = 128;
            let roughness = 70;
            if (inGrooves(r)) {
                const band = bands[Math.floor(((r - grooveStart) / (grooveEnd - grooveStart)) * bands.length)];
                height = 128 + 70 * band * Math.sin(r * size * 1.9);
                roughness = 120 + 60 * band;
            } else if (r > 0.33 && r <= grooveStart) {
                // run-out: a few wide spiral loops
                height = 128 + 30 * Math.sin(r * 900);
            }
            surface.data[i] = height;
            surface.data[i + 1] = roughness;
            surface.data[i + 2] = 0;
            surface.data[i + 3] = 255;
        }
    }
    ctx.putImageData(surface, 0, 0);

    for (let y = 0; y < anisoSize; y++) {
        for (let x = 0; x < anisoSize; x++) {
            const dx = ((x + 0.5) / anisoSize) * 2 - 1;
            const dy = 1 - ((y + 0.5) / anisoSize) * 2;
            const r = Math.hypot(dx, dy) || 1;
            const i = (y * anisoSize + x) * 4;
            aniso.data[i] = (-dy / r) * 127.5 + 127.5;
            aniso.data[i + 1] = (dx / r) * 127.5 + 127.5;
            aniso.data[i + 2] = inGrooves(r) ? 255 : 60;
            aniso.data[i + 3] = 255;
        }
    }
    anisoCtx.putImageData(aniso, 0, 0);

    const surfaceTexture = new THREE.CanvasTexture(canvas);
    surfaceTexture.colorSpace = THREE.NoColorSpace;
    const anisoTexture = new THREE.CanvasTexture(anisoCanvas);
    anisoTexture.colorSpace = THREE.NoColorSpace;
    return { surfaceTexture, anisoTexture };
}

/**
 * A record jacket with a vinyl that slides out of its open edge.
 * Local space: the jacket stands upright on y = 0, front faces +z,
 * and the opening is on the +x edge.
 */
export class SleeveModel {
    /**
     * @param {THREE.Scene} scene
     * @param {number} [maxAnisotropy] - texture filtering, from renderer.capabilities
     */
    constructor(scene, maxAnisotropy = 8) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.maxAnisotropy = maxAnisotropy;

        /** 0 = fully in the sleeve, 1 = fully out */
        this.slide = 0.55;
        this.slideTarget = 0.55;

        this.jacket = this.createJacket();
        this.record = this.createRecord();
        this.group.add(this.jacket, this.record);
        this.scene.add(this.group);

        this.setLabelImage(null);
        this.updateSlide(true);
    }

    createJacket() {
        const jacket = new THREE.Group();

        this.coverMaterial = new THREE.MeshStandardMaterial({ color: PAPER, roughness: 0.55 });
        this.backMaterial = new THREE.MeshStandardMaterial({ color: PAPER, roughness: 0.55 });
        this.edgeMaterial = new THREE.MeshStandardMaterial({ color: '#e9e4da', roughness: 0.85 });

        const geometry = new RoundedBoxGeometry(JACKET_SIZE, JACKET_SIZE, JACKET_THICKNESS, 4, 0.06);
        // BoxGeometry group order: +x, -x, +y, -y, +z, -z
        const body = new THREE.Mesh(geometry, [
            this.edgeMaterial,
            this.edgeMaterial,
            this.edgeMaterial,
            this.edgeMaterial,
            this.coverMaterial,
            this.backMaterial
        ]);
        body.castShadow = true;
        body.receiveShadow = true;
        jacket.add(body);

        // The open edge: a dark slot the record slides through
        const slot = new THREE.Mesh(
            new THREE.PlaneGeometry(JACKET_THICKNESS - JACKET_WALL * 2, JACKET_SIZE - 0.3),
            new THREE.MeshStandardMaterial({ color: '#141412', roughness: 1 })
        );
        slot.rotation.y = Math.PI / 2;
        slot.position.x = JACKET_SIZE / 2 + 0.002;
        jacket.add(slot);

        jacket.position.y = JACKET_SIZE / 2;
        return jacket;
    }

    createRecord() {
        const record = new THREE.Group();
        const { surfaceTexture, anisoTexture } = createGrooveTextures();
        surfaceTexture.anisotropy = this.maxAnisotropy;

        this.vinylMaterial = new THREE.MeshPhysicalMaterial({
            color: '#030303',
            roughness: 0.32,
            metalness: 0,
            clearcoat: 0.7,
            clearcoatRoughness: 0.12,
            bumpMap: surfaceTexture,
            bumpScale: 0.6,
            roughnessMap: surfaceTexture,
            anisotropy: 0.85,
            anisotropyMap: anisoTexture
        });
        this.vinylEdgeMaterial = new THREE.MeshPhysicalMaterial({
            color: '#030303',
            roughness: 0.35,
            clearcoat: 0.5
        });

        // CylinderGeometry groups: side, top cap, bottom cap
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(RECORD_RADIUS, RECORD_RADIUS, RECORD_THICKNESS, 192), [
            this.vinylEdgeMaterial,
            this.vinylMaterial,
            this.vinylMaterial
        ]);
        disc.rotation.x = Math.PI / 2;
        disc.castShadow = true;
        disc.receiveShadow = true;
        record.add(disc);

        this.labelMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.7 });
        const label = new THREE.Mesh(
            new THREE.CylinderGeometry(LABEL_RADIUS, LABEL_RADIUS, RECORD_THICKNESS + 0.004, 96),
            [this.vinylEdgeMaterial, this.labelMaterial, this.labelMaterial]
        );
        label.rotation.x = Math.PI / 2;
        record.add(label);

        record.position.y = JACKET_SIZE / 2;
        return record;
    }

    /** @param {number} value - 0 (in) to 1 (out) */
    setSlide(value) {
        this.slideTarget = THREE.MathUtils.clamp(value, 0, 1);
    }

    /** Eases the record toward its target. Call every frame. */
    updateSlide(snap = false) {
        this.slide = snap ? this.slideTarget : THREE.MathUtils.lerp(this.slide, this.slideTarget, 0.12);
        this.record.position.x = this.slide * (JACKET_SIZE / 2 + RECORD_RADIUS);
    }

    /** The x center of the jacket + exposed record, for framing the camera */
    get centerX() {
        return this.record.position.x / 2;
    }

    /** @param {string} color */
    setVinylColor(color) {
        this.vinylMaterial.color.set(color);
        this.vinylEdgeMaterial.color.set(color);
    }

    /** @param {boolean} gloss */
    setGloss(gloss) {
        this.coverMaterial.roughness = gloss ? 0.18 : 0.55;
        this.backMaterial.roughness = gloss ? 0.18 : 0.55;
    }

    /**
     * @param {THREE.MeshStandardMaterial} material
     * @param {string | null} url
     */
    async setJacketImage(material, url) {
        if (material.map) material.map.dispose();
        if (!url) {
            material.map = null;
            material.color.set(PAPER);
        } else {
            const texture = new THREE.CanvasTexture(squareCanvas(await loadImage(url), 2048));
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = this.maxAnisotropy;
            material.map = texture;
            material.color.set('#ffffff');
        }
        material.needsUpdate = true;
    }

    /** @param {string | null} url */
    setCoverImage(url) {
        return this.setJacketImage(this.coverMaterial, url);
    }

    /** @param {string | null} url */
    setBackImage(url) {
        return this.setJacketImage(this.backMaterial, url);
    }

    /**
     * Label art is cropped to the circle by the cylinder cap UVs.
     * With no art, draws a plain paper label.
     * @param {string | null} url
     */
    async setLabelImage(url) {
        const size = 1024;
        const canvas = url ? squareCanvas(await loadImage(url), size) : document.createElement('canvas');
        if (!url) canvas.width = canvas.height = size;
        const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
        const c = size / 2;

        if (!url) {
            ctx.fillStyle = PAPER;
            ctx.fillRect(0, 0, size, size);
            ctx.strokeStyle = 'rgba(20, 20, 18, 0.25)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(c, c, c * 0.86, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(20, 20, 18, 0.7)';
            ctx.textAlign = 'center';
            ctx.font = '700 64px "ITC Avant Garde Gothic Pro", system-ui, sans-serif';
            ctx.fillText('SIDE A', c, c * 0.62);
            ctx.font = '700 34px "ITC Avant Garde Gothic Pro", system-ui, sans-serif';
            ctx.fillText('33⅓ RPM', c, c * 1.5);
        }

        // spindle hole
        ctx.fillStyle = '#0b0b0a';
        ctx.beginPath();
        ctx.arc(c, c, (SPINDLE_RADIUS / LABEL_RADIUS) * c, 0, Math.PI * 2);
        ctx.fill();

        if (this.labelMaterial.map) this.labelMaterial.map.dispose();
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = this.maxAnisotropy;
        // cylinder cap UVs run sideways once the disc is stood up
        texture.center.set(0.5, 0.5);
        texture.rotation = Math.PI / 2;
        this.labelMaterial.map = texture;
        this.labelMaterial.needsUpdate = true;
    }

    dispose() {
        this.scene.remove(this.group);
        this.group.traverse((object) => {
            const mesh = /** @type {THREE.Mesh} */ (object);
            if (mesh.geometry) mesh.geometry.dispose();
            const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
            for (const material of materials) {
                for (const value of Object.values(material)) {
                    if (value instanceof THREE.Texture) value.dispose();
                }
                material.dispose();
            }
        });
    }
}
