const initialRecordCoverAnimation = {
	object: null,
	startTime: 0,
	duration: 2000,
	startPosition: { x: 0, y: -20, z: 0 },
	endPosition: { x: 0, y: 20, z: 0 },
	active: false,
	onComplete: () => {
		// You can define callbacks here
		// For example, create vinyl record after cover animation completes
	}
};

/** @param {object} object */
export function registerAnimation(object) {
  return {
    object,
    startTime: 0,
    duration: 2000,
    startPosition: { x: 0, y: 20, z: 0 },
    endPosition: { x: 0, y: 29, z: 0 },
    active: true
  };
}

/**
 * Sets up animation properties for scene objects
 * @param {import('three').Object3D} recordCover - The record cover object to animate
 * @returns {Object} Animation configurations
 */
export function setupAnimations(recordCover) {
	return {
		recordCover: {
			object: recordCover,
			startTime: 0,
			duration: 2000,
			startPosition: { x: 0, y: -20, z: 0 },
			endPosition: { x: 0, y: 20, z: 0 },
			active: true,
			onComplete: () => {
				// You can define callbacks here
				// For example, create vinyl record after cover animation completes
			}
		},
		vinylRecord: {
			object: null, // This will be set later when vinyl is created
			startTime: 0,
			duration: 2000,
			startPosition: { x: 0, y: 20, z: 0 },
			endPosition: { x: 0, y: 29, z: 0 },
			active: true
		}
	};
}

/**
 * Run animations for scene objects
 * @param {Object} animations - Animation configurations
 */
export function animateObjects(animations) {
	Object.values(animations).forEach((animation) => {
		if (animation.object && animation.active) {
			// Initialize start time on first frame
			if (!animation.startTime) {
				animation.startTime = Date.now();
			}

			// Calculate animation progress
			const elapsed = Date.now() - animation.startTime;
			const progress = Math.min(elapsed / animation.duration, 1);
			const easedProgress = easeOutCubic(progress);

			// Update position
			animation.object.position.y =
				animation.startPosition.y +
				(animation.endPosition.y - animation.startPosition.y) * easedProgress;

			// End animation when complete
			if (progress === 1) {
				console.log(animation);
				animation.active = false;
				if (animation.onComplete) animation.onComplete();
			}
		}
	});
}

/**
 * Easing function for smoother animations
 * @param {number} x - Progress value (0-1)
 * @returns {number} Eased value
 */
export function easeOutCubic(x) {
	return 1 - Math.pow(1 - x, 3);
}
