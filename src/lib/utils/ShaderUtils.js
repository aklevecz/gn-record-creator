import * as THREE from 'three';

export class ShaderUtils {
  constructor() {
    this.useShader = false;
    this.useDisplacementShader = false;
    this.shaderMaterial = null;
    this.displacementShaderMaterial = null;
    this.shaderTime = 0;
    
    this.createShaderMaterial();
  }

  /**
   * Creates a shader material with animated effects
   * @returns {THREE.ShaderMaterial} The created shader material
   */
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
    
    this.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide
    });
    
    return this.shaderMaterial;
  }

  /**
   * Creates a displacement shader material that works with a texture
   * @param {THREE.Texture} texture - The texture to apply displacement to
   * @param {number} intensity - The intensity of the displacement effect
   * @returns {THREE.ShaderMaterial} The displacement shader material
   */
  createDisplacementShaderMaterial(texture, intensity = 0.01) {
    const vertexShader = `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D tDiffuse;
      uniform float time;
      uniform float intensity;
      varying vec2 vUv;
      
      void main() {
        // Basic wave displacement effect
        vec2 displacedUV = vUv;
        displacedUV.x += sin(vUv.y * 10.0 + time) * intensity;
        displacedUV.y += sin(vUv.x * 10.0 + time) * intensity;
        
        // Sample the texture with displaced UVs
        vec4 texColor = texture2D(tDiffuse, displacedUV);
        
        gl_FragColor = texColor;
      }
    `;
    
    this.displacementShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: texture },
        time: { value: 0.0 },
        intensity: { value: intensity }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide
    });
    
    return this.displacementShaderMaterial;
  }

  /**
   * Toggles shader usage
   * @returns {boolean} Current shader state
   */
  toggleShader() {
    this.useShader = !this.useShader;
    this.useDisplacementShader = false; // Turn off displacement when toggling regular shader
    return this.useShader;
  }

  /**
   * Toggles displacement shader usage
   * @param {THREE.Texture} texture - The texture to apply displacement to
   * @param {number} intensity - The intensity of the displacement effect
   * @returns {boolean} Current displacement shader state
   */
  toggleDisplacementShader(texture, intensity = 0.01) {
    this.useDisplacementShader = !this.useDisplacementShader;
    
    if (this.useDisplacementShader) {
      this.useShader = false; // Turn off regular shader when using displacement
      
      // Create or update the displacement shader with the current texture
      if (!this.displacementShaderMaterial || this.displacementShaderMaterial.uniforms.tDiffuse.value !== texture) {
        this.createDisplacementShaderMaterial(texture, intensity);
      }
    }
    
    return this.useDisplacementShader;
  }

  /**
   * Updates shader time for animation
   */
  updateShader() {
    this.shaderTime += 0.01;
    
    if (this.useShader && this.shaderMaterial) {
      this.shaderMaterial.uniforms.time.value = this.shaderTime;
    }
    
    if (this.useDisplacementShader && this.displacementShaderMaterial) {
      this.displacementShaderMaterial.uniforms.time.value = this.shaderTime;
    }
  }

  /**
   * Checks if any shader is active
   * @returns {boolean} Shader active state
   */
  isShaderActive() {
    return this.useShader || this.useDisplacementShader;
  }

  /**
   * Checks if displacement shader is active
   * @returns {boolean} Displacement shader active state
   */
  isDisplacementShaderActive() {
    return this.useDisplacementShader;
  }

  /**
   * Gets the current active shader material
   * @returns {THREE.ShaderMaterial | null} The active shader material
   */
  getMaterial() {
    if (this.useDisplacementShader) {
      return this.displacementShaderMaterial;
    }
    if (this.useShader) {
      return this.shaderMaterial;
    }
    return null;
  }

  /**
   * Updates the displacement intensity
   * @param {number} intensity - The new intensity value (0.0 to 0.1 recommended)
   */
  updateDisplacementIntensity(intensity) {
    if (this.displacementShaderMaterial) {
      this.displacementShaderMaterial.uniforms.intensity.value = intensity;
    }
  }
}