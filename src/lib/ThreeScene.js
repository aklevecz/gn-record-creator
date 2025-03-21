import * as THREE from 'three';
import { SceneControls } from './controls/SceneControls';
import { RecordModel } from './models/RecordModel';
import { DisplacementShaderEffects } from './utils/DisplacementShaderEffects';
import { MaterialUtils } from './utils/MaterialUtils';
import { ShaderUtils } from './utils/ShaderUtils';

class ThreeScene {
	constructor() {
		this.container = null;
		this.width = 0;
		this.height = 0;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera();
		this.renderer = null;
		this.clock = new THREE.Clock();

		// Initialize utilities
		this.controls = null;
		this.materialUtils = new MaterialUtils();
		this.shaderUtils = new ShaderUtils();

		// Animation properties
		this.animations = {};

		// Bind methods
		this.animate = this.animate.bind(this);
		this.handleTextureUpload = this.handleTextureUpload.bind(this);

		this.recordCoverAnimation = {
			startTime: 0,
			duration: 2000,
			startPosition: { x: 0, y: -20, z: 0 },
			endPosition: { x: 0, y: 20, z: 0 },
			active: true
		};

		this.vinylRecordAnimation = {
			startTime: 0,
			duration: 2000,
			startPosition: { x: 0, y: 20, z: 0 },
			endPosition: { x: 0, y: 29, z: 0 },
			active: false
		};

		this.vinylInteractionAnimation = {
			startTime: 0,
			duration: 2000,
			startPosition: { x: 0, y: 29, z: 0 },
			endPosition: { x: -10, y: 29, z: 0 },
			active: false
		};

		this.vinylInteractionAnimation = {
			startTime: 0,
			duration: 2000,
			startPosition: { x: 0, y: 29, z: 0 },
			endPosition: { x: -10, y: 20, z: 0 },
			startRotation: { x: 0, y: 0, z: 0 },
			endRotation: { x: 0, y: -Math.PI * 2, z: 0 },
			active: false
		};

		this.revertVinylInteractionAnimation = {
			startTime: 0,
			duration: 2000,
			startPosition: { x: -10, y: 20, z: 0 },
			endPosition: { x: 0, y: 29, z: 0 },
			startRotation: { x: 0, y: -Math.PI * 2, z: 0 },
			endRotation: { x: 0, y: 0, z: 0 },
			active: false
		};

		this.displacementEffects = new DisplacementShaderEffects();
		this.currentDisplacementEffect = this.displacementEffects.effects.wave;
		this.currentTexture = null;
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

		// Set up scene and controls
		this.setupScene(container);

		// Create models
		this.recordModel = new RecordModel(this.scene);
		this.recordCover = this.recordModel.createRecordCover();
		this.vinylRecord = this.recordModel.createVinylRecord();
		this.vinylRecord.visible = false;
		// this.animations = setupAnimations(this.recordCover);

		// Add lights
		this.addLights();

		// Set up event listeners
		window.addEventListener('resize', () => this.resize(), false);
		window.addEventListener('change-record-color', (/** @type {*} */ e) => {
			if (this.recordModel) {
				this.recordModel.changeRecordColor(e.detail.color);
				if (this.vinylInteractionAnimation) this.vinylInteractionAnimation.active = true;

				setTimeout(() => {
					if (this.revertVinylInteractionAnimation)
						this.revertVinylInteractionAnimation.active = true;
				}, 3000);
			}
		});
	}

	/** @param {HTMLElement} container */
	setupScene(container) {
		this.camera.position.set(45, 20, 0);
		if (!this.renderer) {
			this.renderer = new THREE.WebGLRenderer({ antialias: true });
		}
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.width, this.height);
		this.renderer.shadowMap.enabled = true;
		container.appendChild(this.renderer.domElement);

		// Initialize controls
		this.controls = new SceneControls(this.camera, this.renderer.domElement);
	}

	addLights() {
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
		this.scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
		directionalLight.position.set(1, 1, 0);
		this.scene.add(directionalLight);

		const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
		directionalLight2.position.set(-1, 0.5, 1);
		this.scene.add(directionalLight2);
	}

	/** @param {*} event */
	handleTextureUpload(event) {
		const file = event.target.files[0];
		if (file && this.recordCover && this.renderer) {
			this.materialUtils.loadTextureFromFile(
				file,
				this.renderer,
				(/** @type {THREE.Material} */ material) => {
					if (!this.recordCover) return;
					this.recordCover.material = material;
				}
			);
		}
	}

	/** @param {string} textureUrl */
	async updateMaterialTexture(textureUrl) {
		const material = await this.materialUtils.updateMaterialTexture(textureUrl);
		if (!this.recordCover) {
			return;
		};
		this.recordCover.material = material;
	}

	resize() {
		if (!this.container || !this.renderer) return;

		this.width = this.container.clientWidth;
		this.height = this.container.clientHeight;
		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(this.width, this.height);
	}
	toggleDisplacementShader(effectType = 'ripple', intensity = 0.1) {
		if (
			!this.recordCover ||
			!this.recordCover.material
			// || !this.recordCover.material.map
		) {
			return false;
		}
		this.displacementEffects.oscillatorTime = 0
		// @ts-ignore
		if (this.recordCover.material.map) {
			// @ts-ignore
			this.currentTexture = this.recordCover.material.map;
		} else {

		}

		// Toggle the effect on/off
		this.useDisplacementShader = !this.useDisplacementShader;

		const currentIndex = Object.keys(this.displacementEffects.effects).indexOf(
			this.currentDisplacementEffect
		);
		const nextShader = Object.keys(this.displacementEffects.effects)[
			(currentIndex + 1) % Object.keys(this.displacementEffects.effects).length
		];
		
		if (this.useDisplacementShader) {
			// Apply the selected displacement effect
			const material = this.displacementEffects.createShader(
				this.currentTexture,
				this.currentDisplacementEffect,
				intensity
			);
			this.recordCover.material = material;
		} else {
			// Restore original material
			this.recordCover.material = new THREE.MeshBasicMaterial({
				map: this.currentTexture,
				color: 0xffffff
			});
		}
		this.currentDisplacementEffect = nextShader;
		return this.useDisplacementShader;
	}

	/** @param {string} effectType */
	changeDisplacementEffect(effectType) {
		if (this.useDisplacementShader && this.displacementEffects) {
			const material = this.displacementEffects.changeEffect(effectType);
			if (this.recordCover) {
				// @ts-ignore
				this.recordCover.material = material;
			}
		}
	}

	/**
	 * Updates the intensity of the current displacement effect
	 * @param {number} intensity - New intensity value
	 */
	updateDisplacementIntensity(intensity) {
		if (this.shaderUtils.isDisplacementShaderActive()) {
			this.shaderUtils.updateDisplacementIntensity(intensity);
		}
	}

	animate() {
		requestAnimationFrame(this.animate);

		// Run animations (register)
		this.runInitialRecordAnimation();
		this.runVinylInteractionAnimation();
		this.runRevertVinylInteractionAnimation();

		// Update shader if active
		if (this.shaderUtils.isShaderActive() && this.recordCover) {
			this.shaderUtils.updateShader();
			//@ts-ignore
			this.recordCover.material = this.shaderUtils.getMaterial();
		}

		// if (this.useDisplacementShader && this.displacementEffects) {
		// 	const currentTime = Date.now()
		// 	this.displacementEffects.update(currentTime * .0001 % 1);
		// 	// No need to reassign material here as we're updating the uniforms directly
		// }

		if (this.useDisplacementShader && this.displacementEffects) {
			this.displacementEffects.update();
			this.displacementEffects.updateOscillatingIntensity();
			// Oscillate intensity
			// const baseIntensity = .01;
			// const oscillationAmplitude = 0.02;
			// const oscillatedIntensity = baseIntensity +
			//   oscillationAmplitude * Math.sin(currentTime * 0.001);
			// this.displacementEffects.updateIntensity(Math.abs(oscillatedIntensity))
		}

		// Update scene
		if (this.controls) this.controls.update();
		if (this.renderer) this.renderer.render(this.scene, this.camera);
	}

	/** @param {number} x */
	easeOutCubic(x) {
		return 1 - Math.pow(1 - x, 3);
	}

	/**
	 * Calculate animation progress
	 * @param {{ active: boolean; startTime: number; duration: number; startPosition: { x: number; y: number; z: number }; endPosition: { x: number; y: number; z: number }; onComplete?: () => void;}} animation - Animation configuration object
	 * @returns {number} - Progress value between 0-1, or -1 if animation not active
	 */
	calculateAnimationProgress(animation) {
		if (!animation?.active) return -1;

		// Initialize start time if needed
		if (!animation.startTime) {
			animation.startTime = Date.now();
		}

		// Calculate progress
		const elapsed = Date.now() - animation.startTime;
		const progress = Math.min(elapsed / animation.duration, 1);
		const easedProgress = this.easeOutCubic(progress);

		// Check if animation is complete
		if (progress === 1) {
			animation.active = false;
			animation.startTime = 0;
		}

		return easedProgress;
	}

	/**
	 * Interpolate position between start and end points
	 * @param {*} object - Object to animate
	 * @param {Record<string, number>} startPos - Starting position
	 * @param {Record<string, number>} endPos - Ending position
	 * @param {number} progress - Animation progress (0-1)
	 */
	interpolatePosition(object, startPos, endPos, progress) {
		if (!object || !startPos || !endPos) return;

		const axes = ['x', 'y', 'z'];
		axes.forEach((axis) => {
			if (startPos[axis] !== undefined && endPos[axis] !== undefined) {
				object.position[axis] = startPos[axis] + (endPos[axis] - startPos[axis]) * progress;
			}
		});
	}

	/**
	 * Interpolate rotation between start and end values
	 * @param {*} object - Object to animate
	 * @param {Record<string, number>} startRot - Starting rotation
	 * @param {Record<string, number>} endRot - Ending rotation
	 * @param {number} progress - Animation progress (0-1)
	 */
	interpolateRotation(object, startRot, endRot, progress) {
		if (!object || !startRot || !endRot) return;

		const axes = ['y']; // Can be expanded to ['x', 'y', 'z'] if needed
		axes.forEach((axis) => {
			if (startRot[axis] !== undefined && endRot[axis] !== undefined) {
				object.rotation[axis] = startRot[axis] + (endRot[axis] - startRot[axis]) * progress;
			}
		});
	}

	runInitialRecordAnimation() {
		// Record cover animation
		const coverProgress = this.calculateAnimationProgress(this.recordCoverAnimation);

		if (coverProgress >= 0 && this.recordCover) {
			this.interpolatePosition(
				this.recordCover,
				this.recordCoverAnimation.startPosition,
				this.recordCoverAnimation.endPosition,
				coverProgress
			);

			// If complete, start vinyl animation
			if (coverProgress === 1 && this.recordModel?.vinylRecord && this.vinylRecordAnimation) {
				this.recordModel.vinylRecord.visible = true;
				this.vinylRecordAnimation.active = true;
			}
		}

		// Vinyl record animation
		const vinylProgress = this.calculateAnimationProgress(this.vinylRecordAnimation);

		if (vinylProgress >= 0 && this.recordModel?.vinylRecord) {
			this.interpolatePosition(
				this.recordModel.vinylRecord,
				this.vinylRecordAnimation.startPosition,
				this.vinylRecordAnimation.endPosition,
				vinylProgress
			);
		}
	}

	runVinylInteractionAnimation() {
		const progress = this.calculateAnimationProgress(this.vinylInteractionAnimation);

		if (progress >= 0 && this.recordModel?.vinylRecord) {
			// Animate vinyl position
			this.interpolatePosition(
				this.recordModel.vinylRecord,
				this.vinylInteractionAnimation.startPosition,
				this.vinylInteractionAnimation.endPosition,
				progress
			);

			// Animate vinyl rotation if needed
			if (this.vinylInteractionAnimation.startRotation) {
				this.interpolateRotation(
					this.recordModel.vinylRecord,
					this.vinylInteractionAnimation.startRotation,
					this.vinylInteractionAnimation.endRotation,
					progress
				);
			}

			// Animate record cover if available
			if (this.recordModel.recordCover) {
				// Animate in opposite direction (1 - progress)
				this.recordModel.recordCover.position.y =
					this.recordCoverAnimation.startPosition.y +
					(this.recordCoverAnimation.endPosition.y - this.recordCoverAnimation.startPosition.y) *
						(1 - progress);

				// Commented out material changes
				// this.recordModel.recordCover.material.transparent = true;
				// this.recordModel.recordCover.material.opacity = 1 - progress;
				// this.recordModel.recordCover.material.needsUpdate = true;
			}
		}
	}

	runRevertVinylInteractionAnimation() {
		const progress = this.calculateAnimationProgress(this.revertVinylInteractionAnimation);

		if (progress >= 0 && this.recordModel?.vinylRecord) {
			// Animate vinyl position
			this.interpolatePosition(
				this.recordModel.vinylRecord,
				this.revertVinylInteractionAnimation.startPosition,
				this.revertVinylInteractionAnimation.endPosition,
				progress
			);

			// Animate vinyl rotation if needed
			if (this.revertVinylInteractionAnimation.startRotation) {
				this.interpolateRotation(
					this.recordModel.vinylRecord,
					this.revertVinylInteractionAnimation.startRotation,
					this.revertVinylInteractionAnimation.endRotation,
					progress
				);
			}

			// Animate record cover if available
			if (this.recordModel.recordCover) {
				this.recordModel.recordCover.position.y =
					this.recordCoverAnimation.startPosition.y +
					(this.recordCoverAnimation.endPosition.y - this.recordCoverAnimation.startPosition.y) *
						progress;

				// Commented out material changes
				// this.recordModel.recordCover.material.transparent = true;
				// this.recordModel.recordCover.material.opacity = progress;
				// this.recordModel.recordCover.material.needsUpdate = true;
			}
		}
	}

	toggleShader() {
		if (this.recordCover) {
			const isActive = this.shaderUtils.toggleShader();
			if (isActive) {
				// @ts-ignore
				this.recordCover.material = this.shaderUtils.getMaterial();
			} else {
				this.recordCover.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
			}
		}
	}

	dispose() {
		if (!this.renderer) return;

		this.renderer.dispose();
		this.scene.traverse((/** @type {*} */ object) => {
			if (object.geometry) object.geometry.dispose();
			if (object.material) {
				if (object.material.map) object.material.map.dispose();
				object.material.dispose();
			}
		});

		window.removeEventListener('resize', () => this.resize(), false);
	}
}

export default ThreeScene;

// runRevertVinylInteractionAnimation() {
//   if (
//     this.recordModel?.vinylRecord &&
//     this.revertVinylInteractionAnimation.active
//   ) {
//     if (!this.revertVinylInteractionAnimation.startTime) {
//       this.revertVinylInteractionAnimation.startTime = Date.now();
//     }

//     const elapsed = Date.now() - this.revertVinylInteractionAnimation.startTime;
//     const progress = Math.min(elapsed / this.revertVinylInteractionAnimation.duration, 1);
//     const easedProgress = this.easeOutCubic(progress);

//     if (this.recordModel.recordCover) {
//       // this.recordModel.recordCover.material.transparent = true;
//       // this.recordModel.recordCover.material.opacity = easedProgress;
//       // this.recordModel.recordCover.material.needsUpdate = true;

//       this.recordModel.recordCover.position.y =
//         this.recordCoverAnimation.startPosition.y +
//         (this.recordCoverAnimation.endPosition.y - this.recordCoverAnimation.startPosition.y) *
//           easedProgress
//     }

//     this.recordModel.vinylRecord.position.x =
//       this.revertVinylInteractionAnimation.startPosition.x +
//       (this.revertVinylInteractionAnimation.endPosition.x -
//         this.revertVinylInteractionAnimation.startPosition.x) *
//         easedProgress;

//     this.recordModel.vinylRecord.position.y =
//       this.revertVinylInteractionAnimation.startPosition.y +
//       (this.revertVinylInteractionAnimation.endPosition.y -
//         this.revertVinylInteractionAnimation.startPosition.y) *
//         easedProgress;

//     this.recordModel.vinylRecord.position.z =
//       this.revertVinylInteractionAnimation.startPosition.z +
//       (this.revertVinylInteractionAnimation.endPosition.z -
//         this.revertVinylInteractionAnimation.startPosition.z) *
//         easedProgress;

//     if (this.revertVinylInteractionAnimation.startRotation) {
//       this.recordModel.vinylRecord.rotation.y =
//         this.revertVinylInteractionAnimation.startRotation.y +
//         (this.revertVinylInteractionAnimation.endRotation.y -
//           this.revertVinylInteractionAnimation.startRotation.y) *
//           easedProgress;
//     }

//     if (progress === 1) {
//       this.revertVinylInteractionAnimation.active = false;
//       this.revertVinylInteractionAnimation.startTime = 0;
//     }
//   }
// }

// runVinylInteractionAnimation() {
//   if (
//     this.recordModel?.vinylRecord &&
//     this.vinylInteractionAnimation.active
//   ) {
//     if (!this.vinylInteractionAnimation.startTime) {
//       this.vinylInteractionAnimation.startTime = Date.now();
//     }
//     const elapsed = Date.now() - this.vinylInteractionAnimation.startTime;
//     const progress = Math.min(elapsed / this.vinylInteractionAnimation.duration, 1);
//     const easedProgress = this.easeOutCubic(progress);

//     if (this.recordModel.recordCover) {
//       // this.recordModel.recordCover.material.transparent = true;
//       // this.recordModel.recordCover.material.opacity = 1 - easedProgress;
//       // this.recordModel.recordCover.material.needsUpdate = true;

//       // change position of recordCover
//       this.recordModel.recordCover.position.y =
//         this.recordCoverAnimation.startPosition.y +
//         (this.recordCoverAnimation.endPosition.y - this.recordCoverAnimation.startPosition.y) *
//           (1 - easedProgress);
//     }

//     // Update position
//     this.recordModel.vinylRecord.position.x =
//       this.vinylInteractionAnimation.startPosition.x +
//       (this.vinylInteractionAnimation.endPosition.x -
//         this.vinylInteractionAnimation.startPosition.x) *
//         easedProgress;
//     this.recordModel.vinylRecord.position.y =
//       this.vinylInteractionAnimation.startPosition.y +
//       (this.vinylInteractionAnimation.endPosition.y -
//         this.vinylInteractionAnimation.startPosition.y) *
//         easedProgress;
//     this.recordModel.vinylRecord.position.z =
//       this.vinylInteractionAnimation.startPosition.z +
//       (this.vinylInteractionAnimation.endPosition.z -
//         this.vinylInteractionAnimation.startPosition.z) *
//         easedProgress;

//     if (this.vinylInteractionAnimation.startRotation) {
//       this.recordModel.vinylRecord.rotation.y =
//         this.vinylInteractionAnimation.startRotation.y +
//         (this.vinylInteractionAnimation.endRotation.y -
//           this.vinylInteractionAnimation.startRotation.y) *
//           easedProgress;
//     }

//     if (progress === 1) {
//       this.vinylInteractionAnimation.active = false;
//       this.vinylInteractionAnimation.startTime = 0;
//     }
//   }
// }

// runInitialRecordAnimation() {
//   // FIRST PART OF THIS CHAIN
//   if (this.recordCover && this.recordCoverAnimation && this.recordCoverAnimation.active) {
//     // Initialize start time on first frame
//     if (!this.recordCoverAnimation.startTime) {
//       this.recordCoverAnimation.startTime = Date.now();
//     }

//     // Calculate animation progress
//     const elapsed = Date.now() - this.recordCoverAnimation.startTime;
//     const progress = Math.min(elapsed / this.recordCoverAnimation.duration, 1);

//     // Use easing function for smoother motion
//     const easedProgress = this.easeOutCubic(progress);

//     // Update position
//     // console.log(this.recordCover)
//     this.recordCover.position.y =
//       this.recordCoverAnimation.startPosition.y +
//       (this.recordCoverAnimation.endPosition.y - this.recordCoverAnimation.startPosition.y) *
//         easedProgress;

//     // End animation when complete
//     if (progress === 1) {
//       this.recordCoverAnimation.active = false;
//       if (this.recordModel && this.recordModel.vinylRecord && this.vinylRecordAnimation) {
//         this.recordModel.vinylRecord.visible = true;
//         this.vinylRecordAnimation.active = true;
//       }
//     }
//   }

//   // SECOND PART OF THIS CHAIN
//   if (
//     this.recordModel?.vinylRecord &&
//     this.vinylRecordAnimation.active
//   ) {
//     if (!this.vinylRecordAnimation.startTime) {
//       this.vinylRecordAnimation.startTime = Date.now();
//     }
//     const elapsed = Date.now() - this.vinylRecordAnimation.startTime;
//     const progress = Math.min(elapsed / this.vinylRecordAnimation.duration, 1);

//     const easedProgress = this.easeOutCubic(progress);
//     this.recordModel.vinylRecord.position.y =
//       this.vinylRecordAnimation.startPosition.y +
//       (this.vinylRecordAnimation.endPosition.y - this.vinylRecordAnimation.startPosition.y) *
//         easedProgress;

//     if (progress === 1) {
//       this.vinylRecordAnimation.active = false;
//       this.vinylRecordAnimation.startTime = 0;
//     }
//   }
// }
