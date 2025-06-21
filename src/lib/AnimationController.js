// AnimationController.js
/**
 * AnimationController manages all animations in the scene, preventing overlaps
 * and providing a queue system for smooth transitions between states.
 * 
 * The controller works by:
 * 1. Registering animations with their update functions and constraints
 * 2. Managing a single "current" animation at a time
 * 3. Queueing animations that can't run immediately
 * 4. Checking state conditions before starting animations
 * 5. Handling completion callbacks to enable chaining
 */
export class AnimationController {
    constructor() {
        // Track the currently running animation
        this.currentAnimation = null;
        
        // Queue for animations waiting to run
        /** @type {string[]} */
        this.animationQueue = [];
        
        // State machine to track overall animation state
        this.states = {
            IDLE: 'idle',
            INITIAL_LOAD: 'initial-load',
            VINYL_VIEW: 'vinyl-view',
            TRANSITIONING: 'transitioning'
        };
        
        this.currentState = this.states.IDLE;
        
        // Store all registered animations
        this.animations = new Map();
        
        // Optional callbacks for state changes
        this.stateChangeCallbacks = new Map();
        
        // Debug mode for logging animation flow
        this.debugMode = false;
    }
    
    /**
     * Register an animation with the controller
     * This sets up all the rules and behaviors for a specific animation
     */
    
    registerAnimation(name, config) {
        this.animations.set(name, {
            name,
            // Function called each frame while animation is active
            update: config.update || (() => {}),
            // Condition check - must return true for animation to start
            canStart: config.canStart || (() => true),
            // Called when animation completes (progress reaches 1)
            onComplete: config.onComplete || (() => {}),
            // Called when animation starts
            onStart: config.onStart || (() => {}),
            // List of animations that cannot run while this one is active
            blockingAnimations: config.blockingAnimations || [],
            // Duration in milliseconds (optional - animations can self-manage)
            duration: config.duration || null,
            // Current state
            isRunning: false,
            progress: 0,
            startTime: 0,
            params: null
        });
        
        if (this.debugMode) {
            console.log(`Registered animation: ${name}`);
        }
    }
    
    /**
     * Request to play an animation
     * This is the main entry point for triggering animations
     */
    requestAnimation(animationName, params = {}) {
        const animation = this.animations.get(animationName);
        if (!animation) {
            console.warn(`Animation '${animationName}' not registered`);
            return false;
        }
        
        if (this.debugMode) {
            console.log(`Animation requested: ${animationName}`);
        }
        
        // Check if any blocking animations are currently running
        const isBlocked = animation.blockingAnimations.some(blockedName => {
            const blocked = this.animations.get(blockedName);
            return blocked && blocked.isRunning;
        });
        
        // If blocked or another animation is running, queue this one
        if (isBlocked || (this.currentAnimation && this.currentAnimation.name !== animationName)) {
            this.queueAnimation(animationName, params);
            return false;
        }
        
        // Check if animation conditions allow it to start
        if (!animation.canStart(params)) {
            if (this.debugMode) {
                console.log(`Animation '${animationName}' failed canStart check`);
            }
            return false;
        }
        
        // All clear - start the animation
        this.startAnimation(animationName, params);
        return true;
    }
    
    /**
     * Add an animation to the queue for later execution
     */
    queueAnimation(animationName, params) {
        // Prevent duplicate entries in the queue
        const alreadyQueued = this.animationQueue.some(
            item => item.name === animationName
        );
        
        if (!alreadyQueued) {
            this.animationQueue.push({ name: animationName, params });
            if (this.debugMode) {
                console.log(`Animation queued: ${animationName} (queue length: ${this.animationQueue.length})`);
            }
        }
    }
    
    /**
     * Start an animation immediately
     */
    startAnimation(animationName, params) {
        const animation = this.animations.get(animationName);
        if (!animation) return;
        
        // Set up animation state
        animation.isRunning = true;
        animation.progress = 0;
        animation.params = params;
        animation.startTime = Date.now();
        
        // Call the onStart callback
        animation.onStart(params);
        
        // Set as current animation
        this.currentAnimation = animation;
        this.currentState = this.states.TRANSITIONING;
        
        if (this.debugMode) {
            console.log(`Animation started: ${animationName}`);
        }
    }
    
    /**
     * Main update function - call this every frame
     * Returns the current animation progress (0-1) or -1 if no animation
     */
    update(deltaTime) {
        if (!this.currentAnimation) {
            // No animation running, check if we can start one from the queue
            this.processQueue();
            return -1;
        }
        
        // Update the current animation
        const animation = this.currentAnimation;
        
        // Call the animation's update function
        // The update function should return progress (0-1)
        const progress = animation.update(deltaTime, animation.params);
        animation.progress = progress;
        
        // Check if animation is complete
        if (progress >= 1) {
            this.completeAnimation(animation);
        }
        
        return progress;
    }
    
    /**
     * Handle animation completion
     */
    completeAnimation(animation) {
        animation.isRunning = false;
        animation.progress = 1;
        
        if (this.debugMode) {
            console.log(`Animation completed: ${animation.name}`);
        }
        
        // Call completion callback - this is where chaining happens
        animation.onComplete(animation.params);
        
        // Clear current animation
        this.currentAnimation = null;
        
        // Check if there are queued animations
        this.processQueue();
    }
    
    /**
     * Process the animation queue
     * Attempts to start the next queued animation if conditions allow
     */
    processQueue() {
        if (this.animationQueue.length === 0) {
            // No animations waiting, set state to idle
            if (this.currentState === this.states.TRANSITIONING) {
                this.currentState = this.states.IDLE;
            }
            return;
        }
        
        // Get the next animation in queue
        const next = this.animationQueue[0];
        const animation = this.animations.get(next.name);
        
        if (!animation) {
            // Invalid animation, remove from queue
            this.animationQueue.shift();
            this.processQueue();
            return;
        }
        
        // Check if any blocking animations are running
        const isBlocked = animation.blockingAnimations.some(blockedName => {
            const blocked = this.animations.get(blockedName);
            return blocked && blocked.isRunning;
        });
        
        // If not blocked and conditions are met, start the animation
        if (!isBlocked && animation.canStart(next.params)) {
            this.animationQueue.shift();
            this.startAnimation(next.name, next.params);
        } else if (this.debugMode) {
            console.log(`Queued animation '${next.name}' cannot start yet`);
        }
    }
    
    /**
     * Force stop all animations and clear the queue
     * Useful for reset scenarios or error recovery
     */
    reset() {
        if (this.currentAnimation) {
            this.currentAnimation.isRunning = false;
            this.currentAnimation.progress = 0;
        }
        this.currentAnimation = null;
        this.animationQueue = [];
        this.currentState = this.states.IDLE;
        
        // Reset all animation states
        this.animations.forEach(animation => {
            animation.isRunning = false;
            animation.progress = 0;
        });
        
        if (this.debugMode) {
            console.log('Animation controller reset');
        }
    }
    
    /**
     * Get current state information
     * Useful for debugging or UI updates
     */
    getState() {
        return {
            currentState: this.currentState,
            isAnimating: !!this.currentAnimation,
            currentAnimationName: this.currentAnimation?.name,
            currentAnimationProgress: this.currentAnimation?.progress || 0,
            queueLength: this.animationQueue.length,
            queuedAnimations: this.animationQueue.map(item => item.name)
        };
    }
    
    /**
     * Enable or disable debug logging
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }
    
    /**
     * Check if a specific animation is currently running
     */
    isAnimationRunning(animationName) {
        const animation = this.animations.get(animationName);
        return animation ? animation.isRunning : false;
    }
    
    /**
     * Get progress of a specific animation (0-1)
     * Returns -1 if animation is not running
     */
    getAnimationProgress(animationName) {
        const animation = this.animations.get(animationName);
        return animation && animation.isRunning ? animation.progress : -1;
    }
}