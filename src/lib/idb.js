// import { calculateHash } from './utils';

import { serializeDeep } from './utils';

class IDBStorage {
	constructor() {
		/** @type {string} */
		this.dbName = 'persistent-data';
		/** @type {number} */
		this.version = 1;
		/** @type {IDBDatabase | null} */
		this.db = null;

		this.stores = {
			textures: 'textures',
			generatedImgs: 'generatedImgs',
			projects: 'projects'
		};
	}

	/**
	 * Initialize the database connection
	 * @returns {Promise<void>}
	 */
	async init() {
		console.log(`Trying to init indexed db "${this.dbName}"`);
		if (this.db) return;

		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.version);
			request.onerror = () => {
				alert(
					'Database initiation failed. Restarting your browser might help. Sorry for the inconvenience.'
				);
				reject(new Error('Failed to open indexed db'));
			};

			request.onsuccess = () => {
				this.db = request.result;
				console.log(`Successfully opened indexed db "${this.dbName}"`);
				resolve();
			};

			request.onupgradeneeded = (event) => {
				// @ts-ignore
				const db = /** @type {IDBDatabase} */ (event.target?.result);

				// Create models store with indexes
				// if (!db.objectStoreNames.contains(this.stores.models)) {
				// 	const modelStore = db.createObjectStore(this.stores.models, { keyPath: 'id' });
				// 	modelStore.createIndex('name', 'name', { unique: false });
				// 	modelStore.createIndex('type', 'type', { unique: false });
				// 	modelStore.createIndex('timestamp', 'timestamp', { unique: false });
				// }
				// Create generated images store
				if (!db.objectStoreNames.contains(this.stores.textures)) {
					const textureStore = db.createObjectStore(this.stores.textures, { keyPath: 'id' });
					textureStore.createIndex('projectId', 'projectId', { unique: false });
					textureStore.createIndex('fileHash', 'fileHash', { unique: false });
					textureStore.createIndex('fileHash_projectId', ['fileHash', 'projectId'], {
						unique: false
					});
				}

				if (!db.objectStoreNames.contains(this.stores.generatedImgs)) {
					const generatedImgsStore = db.createObjectStore(this.stores.generatedImgs, {
						keyPath: 'id'
					});
					generatedImgsStore.createIndex('projectId', 'projectId', { unique: false });
				}

				if (!db.objectStoreNames.contains(this.stores.projects)) {
					db.createObjectStore(this.stores.projects, { keyPath: 'id' });
				}
			};
		});
	}

	// /** @param {{imgUrl: string, base64Url: string, seed: string, id: string}} entry */
	// async saveTexture(entry) {
	// 	await this.set(this.stores.textures, {
	// 		...entry,
	// 	});
	// }

	/**
	 * @param {{
	 *   imgFile: File | Blob,
	 *   arrayBuffer?: ArrayBuffer,
	 *   seed: string,
	 *   id: string,
	 *   projectId: string
	 *   fileName?: string
	 *   fileHash?: string
	 * }} entry
	 */
	async saveTexture(entry) {
		// alert(`SAVING TEXTURE: ${entry.id}`);
		await this.set(this.stores.textures, {
			...entry,
			projectId: entry.projectId,
			fileName: entry.fileName || (entry.imgFile instanceof File ? entry.imgFile.name : 'texture'),
			fileType: entry.imgFile.type,
			arrayBuffer: entry.arrayBuffer || (await entry.imgFile.arrayBuffer()),
			lastModified: Date.now()
		});
	}

	/** @param {string} id */
	async getTexture(id) {
		// alert(`GETTING TEXTURE: ${id}`);
		return this.get(this.stores.textures, id);
	}

	/**
	 * Fetches a texture by its hash
	 * @param {string} fileHash - The hash of the file to search for
	 * @param {string} [projectId] - Optional project ID to limit the search scope
	 * @returns {Promise<any|null>} A promise that resolves to the texture or null if not found
	 */
	async getTextureByHash(fileHash, projectId = '') {
		await this.init();
		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error('Database not initialized'));
				return;
			}

			const transaction = this.db.transaction(this.stores.textures, 'readonly');
			const store = transaction.objectStore(this.stores.textures);

			let request;

			if (projectId) {
				// Use the composite index if projectId is provided
				const index = store.index('fileHash_projectId');
				request = index.get([fileHash, projectId]);
			} else {
				// Use just the hash index if no projectId
				const index = store.index('fileHash');
				request = index.get(fileHash);
			}

			request.onerror = () => {
				reject(new Error(`Error fetching texture by hash: ${fileHash}`));
			};

			request.onsuccess = () => {
				resolve(request.result || null);
			};
		});
	}

	/**
	 * Check if a texture with the given hash already exists
	 * @param {string} fileHash - The hash to check
	 * @param {string} [projectId] - Optional project ID to limit the search scope
	 * @returns {Promise<boolean>} - True if a texture with this hash exists
	 */
	async textureHashExists(fileHash, projectId = '') {
		try {
			const texture = await this.getTextureByHash(fileHash, projectId);
			return !!texture;
		} catch (error) {
			console.error('Error checking texture hash:', error);
			return false;
		}
	}

	async getAllTextures() {
		// await this.init();
		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error('Database not initialized'));
				return;
			}

			const transaction = this.db.transaction(this.stores.textures, 'readonly');
			const store = transaction.objectStore(this.stores.textures);
			const request = store.getAll();

			request.onerror = () => {
				reject(new Error('Error fetching models'));
			};

			request.onsuccess = () => {
				// Return all models but exclude the actual file data
				const models = request.result.map(({ base64Url, ...metadata }) => metadata);
				resolve(models);
			};
		});
	}

	/** @param {{id: string, projectId: string, imgUrl: string, seed: string, prompt: string, imgBlob: Blob}} entry */
	async addGeneratedImg(entry) {
		await this.set(this.stores.generatedImgs, {
			...entry,
			fileName: entry.id,
			fileType: entry.imgBlob.type,
			lastModified: Date.now()
		});
		// await this.set(this.stores.generatedImgs, {
		// 	...entry,
		// 	id: `${entry.prompt.replace(/[^a-zA-Z0-9]/g, '_')}_${entry.seed}`
		// });
	}

	/** @param {string} id */
	async getGeneratedImg(id) {
		return this.get(this.stores.generatedImgs, id);
	}

	async getAllGeneratedImgs() {
		// await this.init();
		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error('Database not initialized'));
				return;
			}

			const transaction = this.db.transaction(this.stores.generatedImgs, 'readonly');
			const store = transaction.objectStore(this.stores.generatedImgs);
			const request = store.getAll();

			request.onerror = () => {
				reject(new Error('Error fetching models'));
			};

			request.onsuccess = () => {
				// Return all models but exclude the actual file data
				const models = request.result.map(({ base64Url, ...metadata }) => metadata);
				resolve(models);
			};
		});
	}

	/** @param {string} id */
	async getProject(id) {
		return this.get(this.stores.projects, id);
	}

	async getAllProjects() {
		// await this.init();
		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error('Database not initialized'));
				return;
			}

			const transaction = this.db.transaction(this.stores.projects, 'readonly');
			const store = transaction.objectStore(this.stores.projects);
			const request = store.getAll();

			request.onerror = () => {
				reject(new Error('Error fetching models'));
			};

			request.onsuccess = () => {
				resolve(request.result);
			};
		});
	}

	/** @param {Project} project */
	async addProject(project) {
		const plainProject = serializeDeep(project);
		await this.set(this.stores.projects, {
			// id: project.name,
			...plainProject,
			name: project.details?.details.project_name.value || project.name,
			lastModified: Date.now()
		});
	}

	/** @param {string} projectId */
	async deleteProject(projectId) {
		await this.delete(this.stores.projects, projectId);
	}

	/** @param {string} textureId */
	async deleteTexture(textureId) {
		await this.delete(this.stores.textures, textureId);
	}

	/**
	 * Generic method to get a value from a store
	 * @private
	 * @param {string} storeName
	 * @param {string} key
	 * @returns {Promise<any>}
	 */
	async get(storeName, key) {
		// await this.init();
		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error('Database not initialized'));
				return;
			}

			const transaction = this.db.transaction(storeName, 'readonly');
			const store = transaction.objectStore(storeName);
			const request = store.get(key);

			request.onerror = () => {
				reject(new Error(`Error fetching from ${storeName}`));
			};

			request.onsuccess = () => {
				resolve(request.result);
			};
		});
	}
	/**
	 * Fetches all textures for a specific project using the projectId index
	 * @param {string} projectId - The ID of the project to fetch textures for
	 * @returns {Promise<Array<any>>} A promise that resolves to an array of textures
	 */
	async getTexturesByProjectId(projectId) {
		await this.init();
		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error('Database not initialized'));
				return;
			}

			const transaction = this.db.transaction(this.stores.textures, 'readonly');
			const store = transaction.objectStore(this.stores.textures);
			const index = store.index('projectId');
			const request = index.getAll(projectId);

			request.onerror = () => {
				reject(new Error(`Error fetching textures for project ${projectId}`));
			};

			request.onsuccess = () => {
				resolve(request.result || []);
			};
		});
	}

	/**
	 * Fetches all generated images for a specific project using the projectId index
	 * @param {string} projectId - The ID of the project to fetch generated images for
	 * @returns {Promise<Array<any>>} A promise that resolves to an array of generated images
	 */
	async getGeneratedImgsByProjectId(projectId) {
		await this.init();
		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error('Database not initialized'));
				return;
			}

			const transaction = this.db.transaction(this.stores.generatedImgs, 'readonly');
			const store = transaction.objectStore(this.stores.generatedImgs);
			const index = store.index('projectId');
			const request = index.getAll(projectId);

			request.onerror = () => {
				reject(new Error(`Error fetching generated images for project ${projectId}`));
			};

			request.onsuccess = () => {
				resolve(request.result || []);
			};
		});
	}

	/**
	 * Generic method to get all values from a store
	 * @private
	 * @param {string} storeName
	 * @returns {Promise<Array<any>>}
	 */
	async getAll(storeName) {
		await this.init();
		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error('Database not initialized'));
				return;
			}
			const transaction = this.db.transaction(storeName, 'readonly');
			const store = transaction.objectStore(storeName);
			const request = store.getAll();

			request.onerror = () => {
				reject(new Error(`Error fetching from ${storeName}`));
			};

			request.onsuccess = () => {
				resolve(request.result || []);
			};
		});
	}

	/**
	 * Generic method to set a value in a store
	 * @private
	 * @param {string} storeName
	 * @param {any} value
	 * @returns {Promise<void>}
	 */
	async set(storeName, value) {
		// await this.init();
		return new Promise((resolve, reject) => {
			if (!this.db) {
				alert(
					'Something is wrong with the database. If this keeps happening, closing and restarting your browser may help. Sorry for the inconvenience.'
				);
				reject(new Error('Database not initialized'));
				return;
			}
			console.log(`Storing ${JSON.stringify(value).slice(0, 50)} in ${storeName}`);
			const transaction = this.db.transaction(storeName, 'readwrite');
			const store = transaction.objectStore(storeName);
			// console.log(`Store is ${store}`);
			const request = store.put(value);

			request.onerror = () => {
				reject(new Error(`Error storing in ${storeName}`));
			};

			request.onsuccess = () => {
				resolve();
			};
		});
	}

	/**
	 * Generic method to delete a value from a store
	 * @private
	 * @param {string} storeName
	 * @param {string} key
	 * @returns {Promise<void>}
	 */
	async delete(storeName, key) {
		// await this.init();
		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error('Database not initialized'));
				return;
			}

			const transaction = this.db.transaction(storeName, 'readwrite');
			const store = transaction.objectStore(storeName);
			const request = store.delete(key);

			request.onerror = () => {
				reject(new Error(`Error deleting from ${storeName}`));
			};

			request.onsuccess = () => {
				console.log(`Successfully deleted item with key "${key}" from ${storeName}`);
				resolve();
			};
		});
	}

	/**
	 * Close the database connection
	 */
	close() {
		if (this.db) {
			this.db.close();
			this.db = null;
		}
	}

	async forceReset() {
		// Close our known connection
		this.close();

		// Try a different approach - open with a higher version number
		// This can sometimes break locks
		try {
			const request = indexedDB.open(this.dbName, this.version + 1000);
			console.log(request);
			/** @param {*} event */
			request.onupgradeneeded = (event) => {
				const db = event.target.result;
				console.log(db);
				// Delete all object stores
				Array.from(db.objectStoreNames).forEach((storeName) => {
					db.deleteObjectStore(storeName);
				});
			};
			/** @param {*} event */
			request.onsuccess = (event) => {
				const db = event.target.result;
				db.close();
				console.log('Force reset successful');
			};
		} catch (e) {
			console.error('Force reset failed:', e);
		}
	}
	/**
	 * Delete the entire IndexedDB database
	 * @returns {Promise<void>} A promise that resolves when the database is deleted
	 */
	async deleteDatabase() {
		// First ensure all pending transactions are complete
		// by waiting for any open transactions to finish
		if (this.db) {
			const openTransactions = Array.from(this.db.objectStoreNames).map((storeName) => {
				return new Promise((resolve) => {
					if (this.db) {
						const transaction = this.db.transaction(storeName, 'readonly');
						transaction.oncomplete = resolve;
						transaction.onerror = resolve; // Still resolve on error
						transaction.onabort = resolve;
					}
				});
			});

			// Wait for all transactions to complete
			await Promise.all(openTransactions);

			// Now close the connection
			this.db.close();
			this.db = null;
		}

		return new Promise((resolve, reject) => {
			console.log(`Trying to delete database "${this.dbName}"`);
			const deleteRequest = indexedDB.deleteDatabase(this.dbName);

			deleteRequest.onsuccess = () => {
				console.log(`Successfully deleted database "${this.dbName}"`);
				resolve();
			};
			/** @param {*} event */
			deleteRequest.onerror = (event) => {
				console.error(`Error deleting database "${this.dbName}"`, event.target.error);
				reject(event.target.error);
			};

			deleteRequest.onblocked = () => {
				console.warn(`Database deletion was blocked. Are there other open connections?`);
				reject(new Error('Database deletion blocked'));
			};
		});
	}

	// Add this to your code
	async recoverDatabase() {
		this.close();

		// Create a temporary recovery database with a unique name
		const recoveryDbName = this.dbName + '_recovery_' + Date.now();

		try {
			// Create temporary database
			const request = indexedDB.open(recoveryDbName, 1);
			request.onupgradeneeded = (event) => {
				console.log('Creating recovery database');
			};

			// When successful, try to delete the problematic DB
			request.onsuccess = async () => {
				const recoveryDb = request.result;
				recoveryDb.close();

				console.log('Recovery database created, trying to delete original');

				try {
					// Multiple deletion attempts with delays
					for (let i = 0; i < 3; i++) {
						try {
							const deleteRequest = indexedDB.deleteDatabase(this.dbName);
							await new Promise((resolve, reject) => {
								deleteRequest.onsuccess = resolve;
								deleteRequest.onerror = reject;
								deleteRequest.onblocked = reject;

								// Failsafe
								setTimeout(resolve, 5000);
							});
							console.log('Deletion attempt completed');
							break;
						} catch (e) {
							console.log(`Attempt ${i + 1} failed, retrying...`);
							await new Promise((r) => setTimeout(r, 1000));
						}
					}

					// Clean up recovery database
					indexedDB.deleteDatabase(recoveryDbName);
					console.log('Recovery complete');
				} catch (e) {
					console.error('Recovery failed:', e);
				}
			};
		} catch (e) {
			console.error('Recovery initialization failed:', e);
		}
	}
}

// Create and export a singleton instance
const idb = new IDBStorage();
export default idb;
