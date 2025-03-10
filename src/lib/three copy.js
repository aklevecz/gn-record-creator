import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import idb from './idb';
import { CURRENT_TEXTURE } from '$lib';
// import modelStorage from "$lib/idb";

class ThreeScene {
	/** @param {HTMLElement} container */
	constructor(container) {
		this.width = container.clientWidth;
		this.height = container.clientHeight;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 200000);
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.pixelRatio = window.devicePixelRatio;
		this.controls = null;
		this.model = null;
		/** @type {*} */
		this.mixer = null;
		this.clock = new THREE.Clock();
		this.recordCover = null;
		this.currentTexture = null;

		// this.loadedModels = [];

		this.materials = {
			standard: new THREE.MeshStandardMaterial({
				color: 'green',
				metalness: 0.5,
				roughness: 0.5
			}),
			phong: new THREE.MeshPhongMaterial({
				color: 0x808080,
				shininess: 100
			}),
			basic: new THREE.MeshBasicMaterial({
				color: 0x808080
			}),
			wireframe: new THREE.MeshBasicMaterial({
				color: 0x808080,
				wireframe: true
			}),
			normal: new THREE.MeshNormalMaterial(),
			toon: new THREE.MeshToonMaterial({
				color: 0x808080
			})
		};

		this.textureLoader = new THREE.TextureLoader();

		idb.getTexture(CURRENT_TEXTURE).then((textureFile) => {
			if (!textureFile) {
				console.log('THERE IS NO CURRENT TEXTURE');
				return;
			}
			const url = URL.createObjectURL(textureFile.imgFile);
			this.updateMaterialTexture(url);
		});

		this.handleModelUpload = this.handleModelUpload.bind(this);
		this.handleTextureUpload = this.handleTextureUpload.bind(this);
		this.loadModel = this.loadModel.bind(this);
		this.animate = this.animate.bind(this);
		this.onWindowResize = this.onWindowResize.bind(this);

		this.init(container);
	}

	/** @param {HTMLElement} container */
	init(container) {
		this.setupScene(container);
		const record = this.createVinylRecord();
		record.position.set(0, 20, 0);
		record.rotation.x = -Math.PI / 2;
		record.rotation.z = Math.PI / 2;
		this.scene.add(record);

		this.createRecordCover();

		this.addLights();

		window.addEventListener('resize', () => this.onWindowResize(), false);
	}

	/** @param {HTMLElement} container */
	setupScene(container) {
		this.scene.background = new THREE.Color(0x000000);

		this.camera.position.set(35, 20, 0);

		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.width, this.height);
		this.renderer.shadowMap.enabled = true;
		container.appendChild(this.renderer.domElement);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.autoRotate = true;
		this.controls.enableZoom = false;
		this.controls.target.set(0, 20, 0);
		this.controls.update();
	}

	addLights() {
		// Increase ambient light for more even illumination
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Increased from 0.3
		this.scene.add(ambientLight);

		// Reduce directional light intensity
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4); // Reduced from 0.7
		directionalLight.position.set(1, 1, 0);
		this.scene.add(directionalLight);

		// Reduce second directional light
		const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3); // Reduced from 0.5
		directionalLight2.position.set(-1, 0.5, 1);
		this.scene.add(directionalLight2);
	}

	createRecordCover() {
		const geometry = new THREE.BoxGeometry(1, 20, 20);
		const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
		this.recordCover = new THREE.Mesh(geometry, material);
		this.recordCover.position.set(0, 20, 0);
		this.scene.add(this.recordCover);
		this.recordCoverAnimation = {
			startTime: 0,
			duration: 2000, // 2 seconds
			startPosition: { x: 0, y: -20, z: 0 },
			endPosition: { x: 0, y: 20, z: 0 }, // End position slightly to the left of center
			active: true // Flag to track if animation is still running
		};
	}

	/** @param {string} modelUrl */
	loadModel(modelUrl) {
		console.log(`Loading model: ${modelUrl}`);
		const loader = new FBXLoader();

		if (this.model) {
			console.log('remove model');
			this.removeModel();
		}

		loader.load(
			modelUrl,
			(object) => {
				this.model = object;
				this.model.traverse((child) => {
					// @ts-ignore
					child.material = this.materials.standard.clone();
				});

				this.scene.add(object);
				this.adjustCameraToModel(object);
				this.loadedModels.push(object);
			},
			(xhr) => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
			(error) => console.error('Error loading FBX:', error)
		);
	}

	removeModel() {
		if (this.model) {
			this.scene.remove(this.model);
			this.loadedModels = this.loadedModels.filter((/** @type {THREE.Object3D} */ m) => m !== this.model);
			this.model = null;
		}
	}

	/** @param {Event} event */
	handleModelUpload(event) {
		// const file = event.target.files[0];
		// modelStorage.saveModel(file);
		// if (file) {
		//   const reader = new FileReader();
		//   reader.onload = (e) => {
		//     if (e.target?.result) {
		//       const blob = new Blob([e.target.result], { type: "application/octet-stream" });
		//       const blobUrl = URL.createObjectURL(blob);
		//       this.loadModel(blobUrl);
		//     }
		//   };
		//   reader.readAsArrayBuffer(file);
		// }
	}

	/** @param {THREE.Object3D} object */
	adjustCameraToModel(object) {
		const box = new THREE.Box3().setFromObject(object);
		const center = box.getCenter(new THREE.Vector3());
		const size = box.getSize(new THREE.Vector3());

		const maxDim = Math.max(size.x, size.y, size.z);
		const fov = this.camera.fov * (Math.PI / 180);
		const cameraZ = Math.abs(maxDim / Math.sin(fov / 2));

		this.camera.position.set(center.x, center.y, center.z + cameraZ);
		this.camera.lookAt(center);
		if (this.controls) {
			this.controls.target.copy(center);
			this.controls.update();
		}
	}
	/** @param {string} textureUrl */
	updateMaterialTexture(textureUrl) {
		this.textureLoader.load(textureUrl, (texture) => {
			// Preserve color fidelity
			texture.colorSpace = THREE.SRGBColorSpace;
			// texture.encoding = THREE.sRGBEncoding;
			texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

			// Prevent mipmapping from diluting colors
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;

			// Prevent color filtering
			texture.generateMipmaps = false;

			// Standard wrapping
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;

			// Create material with 100% color saturation
			// this.materials.standard = new THREE.MeshBasicMaterial({
			// 	map: texture,
			// 	color: 0xffffff // Pure white base to not affect texture colors
			// });

      const basicMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0xffffff, // Pure white base to not affect texture colors,

      });

			// if (this.model) {
			// 	this.model.traverse((child) => {
			// 		if (child.isMesh) {
			// 			child.material = this.materials.standard.clone();
			// 		}
			// 	});
			// }

			if (this.recordCover) {
				this.recordCover.material = basicMaterial
			}
		});
	}

  /** @param {*} event */
	handleTextureUpload(event) {
		const file = event.target.files[0];
		if (file) {
			const reader = new FileReader();
      /** @ts-ignore */
			reader.onload = (e) => this.updateMaterialTexture(e.target.result);
			reader.readAsDataURL(file);
		}
	}

	onWindowResize() {
		// this.camera.aspect = window.innerWidth / window.innerHeight;
		// this.camera.updateProjectionMatrix();
		// this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

  /** @param {number} x */
	easeOutCubic(x) {
		return 1 - Math.pow(1 - x, 3);
	}
	animate() {
		requestAnimationFrame(() => this.animate());

		if (this.recordCover && this.recordCoverAnimation && this.recordCoverAnimation.active) {
			// Initialize start time on first frame
			if (!this.recordCoverAnimation.startTime) {
				this.recordCoverAnimation.startTime = Date.now();
			}

			// Calculate animation progress
			const elapsed = Date.now() - this.recordCoverAnimation.startTime;
			const progress = Math.min(elapsed / this.recordCoverAnimation.duration, 1);

			// Use easing function for smoother motion
			const easedProgress = this.easeOutCubic(progress);

			// Update position
			// console.log(this.recordCover)
			this.recordCover.position.y =
				this.recordCoverAnimation.startPosition.y +
				(this.recordCoverAnimation.endPosition.y - this.recordCoverAnimation.startPosition.y) *
					easedProgress;

			// End animation when complete
			if (progress === 1) {
				this.recordCoverAnimation.active = false;
			}
		}

		if (this.mixer) this.mixer.update(this.clock.getDelta());

		this.controls && this.controls.update();
		this.renderer.render(this.scene, this.camera);
	}

  /** @param {string} modelId */
	async loadModelById(modelId) {
		// const modelObject = await modelStorage.getModel(modelId);
		// if (!modelObject) {
		//   console.error(`Model not found: ${modelId}`);
		//   return;
		// }
		// const blob = new Blob([modelObject.data]);
		// const blobUrl = URL.createObjectURL(blob);
		// console.log(`blobUrl: ${blobUrl}`);
		// this.loadModel(blobUrl);
	}

	createVinylRecord() {
		// Create a group to hold all parts of the record
		const recordGroup = new THREE.Group();

		// Record disc - main black part
		const recordGeometry = new THREE.CylinderGeometry(5.9, 5.9, 0.08, 64);
		const recordMaterial = new THREE.MeshStandardMaterial({
			color: 0xfff,
			roughness: 0.5,
			metalness: 0.2
		});
		const record = new THREE.Mesh(recordGeometry, recordMaterial);
		recordGroup.add(record);

		// Label in the center
		const labelGeometry = new THREE.CylinderGeometry(2, 2, 0.09, 64);
		const labelMaterial = new THREE.MeshStandardMaterial({
			color: 0xeeeeee,
			roughness: 0.8,
			metalness: 0.1
		});
		const label = new THREE.Mesh(labelGeometry, labelMaterial);
		label.position.y = 0.005;
		recordGroup.add(label);

		// Center hole
		const holeGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 32);
		const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
		const hole = new THREE.Mesh(holeGeometry, holeMaterial);
		recordGroup.add(hole);

		// Create grooves as rings
		this.addGrooves(recordGroup);

		return recordGroup;
	}

	/** @param {THREE.Group} recordGroup */
	addGrooves(recordGroup) {
		const startRadius = 2.2;
		const endRadius = 5.8;
		const numGrooves = 80;
		const spacing = (endRadius - startRadius) / numGrooves;

		for (let i = 0; i < numGrooves; i++) {
			const radius = startRadius + i * spacing;
			const grooveGeometry = new THREE.RingGeometry(radius, radius + 0.02, 64);
			const grooveMaterial = new THREE.MeshBasicMaterial({
				color: 0x000000,
				side: THREE.DoubleSide,
				transparent: true,
				opacity: 0.3
			});
			const groove = new THREE.Mesh(grooveGeometry, grooveMaterial);
			groove.rotation.x = Math.PI / 2;
			groove.position.y = 0.041;
			recordGroup.add(groove);
		}
	}

	dispose() {
		// Clean up resources
		this.renderer.dispose();
		this.scene.traverse((/** @type {*} */ object) => {
			if (object.geometry) {
				object.geometry.dispose();
			}
			if (object.material) {
				if (object.material.map) object.material.map.dispose();
				object.material.dispose();
			}
		});
		// Remove event listener
		window.removeEventListener('resize', () => this.onWindowResize(), false);
	}
}

export default ThreeScene;
