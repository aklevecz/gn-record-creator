import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';

export class SceneControls {
	/**
	 * Initializes scene controls
	 * @param {THREE.Camera} camera - The scene camera
	 * @param {HTMLElement} domElement - The renderer's DOM element
	 */
	constructor(camera, domElement) {
		this.controls = new OrbitControls(camera, domElement);
		this.controls.autoRotate = true;
		this.controls.enableZoom = false;
		this.controls.minPolarAngle = Math.PI / 2; // 90 degrees
		this.controls.maxPolarAngle = Math.PI / 2; // 90 degrees
		this.controls.target.set(0, 20, 0);
		this.controls.update();
	}

	/**
	 * Adjusts camera to focus on a 3D object
	 * @param {THREE.Object3D} object - The object to focus on
	 * @param {THREE.Camera} camera - The camera to adjust
	 */
	adjustCameraToModel(object, camera) {
		const box = new THREE.Box3().setFromObject(object);
		const center = box.getCenter(new THREE.Vector3());
		// const size = box.getSize(new THREE.Vector3());

		// const maxDim = Math.max(size.x, size.y, size.z);
		// const fov = camera.fov * (Math.PI / 180);
		// const cameraZ = Math.abs(maxDim / Math.sin(fov / 2));

		camera.position.set(center.x, center.y, center.z);
		camera.lookAt(center);

		this.controls.target.copy(center);
		this.controls.update();
	}

	/**
	 * Updates the controls
	 */
	update() {
		this.controls.update();
	}
}
