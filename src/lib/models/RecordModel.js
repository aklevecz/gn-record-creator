import * as THREE from 'three';

export class RecordModel {
  /** @param {THREE.Scene} scene */
  constructor(scene) {
    this.scene = scene;
    this.vinylRecord = null;
    this.record = null;
    this.recordCover = null;
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
    const recordGeometry = new THREE.CylinderGeometry(5.9, 5.9, 0.08, 64);
    const recordMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff,
      roughness: 0.5,
      metalness: 0.2
    });
    this.record = new THREE.Mesh(recordGeometry, recordMaterial);
    this.vinylRecord.add(this.record);

    // Label in the center
    const labelGeometry = new THREE.CylinderGeometry(2, 2, 0.09, 64);
    const labelMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.8,
      metalness: 0.1
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.y = 0.005;
    this.vinylRecord.add(label);

    // Center hole
    const holeGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 32);
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

  /**
   * Changes the color of the vinyl record
   * @param {string|number} color - The color to set
   */
  changeRecordColor(color) {
    if (this.record) {
      this.record.material.color = new THREE.Color(color);
    }
  }
}