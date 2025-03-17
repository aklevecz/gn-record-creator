import * as THREE from 'three';

/**
 * Advanced displacement shader that offers multiple displacement effects
 */
export class DisplacementShaderEffects {
	constructor() {
		this.time = 0;
		this.oscillatorTime = 0;
		this.currentEffect = 'ripple'; // Default effect
		this.intensity = 0.01;
		this.shaderMaterial = null;
		this.texture = null;
	}

	/**
	 * Available displacement effects
	 * @returns {Object} Object containing all available effect types
	 */
	get effects() {
		return {
			wave: 'wave', // Simple sine wave displacement
			ripple: 'ripple', // Circular ripple effect
			zoom: 'zoom', // Pulsing zoom effect
			twist: 'twist', // Twisting/rotation effect
			pixelate: 'pixelate' // Pixelation effect
		};
	}

	/**
	 * Create a shader material with the specified effect
	 * @param {THREE.Texture} texture - The texture to displace
	 * @param {string} effectType - The type of displacement effect
	 * @param {number} intensity - The intensity of the effect (0.001-0.1)
	 * @returns {THREE.ShaderMaterial} The created shader material
	 */
	createShader(texture, effectType = 'wave', intensity = 0.01) {
		this.texture = texture;
		this.currentEffect = effectType;
		this.intensity = intensity;

		const vertexShader = `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

		// Choose the appropriate fragment shader based on effect type
		let fragmentShader;

		switch (effectType) {
			case 'ripple':
				fragmentShader = this.getRippleShader();
				break;
			case 'zoom':
				fragmentShader = this.getZoomShader();
				break;
			case 'twist':
				fragmentShader = this.getTwistShader();
				break;
			case 'pixelate':
				fragmentShader = this.getPixelateShader();
				break;
			case 'wave':
			default:
				fragmentShader = this.getWaveShader();
		}

		// Create the shader material with the selected effect
		this.shaderMaterial = new THREE.ShaderMaterial({
			uniforms: {
				tDiffuse: { value: texture },
				time: { value: this.time },
				intensity: { value: intensity },
				resolution: { value: new THREE.Vector2(1024, 1024) }
			},
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			side: THREE.DoubleSide
		});

		return this.shaderMaterial;
	}

	/**
	 * Update the shader animation time
	 * @param {number} deltaTime - Time since last update
	 */
	update(deltaTime = 0.01) {
		this.time += deltaTime;

		if (this.shaderMaterial) {
			this.shaderMaterial.uniforms.time.value = this.time;
		}
	}

	/**
	 * Updates the intensity with a sine oscillation that starts at exactly 0
	 */
	updateOscillatingIntensity() {
		if (this.shaderMaterial) {
			// Calculate oscillating intensity between 0 and 10
			const minIntensity = 0.0;
			const maxIntensity = 1.0;
			const range = maxIntensity - minIntensity;

			// Use sine wave starting from -π/2 to ensure we begin at 0
			// sin(-π/2) = -1, so (sin(-π/2 + this.oscillatorTime) + 1)/2 = 0 when this.oscillatorTime = 0
			const oscillationFactor = (Math.sin(-Math.PI / 2 + this.oscillatorTime) + 1) / 2;
			const newIntensity = minIntensity + range * oscillationFactor;

			// Update intensity uniform
			this.shaderMaterial.uniforms.intensity.value = newIntensity;

			// Increment oscillator time for next frame
			this.oscillatorTime += 0.01;
		}
	}

	/**
	 * Change the effect type
	 * @param {string} effectType - The new effect type
	 */
	changeEffect(effectType) {
		if (this.effects[effectType] && this.texture) {
			this.currentEffect = effectType;
			return this.createShader(this.texture, effectType, this.intensity);
		}
		return this.shaderMaterial;
	}

	/**
	 * Update the effect intensity
	 * @param {number} intensity - The new intensity value
	 */
	updateIntensity(intensity) {
		this.intensity = intensity;

		if (this.shaderMaterial) {
			this.shaderMaterial.uniforms.intensity.value = intensity;
		}
	}

	/**
	 * Simple wave displacement shader
	 * @returns {string} Fragment shader code
	 */
	getWaveShader() {
		return `
      uniform sampler2D tDiffuse;
      uniform float time;
      uniform float intensity;
      varying vec2 vUv;
      
      void main() {
        // Wave displacement effect
        vec2 displacedUV = vUv;
        displacedUV.x += sin(vUv.y * 10.0 + time) * intensity;
        displacedUV.y += sin(vUv.x * 10.0 + time) * intensity;
        
        // Sample the texture with displaced UVs
        vec4 texColor = texture2D(tDiffuse, displacedUV);
        
        gl_FragColor = texColor;
      }
    `;
	}

	/**
	 * Ripple effect shader
	 * @returns {string} Fragment shader code
	 */
	getRippleShader() {
		return `
      uniform sampler2D tDiffuse;
      uniform float time;
      uniform float intensity;
      varying vec2 vUv;
      
      void main() {
        // Center the coordinates
        vec2 centeredUV = vUv - 0.5;
        float dist = length(centeredUV);
        
        // Create ripples from the center
        float ripple = sin(dist * 50.0 - time * 2.0) * intensity;
        
        // Apply the ripple effect
        vec2 displacedUV = vUv + normalize(centeredUV) * ripple;
        
        // Sample the texture with displaced UVs
        vec4 texColor = texture2D(tDiffuse, displacedUV);
        
        gl_FragColor = texColor;
      }
    `;
	}

	/**
	 * Zoom pulse effect shader
	 * @returns {string} Fragment shader code
	 */
	getZoomShader() {
		return `
      uniform sampler2D tDiffuse;
      uniform float time;
      uniform float intensity;
      varying vec2 vUv;
      
      void main() {
        // Center the coordinates
        vec2 centeredUV = vUv - 0.5;
        
        // Create a pulsing zoom effect
        float pulse = sin(time) * intensity;
        vec2 displacedUV = centeredUV * (1.0 + pulse) + 0.5;
        
        // Check bounds
        if (displacedUV.x < 0.0 || displacedUV.x > 1.0 || displacedUV.y < 0.0 || displacedUV.y > 1.0) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        } else {
          // Sample the texture with displaced UVs
          vec4 texColor = texture2D(tDiffuse, displacedUV);
          gl_FragColor = texColor;
        }
      }
    `;
	}

	/**
	 * Twisting effect shader
	 * @returns {string} Fragment shader code
	 */
	getTwistShader() {
		return `
      uniform sampler2D tDiffuse;
      uniform float time;
      uniform float intensity;
      varying vec2 vUv;
      
      void main() {
        // Center the coordinates
        vec2 centeredUV = vUv - 0.5;
        float dist = length(centeredUV);
        
        // Calculate twist angle based on distance from center and time
        float angle = dist * 10.0 * intensity + time;
        
        // Apply rotation
        float s = sin(angle);
        float c = cos(angle);
        vec2 rotatedUV = vec2(
          centeredUV.x * c - centeredUV.y * s,
          centeredUV.x * s + centeredUV.y * c
        );
        
        // Return to 0-1 range
        vec2 displacedUV = rotatedUV + 0.5;
        
        // Check bounds
        if (displacedUV.x < 0.0 || displacedUV.x > 1.0 || displacedUV.y < 0.0 || displacedUV.y > 1.0) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        } else {
          // Sample the texture with displaced UVs
          vec4 texColor = texture2D(tDiffuse, displacedUV);
          gl_FragColor = texColor;
        }
      }
    `;
	}

	/**
	 * Pixelation effect shader
	 * @returns {string} Fragment shader code
	 */
	getPixelateShader() {
		return `
      uniform sampler2D tDiffuse;
      uniform float time;
      uniform float intensity;
      uniform vec2 resolution;
      varying vec2 vUv;
      
      void main() {
        // Calculate pixel size (higher intensity = larger pixels)
        float pixelSize = 0.001 + intensity * 0.05;
        
        // Add pulsing to pixel size for animation
        pixelSize *= 1.0 + 0.2 * sin(time * 2.0);
        
        // Calculate discrete pixel coordinates
        vec2 pixelatedUV = floor(vUv / pixelSize) * pixelSize;
        
        // Sample the texture with pixelated UVs
        vec4 texColor = texture2D(tDiffuse, pixelatedUV);
        
        gl_FragColor = texColor;
      }
    `;
	}
}
