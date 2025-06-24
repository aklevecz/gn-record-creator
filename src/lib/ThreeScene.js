// SimpleLockAnimationSystem.js
import * as THREE from 'three';
import { SceneControls } from './controls/SceneControls';
import { RecordModel } from './models/RecordModel';
import { DisplacementShaderEffects } from './utils/DisplacementShaderEffects';
import { MaterialUtils } from './utils/MaterialUtils';
import { ShaderUtils } from './utils/ShaderUtils';
import customEvents from './custom-events';

/**
 * @typedef {{x: number, y: number, z: number}} Vector3Like
 */

/**
 * @typedef {object} Animation
 * @property {number} startTime
 * @property {number} duration
 * @property {boolean} active
 * @property {Vector3Like} startPosition
 * @property {Vector3Like} endPosition
 * @property {Vector3Like} [startRotation]
 * @property {Vector3Like} [endRotation]
 */

/**
 * This simplified version uses a lock mechanism to ensure
 * only one animation sequence can run at a time, period.
 * No overlaps, no glitches, guaranteed.
 */
export class SimpleLockThreeScene {
    /**
     * Constructs a new SimpleLockThreeScene instance.
     * Initializes Three.js components, utilities, animation states, and binds methods.
     */
    constructor() {
        // All the standard initialization
        /** @type {HTMLElement | null} */
        this.container = null;
        /** @type {number} */
        this.width = 0;
        /** @type {number} */
        this.height = 0;
        /** @type {THREE.Scene} */
        this.scene = new THREE.Scene();
        /** @type {THREE.PerspectiveCamera} */
        this.camera = new THREE.PerspectiveCamera();
        /** @type {THREE.WebGLRenderer | null} */
        this.renderer = null;
        /** @type {THREE.Clock} */
        this.clock = new THREE.Clock();

        // Initialize utilities
        /** @type {SceneControls | null} */
        this.controls = null;
        /** @type {MaterialUtils} */
        this.materialUtils = new MaterialUtils();
        /** @type {ShaderUtils} */
        this.shaderUtils = new ShaderUtils();

        // Animation state
        /** @type {string | null} */
        this.animationState = null;

        // Bind methods
        this.animate = this.animate.bind(this);
        this.handleTextureUpload = this.handleTextureUpload.bind(this);

        // Animation configurations
        /** @type {{ startTime: number, duration: number, startPosition: { x: number, y: number, z: number }, endPosition: { x: number, y: number, z: number }, active: boolean }} */
        this.recordCoverAnimation = {
            startTime: 0,
            duration: 2000,
            startPosition: { x: 0, y: -20, z: 0 },
            endPosition: { x: 0, y: 20, z: 0 },
            active: false
        };

        const vinylStartingPositionPoppingOutOfSleeve = { x: 0, y: 20, z: 8 };

        /** @type {{ startTime: number, duration: number, startPosition: { x: number, y: number, z: number }, endPosition: { x: number, y: number, z: number }, active: boolean }} */
        this.vinylRecordAnimation = {
            startTime: 0,
            duration: 2000,
            startPosition: { x: 0, y: 20, z: 0 },
            endPosition: vinylStartingPositionPoppingOutOfSleeve,
            active: false
        };

        /** @type {{ startTime: number, duration: number, startPosition: { x: number, y: number, z: number }, endPosition: { x: number, y: number, z: number }, startRotation: { x: number, y: number, z: number }, endRotation: { x: number, y: number, z: number }, active: boolean }} */
        this.vinylInteractionAnimation = {
            startTime: 0,
            duration: 2000,
            startPosition: vinylStartingPositionPoppingOutOfSleeve,
            endPosition: { x: 0, y: 20, z: 0 },
            startRotation: { x: 0, y: 0, z: 0 },
            endRotation: { x: 0, y: -Math.PI * 2, z: 0 },
            active: false
        };

        /** @type {{ startTime: number, duration: number, startPosition: { x: number, y: number, z: number }, endPosition: { x: number, y: number, z: number }, active: boolean }} */
        this.recordCoverInteractionAnimation = {
            startTime: 0,
            duration: 2000,
            startPosition: { x: 0, y: 20, z: 0 },
            endPosition: { x: 0, y: 20, z: -30 },
            active: false
        };

        /** @type {{ startTime: number, duration: number, startPosition: { x: number, y: number, z: number }, endPosition: { x: number, y: number, z: number }, active: boolean }} */
        this.revertRecordCoverInteractionAnimation = {
            startTime: 0,
            duration: 2000,
            startPosition: { x: 0, y: 20, z: -30 },
            endPosition: { x: 0, y: 20, z: 0 },
            active: false
        };

        /** @type {{ startTime: number, duration: number, startPosition: { x: number, y: number, z: number }, endPosition: { x: number, y: number, z: number }, startRotation: { x: number, y: number, z: number }, endRotation: { x: number, y: number, z: number }, active: boolean }} */
        this.revertVinylInteractionAnimation = {
            startTime: 0,
            duration: 2000,
            startPosition: { x: 0, y: 20, z: 0 },
            endPosition: vinylStartingPositionPoppingOutOfSleeve,
            startRotation: { x: 0, y: -Math.PI * 2, z: 0 },
            endRotation: { x: 0, y: 0, z: 0 },
            active: false
        };

        // Displacement effects
        /** @type {DisplacementShaderEffects} */
        this.displacementEffects = new DisplacementShaderEffects();
        /** @type {string} */
        this.currentDisplacementEffect = this.displacementEffects.effects.wave;
        /** @type {THREE.Texture | null} */
        this.currentTexture = null;
        /** @type {boolean} */
        this.useDisplacementShader = false; // Added missing property

        // SIMPLE LOCK MECHANISM - This is the key!
        /** @type {string | null} */
        this.animationLock = null; // Stores the current animation type
        /** @type {string[]} */
        this.animationQueue = [];

        // Track which sub-animations have been triggered
        /** @type {Set<string>} */
        this.triggeredSubAnimations = new Set();

        /** @type {RecordModel | null} */
        this.recordModel = null; // Added missing property
        /** @type {THREE.Mesh | null} */
        this.recordCover = null; // Added missing property
        /** @type {THREE.Group | null} */
        this.vinylRecord = null; // Added missing property
    }

    /**
     * The core lock mechanism - ensures only one animation sequence at a time
     * @param {string} animationType - Type of animation to request
     * @returns {boolean} - Whether animation was started or queued
     */
    requestAnimation(animationType) {
        // If we're already running this exact animation, ignore
        if (this.animationLock === animationType) {
            return false;
        }

        // If another animation is running, queue this one
        if (this.animationLock !== null) {
            // Avoid duplicate entries in queue
            if (!this.animationQueue.includes(animationType)) {
                this.animationQueue.push(animationType);
            }
            return false;
        }

        // Check if animation is allowed based on state
        if (!this.canStartAnimation(animationType)) {
            return false;
        }

        // Lock acquired! Start the animation
        this.animationLock = animationType;
        this.triggeredSubAnimations.clear(); // Reset sub-animation tracking
        this.startAnimationSequence(animationType);
        return true;
    }

    /**
     * Check if animation can start based on current state
     * @param {string} animationType - Type of animation to check
     * @returns {boolean} - Whether the animation is allowed to start
     */
    canStartAnimation(animationType) {
        switch (animationType) {
            case 'initial':
                return this.animationState === null;
            case 'vinyl-show':
                return this.animationState === 'initial';
            case 'vinyl-hide':
                return this.animationState === 'vinyl-view';
            default:
                return false;
        }
    }

    /**
     * Start an animation sequence - this is the ONLY place active flags are set
     * @param {string} animationType - Type of animation sequence to start
     */
    startAnimationSequence(animationType) {

        // Reset all animations first to ensure clean state
        this.resetAllAnimations();

        switch (animationType) {
            case 'initial':
                this.recordCoverAnimation.active = true;
                break;

            case 'vinyl-show':
                this.recordCoverInteractionAnimation.active = true;
                // Vinyl animation will be triggered when cover is 50% done
                break;

            case 'vinyl-hide':
                this.revertRecordCoverInteractionAnimation.active = true;
                // Vinyl revert will be triggered when cover is 50% done
                break;
        }
    }

    /**
     * Reset all animation states
     */
    resetAllAnimations() {
        this.recordCoverAnimation.active = false;
        this.recordCoverAnimation.startTime = 0;

        this.vinylRecordAnimation.active = false;
        this.vinylRecordAnimation.startTime = 0;

        this.vinylInteractionAnimation.active = false;
        this.vinylInteractionAnimation.startTime = 0;

        this.recordCoverInteractionAnimation.active = false;
        this.recordCoverInteractionAnimation.startTime = 0;

        this.revertRecordCoverInteractionAnimation.active = false;
        this.revertRecordCoverInteractionAnimation.startTime = 0;

        this.revertVinylInteractionAnimation.active = false;
        this.revertVinylInteractionAnimation.startTime = 0;
    }

    /**
     * Called when an animation sequence completes
     */
    completeAnimationSequence() {
        console.log(`Completed animation: ${this.animationLock}`);

        // Clear the lock
        this.animationLock = null;

        // Process queue after a short delay
        setTimeout(() => {
            if (this.animationQueue.length > 0) {
                const next = this.animationQueue.shift();
                if (next) this.requestAnimation(next);
            }
        }, 100);
    }

    /**
     * Check if all animations in a sequence are complete
     * @param {string} animationType - Type of animation sequence to check
     * @returns {boolean} - True if the sequence is complete, false otherwise
     */
    isSequenceComplete(animationType) {
        switch (animationType) {
            case 'initial':
                return !this.recordCoverAnimation.active && !this.vinylRecordAnimation.active;
            case 'vinyl-show':
                return !this.recordCoverInteractionAnimation.active && !this.vinylInteractionAnimation.active;
            case 'vinyl-hide':
                return !this.revertRecordCoverInteractionAnimation.active && !this.revertVinylInteractionAnimation.active;
            default:
                return true;
        }
    }

    /**
     * Initializes the Three.js scene, camera, renderer, and controls.
     * Creates the record models and adds lights. Sets up event listeners.
     * @param {HTMLElement} container - The DOM element to contain the Three.js renderer.
     */
    init(container) {
        this.container = container;
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 200000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setClearColor(0x000000, 0);

        // Set up scene and controls
        this.setupScene(container);

        // Create models
        this.recordModel = new RecordModel(this.scene);
        this.recordCover = /** @type {THREE.Mesh} */ (this.recordModel.createRecordCover());
        this.vinylRecord = /** @type {THREE.Group} */ (this.recordModel.createVinylRecord());
        this.vinylRecord.visible = false;

        // Add lights
        this.addLights();

        // Set up event listeners
        window.addEventListener('resize', () => this.resize(), false);

        // Event listeners use our lock system
        window.addEventListener(customEvents.changeRecordColorInOut, (/** @type {*} */ e) => {
            if (this.recordModel) {
                this.recordModel.changeRecordColor(e.detail.color[0]);
                this.requestAnimation('vinyl-show');

                setTimeout(() => {
                    this.requestAnimation('vinyl-hide');
                }, 3000);
            }
        });

        window.addEventListener(customEvents.changeRecordColorOut, (/** @type {*} */ e) => {
            if (this.recordModel) {
                this.recordModel.changeRecordColor(e.detail.color);
                this.requestAnimation('vinyl-show');
            }
        });

        window.addEventListener(customEvents.recordBackIn, (e) => {
            this.requestAnimation('vinyl-hide');
        });

        window.addEventListener(customEvents.changeRecordColor, (/** @type {*} */ e) => {
            if (this.recordModel) {
                this.recordModel.changeRecordColor(e.detail.color);
            }
        });

        // Start initial animation
        this.requestAnimation('initial');
    }

    /**
     * Sets up the Three.js scene, renderer, and controls.
     * @param {HTMLElement} container - The DOM element to append the renderer's canvas to.
     */
    setupScene(container) {
        this.camera.position.set(45, 20, 0);
        if (!this.renderer) {
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
        }
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.shadowMap.enabled = true;
        container.appendChild(this.renderer.domElement);

        this.controls = new SceneControls(this.camera, this.renderer.domElement);
    }

    /**
     * Adds ambient and directional lights to the scene.
     */
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

    /**
     * The main animation loop. Requests the next frame and updates animations,
     * shaders, controls, and renders the scene.
     */
    animate() {
        requestAnimationFrame(this.animate);

        // Run animations
        this.runInitialRecordAnimation();
        this.runVinylInteractionAnimation();
        this.runRevertVinylInteractionAnimation();
        
        // Update color animation
        if (this.recordModel) {
            this.recordModel.updateColorAnimation();
        }

        // Check if current animation sequence is complete
        if (this.animationLock && this.isSequenceComplete(this.animationLock)) {
            this.completeAnimationSequence();
        }

        // Update shader if active
        if (this.shaderUtils.isShaderActive() && this.recordCover) {
            this.shaderUtils.updateShader();
            this.recordCover.material = /** @type {THREE.Material} */ (this.shaderUtils.getMaterial());
        }

        if (this.useDisplacementShader && this.displacementEffects) {
            this.displacementEffects.update();
            this.displacementEffects.updateOscillatingIntensity();
        }

        // Update scene
        if (this.controls) this.controls.update();
        if (this.renderer) this.renderer.render(this.scene, this.camera);
    }

    // Keep all existing helper methods
    /**
     * Cubic ease-out function.
     * @param {number} x - The input value (typically between 0 and 1).
     * @returns {number} - The eased output value.
     */
    easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }

    /**
     * Calculates the progress of an animation based on elapsed time and duration.
     * @param {Animation} animation - The animation object with startTime, duration, and active properties.
     * @returns {number} - The eased animation progress (0 to 1), or -1 if the animation is not active.
     */
    calculateAnimationProgress(animation) {
        if (!animation?.active) return -1;

        if (!animation.startTime) {
            animation.startTime = Date.now();
        }

        const elapsed = Date.now() - animation.startTime;
        const progress = Math.min(elapsed / animation.duration, 1);
        const easedProgress = this.easeOutCubic(progress);

        if (progress === 1) {
            animation.active = false;
            animation.startTime = 0;
        }

        return easedProgress;
    }

    /**
     * Interpolates the position of a Three.js object.
     * @param {THREE.Object3D} object - The object to interpolate.
     * @param {Vector3Like} startPos - The starting position {x, y, z}.
     * @param {Vector3Like} endPos - The ending position {x, y, z}.
     * @param {number} progress - The interpolation progress (0 to 1).
     */
    interpolatePosition(object, startPos, endPos, progress) {
        if (!object || !startPos || !endPos) return;

        const axes = /** @type {('x' | 'y' | 'z')[]} */ (['x', 'y', 'z']);
        axes.forEach((axis) => {
            if (startPos[axis] !== undefined && endPos[axis] !== undefined) {
                object.position[axis] = startPos[axis] + (endPos[axis] - startPos[axis]) * progress;
            }
        });
    }

    /**
     * Interpolates the rotation of a Three.js object around the Y axis.
     * @param {THREE.Object3D} object - The object to interpolate.
     * @param {Vector3Like} startRot - The starting rotation {y}.
     * @param {Vector3Like} endRot - The ending rotation {y}.
     * @param {number} progress - The interpolation progress (0 to 1).
     */
    interpolateRotation(object, startRot, endRot, progress) {
        if (!object || !startRot || !endRot) return;

        const axes = /** @type {('x' | 'y' | 'z')[]} */ (['y']);
        axes.forEach((axis) => {
            if (startRot[axis] !== undefined && endRot[axis] !== undefined) {
                // @ts-ignore
                object.rotation[axis] = startRot[axis] + (endRot[axis] - startRot[axis]) * progress;
            }
        });
    }

    /**
     * CRITICAL: Modified animation methods that NEVER manipulate active flags directly
     * They only read the flags set by the lock system
     * Runs the initial record cover and vinyl record animations.
     */
    runInitialRecordAnimation() {
        // NO STATE CHECKS! Just run if active
        const coverProgress = this.calculateAnimationProgress(this.recordCoverAnimation);

        if (coverProgress >= 0 && this.recordCover) {
            this.interpolatePosition(this.recordCover, this.recordCoverAnimation.startPosition, this.recordCoverAnimation.endPosition, coverProgress);

            // When cover completes, trigger vinyl if this is the initial sequence
            if (coverProgress === 1 && this.animationLock === 'initial') {
                if (!this.triggeredSubAnimations.has('vinyl-initial')) {
                    if (this.recordModel?.vinylRecord) this.recordModel.vinylRecord.visible = true;
                    this.vinylRecordAnimation.active = true;
                    this.triggeredSubAnimations.add('vinyl-initial');
                }
                this.animationState = 'initial';
            }
        }

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

    /**
     * Runs the record cover and vinyl record interaction animations (vinyl show).
     */
    runVinylInteractionAnimation() {
        // NO FORCED STOPS! Let animations complete naturally
        const coverProgress = this.calculateAnimationProgress(this.recordCoverInteractionAnimation);

        if (coverProgress >= 0 && this.recordModel?.recordCover) {
            this.interpolatePosition(
                this.recordModel.recordCover,
                this.recordCoverInteractionAnimation.startPosition,
                this.recordCoverInteractionAnimation.endPosition,
                coverProgress
            );

            // Trigger vinyl animation at 50% if we're in the right sequence
            if (coverProgress > 0.5 && this.animationLock === 'vinyl-show') {
                if (!this.triggeredSubAnimations.has('vinyl-show')) {
                    this.vinylInteractionAnimation.active = true;
                    this.triggeredSubAnimations.add('vinyl-show');
                }
            }
        }

        const vinylProgress = this.calculateAnimationProgress(this.vinylInteractionAnimation);

        if (vinylProgress >= 0 && this.recordModel?.vinylRecord) {
            this.interpolatePosition(
                this.recordModel.vinylRecord,
                this.vinylInteractionAnimation.startPosition,
                this.vinylInteractionAnimation.endPosition,
                vinylProgress
            );

            // Rotation animation
            // this.interpolateRotation(
            //     this.recordModel.vinylRecord,
            //     this.vinylInteractionAnimation.startRotation,
            //     this.vinylInteractionAnimation.endRotation,
            //     vinylProgress
            // );

            if (vinylProgress === 1 && this.animationLock === 'vinyl-show') {
                this.animationState = 'vinyl-view';
            }
        }
    }

    /**
     * Runs the record cover and vinyl record revert interaction animations (vinyl hide).
     */
    runRevertVinylInteractionAnimation() {
        // NO FORCED STOPS!
        const coverProgress = this.calculateAnimationProgress(this.revertRecordCoverInteractionAnimation);

        if (coverProgress >= 0 && this.recordModel?.recordCover) {
            this.interpolatePosition(
                this.recordModel.recordCover,
                this.revertRecordCoverInteractionAnimation.startPosition,
                this.revertRecordCoverInteractionAnimation.endPosition,
                coverProgress
            );

            // Trigger vinyl revert at 50%
            if (coverProgress > 0.5 && this.animationLock === 'vinyl-hide') {
                if (!this.triggeredSubAnimations.has('vinyl-hide')) {
                    this.revertVinylInteractionAnimation.active = true;
                    this.triggeredSubAnimations.add('vinyl-hide');
                }
            }
        }

        const vinylProgress = this.calculateAnimationProgress(this.revertVinylInteractionAnimation);

        if (vinylProgress >= 0 && this.recordModel?.vinylRecord) {
            this.interpolatePosition(
                this.recordModel.vinylRecord,
                this.revertVinylInteractionAnimation.startPosition,
                this.revertVinylInteractionAnimation.endPosition,
                vinylProgress
            );

            // Rotation animation
            // this.interpolateRotation(
            //     this.recordModel.vinylRecord,
            //     this.revertVinylInteractionAnimation.startRotation,
            //     this.revertVinylInteractionAnimation.endRotation,
            //     vinylProgress
            // );

            if (vinylProgress === 1 && this.animationLock === 'vinyl-hide') {
                this.animationState = 'initial';
            }
        }
    }

    // All other methods remain unchanged...
    /**
     * Handles the file upload event for a texture.
     * @param {Event} event - The file input change event.
     */
    handleTextureUpload(event) {
        const target = /** @type {HTMLInputElement} */ (event.target);
        if (!target?.files) return;
        const file = target.files[0];
        if (file && this.recordCover && this.renderer) {
            this.materialUtils.loadTextureFromFile(file, this.renderer, (/** @type {*} */ material) => {
                if (!this.recordCover) return;
                this.recordCover.material = material;
            });
        }
    }

    /**
     * Updates the material texture of the record cover from a URL.
     * @param {string} textureUrl - The URL of the texture image.
     * @returns {Promise<THREE.Material|undefined>} - A promise that resolves with the updated material, or undefined if the record cover is not found.
     */
    async updateMaterialTexture(textureUrl) {
        const material = await this.materialUtils.updateMaterialTexture(textureUrl);
        if (!this.recordCover) {
            return;
        }
        this.recordCover.material = material;
        return material; // Added return for consistency with JSDoc
    }

    /**
     * Resizes the renderer and camera based on the container's dimensions.
     */
    resize() {
        if (!this.container || !this.renderer) return;

        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    /**
     * Toggles the displacement shader effect on the record cover.
     * Cycles through available effects.
     * @param {string} [effectType='ripple'] - The type of displacement effect to use initially.
     * @param {number} [intensity=0.1] - The intensity of the displacement effect.
     * @returns {boolean} - The new state of the displacement shader (active or inactive).
     */
    toggleDisplacementShader(effectType = 'ripple', intensity = 0.1) {
        if (
            !this.recordCover ||
            !this.recordCover.material
            // || !this.recordCover.material.map
        ) {
            return false;
        }
        this.displacementEffects.oscillatorTime = 0;
        // @ts-ignore
        if (this.recordCover.material.map) {
            // @ts-ignore
            this.currentTexture = this.recordCover.material.map;
        } else {
        }

        // Toggle the effect on/off
        this.useDisplacementShader = !this.useDisplacementShader;

        const currentIndex = Object.keys(this.displacementEffects.effects).indexOf(this.currentDisplacementEffect);
        const nextShader = Object.keys(this.displacementEffects.effects)[(currentIndex + 1) % Object.keys(this.displacementEffects.effects).length];

        if (this.useDisplacementShader && this.currentTexture) {
            // Apply the selected displacement effect
            const material = this.displacementEffects.createShader(this.currentTexture, this.currentDisplacementEffect, intensity);
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

    /**
     * Changes the active displacement effect if the shader is currently active.
     * @param {string} effectType - The type of displacement effect to switch to.
     */
    changeDisplacementEffect(effectType) {
        if (this.useDisplacementShader && this.displacementEffects) {
            const material = this.displacementEffects.changeEffect(effectType);
            if (this.recordCover && material) {
                this.recordCover.material = material;
            }
        }
    }

    /**
     * Updates the intensity of the active displacement shader.
     * @param {number} intensity - The new intensity value.
     */
    updateDisplacementIntensity(intensity) {
        if (this.shaderUtils.isDisplacementShaderActive()) {
            this.shaderUtils.updateDisplacementIntensity(intensity);
        }
    }

    /**
     * Toggles a generic shader effect on the record cover.
     */
    toggleShader() {
        if (this.recordCover) {
            const isActive = this.shaderUtils.toggleShader();
            const shaderMaterial = this.shaderUtils.getMaterial();
            if (isActive && shaderMaterial) {
                this.recordCover.material = shaderMaterial
            } else {
                this.recordCover.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
            }
        }
    }

    /**
     * Disposes of Three.js resources (renderer, scene, geometry, materials, textures).
     * Removes event listeners.
     */
    dispose() {
        if (!this.renderer) return;

        // Clear any pending animations
        this.animationLock = null;
        this.animationQueue = [];
        this.resetAllAnimations();

        this.renderer.dispose();
        this.scene.traverse((object) => {
            const mesh = /** @type {THREE.Mesh} */ (object);
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                const material = /** @type {THREE.MeshBasicMaterial} */ (mesh.material);
                if (material.map) material.map.dispose();
                material.dispose();
            }
        });

        window.removeEventListener('resize', () => this.resize(), false);
    }

    /**
     * Debug information
     * @returns {object} - An object containing current animation debug information.
     */
    getDebugInfo() {
        return {
            currentLock: this.animationLock,
            queue: this.animationQueue,
            state: this.animationState,
            activeAnimations: {
                recordCover: this.recordCoverAnimation.active,
                vinyl: this.vinylRecordAnimation.active,
                coverInteraction: this.recordCoverInteractionAnimation.active,
                vinylInteraction: this.vinylInteractionAnimation.active,
                coverRevert: this.revertRecordCoverInteractionAnimation.active,
                vinylRevert: this.revertVinylInteractionAnimation.active
            },
            triggeredSubs: Array.from(this.triggeredSubAnimations)
        };
    }
}

export default SimpleLockThreeScene;
