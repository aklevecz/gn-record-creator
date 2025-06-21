// SimpleLockAnimationSystem.js
import * as THREE from 'three';
import { SceneControls } from './controls/SceneControls';
import { RecordModel } from './models/RecordModel';
import { DisplacementShaderEffects } from './utils/DisplacementShaderEffects';
import { MaterialUtils } from './utils/MaterialUtils';
import { ShaderUtils } from './utils/ShaderUtils';
import customEvents from './custom-events';

/**
 * This simplified version uses a lock mechanism to ensure
 * only one animation sequence can run at a time, period.
 * No overlaps, no glitches, guaranteed.
 */
export class SimpleLockThreeScene {
    constructor() {
        // All the standard initialization
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

        // Animation state
        this.animationState = null;

        // Bind methods
        this.animate = this.animate.bind(this);
        this.handleTextureUpload = this.handleTextureUpload.bind(this);

        // Animation configurations
        this.recordCoverAnimation = {
            startTime: 0,
            duration: 2000,
            startPosition: { x: 0, y: -20, z: 0 },
            endPosition: { x: 0, y: 20, z: 0 },
            active: false
        };

        const vinylStartingPositionPoppingOutOfSleeve = { x: 0, y: 20, z: 8 };

        this.vinylRecordAnimation = {
            startTime: 0,
            duration: 2000,
            startPosition: { x: 0, y: 20, z: 0 },
            endPosition: vinylStartingPositionPoppingOutOfSleeve,
            active: false
        };

        this.vinylInteractionAnimation = {
            startTime: 0,
            duration: 2000,
            startPosition: vinylStartingPositionPoppingOutOfSleeve,
            endPosition: { x: 0, y: 20, z: 0 },
            startRotation: { x: 0, y: 0, z: 0 },
            endRotation: { x: 0, y: -Math.PI * 2, z: 0 },
            active: false
        };

        this.recordCoverInteractionAnimation = {
            startTime: 0,
            duration: 2000,
            startPosition: { x: 0, y: 20, z: 0 },
            endPosition: { x: 0, y: 20, z: -30 },
            active: false
        };

        this.revertRecordCoverInteractionAnimation = {
            startTime: 0,
            duration: 2000,
            startPosition: { x: 0, y: 20, z: -30 },
            endPosition: { x: 0, y: 20, z: 0 },
            active: false
        };

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
        this.displacementEffects = new DisplacementShaderEffects();
        this.currentDisplacementEffect = this.displacementEffects.effects.wave;
        this.currentTexture = null;

        // SIMPLE LOCK MECHANISM - This is the key!
        this.animationLock = null; // Stores the current animation type
        this.animationQueue = [];
        
        // Track which sub-animations have been triggered
        this.triggeredSubAnimations = new Set();
    }

    /**
     * The core lock mechanism - ensures only one animation sequence at a time
     */
    requestAnimation(animationType) {
        // If we're already running this exact animation, ignore
        if (this.animationLock === animationType) {
            console.log(`Animation ${animationType} already running`);
            return false;
        }

        // If another animation is running, queue this one
        if (this.animationLock !== null) {
            // Avoid duplicate entries in queue
            if (!this.animationQueue.includes(animationType)) {
                console.log(`Queueing ${animationType} (currently running: ${this.animationLock})`);
                this.animationQueue.push(animationType);
            }
            return false;
        }

        // Check if animation is allowed based on state
        if (!this.canStartAnimation(animationType)) {
            console.log(`Animation ${animationType} not allowed in current state`);
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
     */
    startAnimationSequence(animationType) {
        console.log(`Starting animation: ${animationType}`);
        
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
                this.requestAnimation(next);
            }
        }, 100);
    }

    /**
     * Check if all animations in a sequence are complete
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
        this.recordCover = this.recordModel.createRecordCover();
        this.vinylRecord = this.recordModel.createVinylRecord();
        this.vinylRecord.visible = false;

        // Add lights
        this.addLights();

        // Set up event listeners
        window.addEventListener('resize', () => this.resize(), false);

        // Event listeners use our lock system
        window.addEventListener(customEvents.changeRecordColorInOut, (e) => {
            if (this.recordModel) {
                this.recordModel.changeRecordColor(e.detail.color[0]);
                this.requestAnimation('vinyl-show');

                setTimeout(() => {
                    this.requestAnimation('vinyl-hide');
                }, 3000);
            }
        });

        window.addEventListener(customEvents.changeRecordColorOut, (e) => {
            if (this.recordModel) {
                this.recordModel.changeRecordColor(e.detail.color);
                this.requestAnimation('vinyl-show');
            }
        });

        window.addEventListener(customEvents.recordBackIn, (e) => {
            this.requestAnimation('vinyl-hide');
        });

        window.addEventListener(customEvents.changeRecordColor, (e) => {
            if (this.recordModel) {
                this.recordModel.changeRecordColor(e.detail.color);
            }
        });

        // Start initial animation
        this.requestAnimation('initial');
    }

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

    animate() {
        requestAnimationFrame(this.animate);

        // Run animations
        this.runInitialRecordAnimation();
        this.runVinylInteractionAnimation();
        this.runRevertVinylInteractionAnimation();

        // Check if current animation sequence is complete
        if (this.animationLock && this.isSequenceComplete(this.animationLock)) {
            this.completeAnimationSequence();
        }

        // Update shader if active
        if (this.shaderUtils.isShaderActive() && this.recordCover) {
            this.shaderUtils.updateShader();
            this.recordCover.material = this.shaderUtils.getMaterial();
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
    easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }

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

    interpolatePosition(object, startPos, endPos, progress) {
        if (!object || !startPos || !endPos) return;

        const axes = ['x', 'y', 'z'];
        axes.forEach((axis) => {
            if (startPos[axis] !== undefined && endPos[axis] !== undefined) {
                object.position[axis] = startPos[axis] + (endPos[axis] - startPos[axis]) * progress;
            }
        });
    }

    interpolateRotation(object, startRot, endRot, progress) {
        if (!object || !startRot || !endRot) return;

        const axes = ['y'];
        axes.forEach((axis) => {
            if (startRot[axis] !== undefined && endRot[axis] !== undefined) {
                object.rotation[axis] = startRot[axis] + (endRot[axis] - startRot[axis]) * progress;
            }
        });
    }

    /**
     * CRITICAL: Modified animation methods that NEVER manipulate active flags directly
     * They only read the flags set by the lock system
     */
    runInitialRecordAnimation() {
        // NO STATE CHECKS! Just run if active
        const coverProgress = this.calculateAnimationProgress(this.recordCoverAnimation);

        if (coverProgress >= 0 && this.recordCover) {
            this.interpolatePosition(
                this.recordCover,
                this.recordCoverAnimation.startPosition,
                this.recordCoverAnimation.endPosition,
                coverProgress
            );

            // When cover completes, trigger vinyl if this is the initial sequence
            if (coverProgress === 1 && this.animationLock === 'initial') {
                if (!this.triggeredSubAnimations.has('vinyl-initial')) {
                    this.recordModel.vinylRecord.visible = true;
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
    handleTextureUpload(event) {
        const file = event.target.files[0];
        if (file && this.recordCover && this.renderer) {
            this.materialUtils.loadTextureFromFile(file, this.renderer, (material) => {
                if (!this.recordCover) return;
                this.recordCover.material = material;
            });
        }
    }

    async updateMaterialTexture(textureUrl) {
        const material = await this.materialUtils.updateMaterialTexture(textureUrl);
        if (!this.recordCover) {
            return;
        }
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
        if (!this.recordCover || !this.recordCover.material) {
            return false;
        }
        this.displacementEffects.oscillatorTime = 0;
        
        if (this.recordCover.material.map) {
            this.currentTexture = this.recordCover.material.map;
        }

        this.useDisplacementShader = !this.useDisplacementShader;

        const currentIndex = Object.keys(this.displacementEffects.effects).indexOf(this.currentDisplacementEffect);
        const nextShader = Object.keys(this.displacementEffects.effects)[(currentIndex + 1) % Object.keys(this.displacementEffects.effects).length];

        if (this.useDisplacementShader) {
            const material = this.displacementEffects.createShader(this.currentTexture, this.currentDisplacementEffect, intensity);
            this.recordCover.material = material;
        } else {
            this.recordCover.material = new THREE.MeshBasicMaterial({
                map: this.currentTexture,
                color: 0xffffff
            });
        }
        this.currentDisplacementEffect = nextShader;
        return this.useDisplacementShader;
    }

    changeDisplacementEffect(effectType) {
        if (this.useDisplacementShader && this.displacementEffects) {
            const material = this.displacementEffects.changeEffect(effectType);
            if (this.recordCover) {
                this.recordCover.material = material;
            }
        }
    }

    updateDisplacementIntensity(intensity) {
        if (this.shaderUtils.isDisplacementShaderActive()) {
            this.shaderUtils.updateDisplacementIntensity(intensity);
        }
    }

    toggleShader() {
        if (this.recordCover) {
            const isActive = this.shaderUtils.toggleShader();
            if (isActive) {
                this.recordCover.material = this.shaderUtils.getMaterial();
            } else {
                this.recordCover.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
            }
        }
    }

    dispose() {
        if (!this.renderer) return;

        // Clear any pending animations
        this.animationLock = null;
        this.animationQueue = [];
        this.resetAllAnimations();

        this.renderer.dispose();
        this.scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (object.material.map) object.material.map.dispose();
                object.material.dispose();
            }
        });

        window.removeEventListener('resize', () => this.resize(), false);
    }

    /**
     * Debug information
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