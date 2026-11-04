import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { JACKET_SIZE, SleeveModel } from './models/SleeveModel';

const TAU = Math.PI * 2;

/** @param {number} angle */
const wrapAngle = (angle) => ((angle % TAU) + TAU) % TAU;

/**
 * Product-shot scene for showing a record in its jacket:
 * studio lighting, soft floor shadow, drag to rotate.
 * The canvas is transparent so PNG exports drop straight into a deck.
 */
export class MockupScene {
    /** @param {HTMLElement} container */
    constructor(container) {
        this.container = container;
        this.frame = 0;
        /** While true the render loop leaves the canvas alone (video export owns it) */
        this.recording = false;
        /** @type {number | null} - azimuth the camera is easing toward (arrow buttons) */
        this.azimuthGoal = null;
        this.lastAzimuth = NaN;
        /** @type {(radians: number) => void} */
        this.onAzimuthChange = () => {};
        /** @type {(on: boolean) => void} */
        this.onAutoRotateChange = () => {};

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.toneMapping = THREE.NeutralToneMapping; // keeps cover art colors honest
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(this.renderer);
        this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        this.scene.environmentIntensity = 0.75;
        pmrem.dispose();

        this.camera = new THREE.PerspectiveCamera(30, 1, 1, 1000);
        this.camera.position.set(38, 22, 52);

        this.addLights();
        this.addFloor();

        this.model = new SleeveModel(this.scene, this.renderer.capabilities.getMaxAnisotropy());

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.enablePan = false;
        this.controls.minDistance = 30;
        this.controls.maxDistance = 110;
        this.controls.minPolarAngle = Math.PI * 0.2;
        this.controls.maxPolarAngle = Math.PI * 0.5; // never below the floor
        this.controls.autoRotateSpeed = 0.6;
        this.controls.target.set(this.model.centerX, JACKET_SIZE / 2, 0);
        // stop the turntable as soon as someone grabs it
        this.controls.addEventListener('start', () => {
            this.azimuthGoal = null;
            this.setAutoRotate(false);
        });

        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(container);
        this.resize();

        this.animate = this.animate.bind(this);
        this.animate();
    }

    addLights() {
        const key = new THREE.DirectionalLight(0xffffff, 1.6);
        key.position.set(25, 45, 35);
        key.castShadow = true;
        key.shadow.mapSize.set(2048, 2048);
        key.shadow.bias = -0.0004;
        key.shadow.normalBias = 0.03;
        key.shadow.radius = 6;
        const s = 30;
        Object.assign(key.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 140 });
        key.target.position.set(5, 0, 0);
        this.scene.add(key, key.target);

        const rim = new THREE.DirectionalLight(0xffffff, 1.1);
        rim.position.set(-30, 25, -30);
        this.scene.add(rim);
    }

    addFloor() {
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({ opacity: 0.16 }));
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
    }

    /** @param {boolean} on */
    setAutoRotate(on) {
        if (this.controls.autoRotate === on) return;
        this.controls.autoRotate = on;
        this.onAutoRotateChange(on);
    }

    /** Camera angle around the sleeve, 0 = straight at the front cover, in [0, 2π) */
    getAzimuth() {
        return wrapAngle(this.controls.getAzimuthalAngle());
    }

    /** @param {number} angle - radians */
    setAzimuth(angle) {
        const offset = this.camera.position.clone().sub(this.controls.target);
        const spherical = new THREE.Spherical().setFromVector3(offset);
        spherical.theta = angle;
        this.camera.position.copy(this.controls.target).add(offset.setFromSpherical(spherical));
        this.camera.lookAt(this.controls.target);
    }

    /**
     * Scrubbing takes over from the turntable and any arrow nudge in flight.
     * @param {number} angle - radians
     */
    scrubTo(angle) {
        this.azimuthGoal = null;
        this.setAutoRotate(false);
        this.setAzimuth(angle);
    }

    /** @param {number} angle - radians to ease around by, + is counter-clockwise from above */
    nudge(angle) {
        this.setAutoRotate(false);
        this.azimuthGoal = (this.azimuthGoal ?? this.getAzimuth()) + angle;
    }

    /** @param {number} aspect */
    setAspect(aspect) {
        this.camera.aspect = aspect;
        // widen the vertical fov on portrait screens so the whole sleeve + record stays in frame
        const minAspect = 1.25;
        this.camera.fov =
            aspect >= minAspect
                ? 30
                : THREE.MathUtils.radToDeg(2 * Math.atan((Math.tan(THREE.MathUtils.degToRad(15)) * minAspect) / aspect));
        this.camera.updateProjectionMatrix();
    }

    resize() {
        if (this.recording) return;
        const { clientWidth: width, clientHeight: height } = this.container;
        if (!width || !height) return;
        this.setAspect(width / height);
        this.renderer.setSize(width, height);
    }

    animate() {
        this.frame = requestAnimationFrame(this.animate);
        if (this.recording) return;

        this.model.updateSlide();
        // keep the camera framed on whatever is visible as the record slides
        this.controls.target.x = THREE.MathUtils.lerp(this.controls.target.x, this.model.centerX, 0.1);

        if (this.azimuthGoal !== null) {
            const current = this.controls.getAzimuthalAngle();
            // shortest way round
            const diff = Math.atan2(Math.sin(this.azimuthGoal - current), Math.cos(this.azimuthGoal - current));
            if (Math.abs(diff) < 0.001) this.azimuthGoal = null;
            else this.setAzimuth(current + diff * 0.15);
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);

        const azimuth = this.getAzimuth();
        if (!(Math.abs(azimuth - this.lastAzimuth) < 0.002)) {
            this.lastAzimuth = azimuth;
            this.onAzimuthChange(azimuth);
        }
    }

    /**
     * Video has no alpha, so recordings get the same soft studio backdrop as the page.
     * @param {number} size
     */
    createBackdrop(size) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
        const gradient = ctx.createRadialGradient(size / 2, size * 0.4, 0, size / 2, size * 0.4, size * 0.75);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.55, '#f4f4f4');
        gradient.addColorStop(1, '#e5e3e3');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }

    /**
     * Renders one full 360° turn from the current view, frame by frame, into an MP4.
     * Offline rendering means no dropped frames and a seamless loop.
     * @param {{ seconds?: number, fps?: number, size?: number, onProgress?: (progress: number) => void }} [options]
     * @returns {Promise<Blob>}
     */
    async recordSpin({ seconds = 8, fps = 30, size = 1080, onProgress = () => {} } = {}) {
        const { BufferTarget, CanvasSource, Mp4OutputFormat, Output, QUALITY_HIGH, getFirstEncodableVideoCodec } = await import('mediabunny');
        const codec = await getFirstEncodableVideoCodec(['avc', 'hevc', 'vp9', 'av1'], { width: size, height: size });
        if (!codec) throw new Error("This browser can't encode video. Try Chrome or Safari.");

        this.recording = true;
        const pixelRatio = this.renderer.getPixelRatio();
        const startAzimuth = this.getAzimuth();
        const wasAutoRotating = this.controls.autoRotate;
        const backdrop = this.createBackdrop(1024);

        this.azimuthGoal = null;
        this.setAutoRotate(false);
        this.model.updateSlide(true);
        this.controls.target.x = this.model.centerX;
        this.renderer.setPixelRatio(1);
        this.renderer.setSize(size, size, false);
        this.setAspect(1);
        this.scene.background = backdrop;

        // Copy each WebGL frame onto a 2D canvas so the encoder never reads a cleared drawing buffer
        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = frameCanvas.height = size;
        const frameCtx = /** @type {CanvasRenderingContext2D} */ (frameCanvas.getContext('2d'));

        const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target: new BufferTarget() });
        const source = new CanvasSource(frameCanvas, { codec, bitrate: QUALITY_HIGH, keyFrameInterval: 2 });
        output.addVideoTrack(source, { frameRate: fps });

        try {
            await output.start();
            const frames = Math.round(seconds * fps);
            for (let i = 0; i < frames; i++) {
                this.setAzimuth(startAzimuth + (TAU * i) / frames);
                this.renderer.render(this.scene, this.camera);
                frameCtx.drawImage(this.renderer.domElement, 0, 0);
                await source.add(i / fps, 1 / fps);
                onProgress((i + 1) / frames);
            }
            await output.finalize();
        } catch (error) {
            await output.cancel();
            throw error;
        } finally {
            this.scene.background = null;
            backdrop.dispose();
            this.setAzimuth(startAzimuth);
            this.renderer.setPixelRatio(pixelRatio);
            this.recording = false;
            this.resize();
            this.setAutoRotate(wasAutoRotating);
        }

        return new Blob([/** @type {ArrayBuffer} */ (output.target.buffer)], { type: 'video/mp4' });
    }

    /**
     * Renders the current view at high resolution with a transparent background.
     * @param {number} [scale] - multiplier over the on-screen size
     * @returns {Promise<Blob | null>}
     */
    exportPng(scale = 3) {
        const pixelRatio = this.renderer.getPixelRatio();
        this.renderer.setPixelRatio(scale);
        this.renderer.render(this.scene, this.camera);
        const canvas = this.renderer.domElement;
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                this.renderer.setPixelRatio(pixelRatio);
                resolve(blob);
            }, 'image/png');
        });
    }

    dispose() {
        cancelAnimationFrame(this.frame);
        this.resizeObserver.disconnect();
        this.controls.dispose();
        this.model.dispose();
        this.scene.environment?.dispose();
        this.renderer.dispose();
        this.renderer.domElement.remove();
    }
}

export default MockupScene;
