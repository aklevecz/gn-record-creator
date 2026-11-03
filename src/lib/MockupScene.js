import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { JACKET_SIZE, SleeveModel } from './models/SleeveModel';

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
        this.controls.addEventListener('start', () => this.setAutoRotate(false));
        /** @type {(on: boolean) => void} */
        this.onAutoRotateChange = () => {};

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

    resize() {
        const { clientWidth: width, clientHeight: height } = this.container;
        if (!width || !height) return;
        this.camera.aspect = width / height;
        // widen the vertical fov on portrait screens so the whole sleeve + record stays in frame
        const minAspect = 1.25;
        this.camera.fov =
            this.camera.aspect >= minAspect
                ? 30
                : THREE.MathUtils.radToDeg(2 * Math.atan((Math.tan(THREE.MathUtils.degToRad(15)) * minAspect) / this.camera.aspect));
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        this.frame = requestAnimationFrame(this.animate);
        this.model.updateSlide();
        // keep the camera framed on whatever is visible as the record slides
        this.controls.target.x = THREE.MathUtils.lerp(this.controls.target.x, this.model.centerX, 0.1);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
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
