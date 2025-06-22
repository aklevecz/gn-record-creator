import * as THREE from 'three';

export class RecordModel {
  /** @param {THREE.Scene} scene */
  constructor(scene) {
    this.scene = scene;
    this.vinylRecord = null;
    this.record = null;
    this.recordCover = null;
    
    // Color animation properties
    this.colorAnimation = {
      active: false,
      startTime: 0,
      duration: 800,
      startColor: new THREE.Color(),
      endColor: new THREE.Color(),
      currentColor: new THREE.Color()
    };
  }

  /**
   * Creates the record cover object
   * @returns {THREE.Mesh} The created record cover
   */
  createRecordCover() {
    const geometry = new THREE.BoxGeometry(0.25, 20, 20);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.recordCover = new THREE.Mesh(geometry, material);
    this.recordCover.position.set(0, 20, 0);
    this.scene.add(this.recordCover);
    return this.recordCover;
  }

  /**
   * Creates the vinyl record with all its components
   * @returns {THREE.Group} The vinyl record group
   */
  createVinylRecord() {
    // Create a group to hold all parts of the record
    this.vinylRecord = new THREE.Group();

    // Record disc - main black part
    const recordGeometry = new THREE.CylinderGeometry(8.9, 8.9, 0.15, 64);
    const recordMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff,
      roughness: 0.5,
      metalness: 0.2
    });
    this.record = new THREE.Mesh(recordGeometry, recordMaterial);
    this.vinylRecord.add(this.record);

    // Label in the center
    const labelGeometry = new THREE.CylinderGeometry(2, 2, 0.16, 64);
    const labelMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.8,
      metalness: 0.1
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.y = 0.005;
    this.vinylRecord.add(label);

    // Center hole
    const holeGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.17, 32);
    const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const hole = new THREE.Mesh(holeGeometry, holeMaterial);
    this.vinylRecord.add(hole);

    // Create grooves as rings
    this.addGrooves(this.vinylRecord);

    this.vinylRecord.position.set(0, 20, 0);
    this.vinylRecord.rotation.x = -Math.PI / 2;
    this.vinylRecord.rotation.z = Math.PI / 2;
    this.scene.add(this.vinylRecord);

    return this.vinylRecord;
  }

  /**
   * Adds groove rings to the vinyl record
   * @param {THREE.Group} recordGroup - The vinyl record group
   */
  addGrooves(recordGroup) {
    const startRadius = 2.2;
    const endRadius = 5.8;
    const numGrooves = 40; // Fewer, wider grooves for more visibility
    const spacing = (endRadius - startRadius) / numGrooves;

    for (let i = 0; i < numGrooves; i++) {
      const radius = startRadius + i * spacing;
      
      // Create actual groove indentations using torus geometry
      const grooveGeometry = new THREE.TorusGeometry(radius, 0.008, 4, 32);
      const grooveMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.9,
        metalness: 0.1
      });
      
      // Top side groove
      const grooveTop = new THREE.Mesh(grooveGeometry, grooveMaterial);
      grooveTop.rotation.x = Math.PI / 2;
      grooveTop.position.y = -0.02; // Indent into the record surface
      recordGroup.add(grooveTop);
      
      // Bottom side groove
      const grooveBottom = new THREE.Mesh(grooveGeometry, grooveMaterial);
      grooveBottom.rotation.x = Math.PI / 2;
      grooveBottom.position.y = 0.02; // Indent into the other side
      recordGroup.add(grooveBottom);
      
      // Add highlight rings to enhance visibility on both sides
      if (i % 3 === 0) {
        const highlightGeometry = new THREE.RingGeometry(radius - 0.01, radius + 0.01, 32);
        const highlightMaterial = new THREE.MeshBasicMaterial({
          color: 0x333333,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide
        });
        
        // Top highlight
        const highlightTop = new THREE.Mesh(highlightGeometry, highlightMaterial);
        highlightTop.rotation.x = Math.PI / 2;
        highlightTop.position.y = 0.042;
        recordGroup.add(highlightTop);
        
        // Bottom highlight
        const highlightBottom = new THREE.Mesh(highlightGeometry, highlightMaterial);
        highlightBottom.rotation.x = Math.PI / 2;
        highlightBottom.position.y = -0.042;
        recordGroup.add(highlightBottom);
      }
    }
  }

  /**
   * Changes the color of the vinyl record with smooth animation
   * @param {string|number} color - The color to animate to
   */
  changeRecordColor(color) {
    if (this.record) {
      const newColor = new THREE.Color(color);
      
      // Store current color as start color
      this.colorAnimation.startColor.copy(this.record.material.color);
      this.colorAnimation.endColor.copy(newColor);
      this.colorAnimation.currentColor.copy(this.colorAnimation.startColor);
      
      // Start animation
      this.colorAnimation.active = true;
      this.colorAnimation.startTime = Date.now();
    }
  }

  /**
   * Updates the color animation - should be called from the main animation loop
   */
  updateColorAnimation() {
    if (!this.colorAnimation.active || !this.record) return;

    const elapsed = Date.now() - this.colorAnimation.startTime;
    const progress = Math.min(elapsed / this.colorAnimation.duration, 1);
    
    // Ease out cubic for smooth animation
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    
    // Interpolate between start and end colors
    this.colorAnimation.currentColor.lerpColors(
      this.colorAnimation.startColor,
      this.colorAnimation.endColor,
      easedProgress
    );
    
    // Apply the interpolated color
    this.record.material.color.copy(this.colorAnimation.currentColor);
    
    // End animation when complete
    if (progress >= 1) {
      this.colorAnimation.active = false;
    }
  }
}