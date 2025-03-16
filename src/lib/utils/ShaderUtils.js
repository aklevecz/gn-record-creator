import * as THREE from 'three';

export class ShaderUtils {
  constructor() {
    this.useShader = false;
    this.shaderMaterial = null;
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
   * Toggles shader usage
   * @returns {boolean} Current shader state
   */
  toggleShader() {
    this.useShader = !this.useShader;
    return this.useShader;
  }

  /**
   * Updates shader time for animation
   */
  updateShader() {
    if (this.useShader && this.shaderMaterial) {
      this.shaderTime += 0.01;
      this.shaderMaterial.uniforms.time.value = this.shaderTime;
    }
  }

  /**
   * Checks if shader is active
   * @returns {boolean} Shader active state
   */
  isShaderActive() {
    return this.useShader;
  }

  /**
   * Gets the current shader material
   * @returns {THREE.ShaderMaterial | null} The shader material
   */
  getMaterial() {
    return this.shaderMaterial;
  }
}