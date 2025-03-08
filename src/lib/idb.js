// import { calculateHash } from './utils';

class IDBStorage {
	constructor() {
		/** @type {string} */
		this.dbName = 'assetStorage';
		/** @type {number} */
		this.version = 1;
		/** @type {IDBDatabase | null} */
		this.db = null;

		this.stores = {
			textures: 'textures'
		};
	}

	/**
	 * Initialize the database connection
	 * @returns {Promise<void>}
	 */
	async init() {
		if (this.db) return;

		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.version);
			request.onerror = () => {
				reject(new Error('Failed to open 3D model database'));
			};

			request.onsuccess = () => {
				this.db = request.result;
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
					db.createObjectStore(this.stores.textures, { keyPath: 'id' });
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
	 *   seed: string,
	 *   id: string,
	 *   fileName?: string
	 * }} entry
	 */
	async saveTexture(entry) {
		await this.set(this.stores.textures, {
			...entry,
			fileName: entry.fileName || (entry.imgFile instanceof File ? entry.imgFile.name : 'texture'),
			fileType: entry.imgFile.type,
			lastModified: Date.now()
		});
	}

	/** @param {string} id */
	async getTexture(id) {
		return this.get(this.stores.textures, id);
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
				reject(new Error('Database not initialized'));
				return;
			}
			console.log(`Storing ${value} in ${storeName}`);
			const transaction = this.db.transaction(storeName, 'readwrite');
			const store = transaction.objectStore(storeName);
			console.log(`Store is ${store}`);
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
	 * Close the database connection
	 */
	close() {
		if (this.db) {
			this.db.close();
			this.db = null;
		}
	}
}

// Create and export a singleton instance
const idb = new IDBStorage();
export default idb;
