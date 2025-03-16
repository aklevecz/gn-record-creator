import * as THREE from 'three';

export class MaterialUtils {
	constructor() {
		this.textureLoader = new THREE.TextureLoader();
		this.materials = {
			standard: new THREE.MeshStandardMaterial({
				color: 'green',
				metalness: 0.5,
				roughness: 0.5
			}),
			phong: new THREE.MeshPhongMaterial({
				color: 0x808080,
				shininess: 100
			}),
			basic: new THREE.MeshBasicMaterial({
				color: 0x808080
			}),
			wireframe: new THREE.MeshBasicMaterial({
				color: 0x808080,
				wireframe: true
			}),
			normal: new THREE.MeshNormalMaterial(),
			toon: new THREE.MeshToonMaterial({
				color: 0x808080
			})
		};
	}

	/**
	 * Loads a texture from a file and creates a material
	 * @param {File} file - The file to load
	 * @param {THREE.WebGLRenderer} renderer - The renderer for anisotropy
	 * @param {Function} callback - Callback function with the created material
	 */
	loadTextureFromFile(file, renderer, callback) {
		const reader = new FileReader();
		reader.onload = (/** @type {*} */ e) => {
			this.textureLoader.load(e.target.result, (texture) => {
				if (!renderer) return;

				// Preserve color fidelity
				texture.colorSpace = THREE.SRGBColorSpace;
				texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

				// Prevent mipmapping from diluting colors
				texture.minFilter = THREE.LinearFilter;
				texture.magFilter = THREE.LinearFilter;

				// Prevent color filtering
				texture.generateMipmaps = false;

				// Standard wrapping
				texture.wrapS = THREE.RepeatWrapping;
				texture.wrapT = THREE.RepeatWrapping;

				const material = new THREE.MeshBasicMaterial({
					map: texture,
					color: 0xffffff // Pure white base to not affect texture colors
				});

				callback(material);
			});
		};
		reader.readAsDataURL(file);
	}

	/** @param {string} textureUrl */
	updateMaterialTexture(textureUrl) {
		return new Promise((resolve) => {
			this.textureLoader.load(textureUrl, (texture) => {
				// Preserve color fidelity
				texture.colorSpace = THREE.SRGBColorSpace;
				// texture.encoding = THREE.sRGBEncoding;

				// Prevent mipmapping from diluting colors
				texture.minFilter = THREE.LinearFilter;
				texture.magFilter = THREE.LinearFilter;

				// Prevent color filtering
				texture.generateMipmaps = false;

				// Standard wrapping
				texture.wrapS = THREE.RepeatWrapping;
				texture.wrapT = THREE.RepeatWrapping;

				const basicMaterial = new THREE.MeshBasicMaterial({
					map: texture,
					color: 0xffffff // Pure white base to not affect texture colors,
				});
				return resolve(basicMaterial);
			});
		});
	}

	/**
	 * Gets a material by type
	 * @param {'standard'|'phong'|'basic'|'wireframe'|'normal'|'toon'} type - The material type
	 * @returns {THREE.Material} The requested material
	 */
	getMaterial(type) {
		return this.materials[type] || this.materials.basic;
	}
}
