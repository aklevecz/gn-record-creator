import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

class ThreeScene {
	constructor() {
		console.log('THREE CONSTRUCTION');
		/** @type {HTMLElement | null} */
		this.container = null
		this.width = 0;
		this.height = 0;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera();

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

		this.useShader = false;
		this.shaderMaterial = null;
		this.shaderTime = 0;

		this.toggleShader = this.toggleShader.bind(this);
		this.createShaderMaterial = this.createShaderMaterial.bind(this);

		this.handleModelUpload = this.handleModelUpload.bind(this);
		this.handleTextureUpload = this.handleTextureUpload.bind(this);
		this.loadModel = this.loadModel.bind(this);
		this.animate = this.animate.bind(this);
		this.onWindowResize = this.onWindowResize.bind(this);
	}

	/** @param {HTMLElement} container */
	init(container) {
		this.container = container;
		this.width = container.clientWidth;
		this.height = container.clientHeight;
		this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 200000);
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.renderer.setClearColor(0x000000, 0);

		this.renderer.pixelRatio = window.devicePixelRatio;

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
		// this.scene.background = new THREE.Color(0x1e1e1e);

		this.camera.position.set(45, 20, 0);
		if (!this.renderer) {
			this.renderer = new THREE.WebGLRenderer({ antialias: true });
		}
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
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Increased from 0.3
		this.scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4); // Reduced from 0.7
		directionalLight.position.set(1, 1, 0);
		this.scene.add(directionalLight);

		const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3); // Reduced from 0.5
		directionalLight2.position.set(-1, 0.5, 1);
		this.scene.add(directionalLight2);
	}

	createRecordCover() {
		const geometry = new THREE.BoxGeometry(0.25, 20, 20);
		const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
		this.recordCover = new THREE.Mesh(geometry, material);
		this.recordCover.position.set(0, 20, 0);
		this.scene.add(this.recordCover);
		this.recordCoverAnimation = {
			startTime: 0,
			duration: 2000,
			startPosition: { x: 0, y: -20, z: 0 },
			endPosition: { x: 0, y: 20, z: 0 },
			active: true
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
			this.loadedModels = this.loadedModels.filter(
				(/** @type {THREE.Object3D} */ m) => m !== this.model
			);
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
			if (!this.renderer) {
				console.log('render missing in updateMaterialTexture');
				return;
			}
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

			const basicMaterial = new THREE.MeshBasicMaterial({
				map: texture,
				color: 0xffffff // Pure white base to not affect texture colors,
			});

			if (this.recordCover) {
				this.recordCover.material = basicMaterial;
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

	resize() {
		if (!this.container) {
			console.log("Container missing for resize")
			return
		}
		if (!this.renderer) {
			console.log("Renderer is missing")
			return
		}
		this.width = this.container.clientWidth;
		this.height = this.container.clientHeight;
		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(this.width , this.height);
	}

	/** @param {number} x */
	easeOutCubic(x) {
		return 1 - Math.pow(1 - x, 3);
	}
	animate() {
		requestAnimationFrame(() => this.animate());

		if (this.useShader && this.shaderMaterial) {
			this.shaderTime += 0.01;
			this.shaderMaterial.uniforms.time.value = this.shaderTime;
		}

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
		this.renderer && this.renderer.render(this.scene, this.camera);
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

	createShaderMaterial() {
		const vertexShader = `
		  varying vec2 vUv;
		  
		  void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		  }
		`;

		const fragmentShader = `
		  uniform float time;
		  varying vec2 vUv;
		  
		  void main() {
			// Center the UV coordinates
			vec2 uv = vUv - 0.5;
			
			// Calculate distance from center
			float dist = length(uv);
			
			// Create concentric circles that move outward
			float rings = sin(dist * 20.0 - time * 2.0) * 0.5 + 0.5;
			
			// Add some color variation
			vec3 color1 = vec3(0.2, 0.4, 0.8); // Blue
			vec3 color2 = vec3(0.8, 0.2, 0.5); // Pink
			
			// Mix colors based on time and position
			vec3 color = mix(color1, color2, sin(time * 0.5 + dist * 5.0) * 0.5 + 0.5);
			
			// Apply the ring pattern to the color
			color *= rings;
			
			// Add a subtle glow from the center
			color += vec3(0.1, 0.1, 0.2) * (1.0 - dist * 2.0);
			
			gl_FragColor = vec4(color, 1.0);
		  }
		`;
		return new THREE.ShaderMaterial({
			uniforms: {
				time: { value: 0.0 }
			},
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			side: THREE.DoubleSide
		});
	}

	toggleShader() {
		this.useShader = !this.useShader;

		if (this.useShader) {
			if (!this.shaderMaterial) {
				this.shaderMaterial = this.createShaderMaterial();
			}

			if (this.recordCover) {
				// @ts-ignore
				this.recordCover.material = this.shaderMaterial;
			}
		} else {
			// Revert to basic material
			// if (this.recordCover) {
			// 	this.recordCover.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
			// }
		}
	}

	dispose() {
		if (!this.renderer) {
			console.log('No renderer');
			return;
		}
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
		window.removeEventListener('resize', () => this.onWindowResize(), false);
	}
}

export default ThreeScene;
