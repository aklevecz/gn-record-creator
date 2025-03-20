import { arrayBufferToBase64, base64ToArrayBuffer } from "./utils";

const storage = {
	/** @param {string} key @param {string} value */
	setItem: (key, value) => {
		localStorage.setItem(key, value);
	},
	/**
	 * @param {string} key
	 * @returns {string | null}
	 * */
	getItem: (key) => {
		return localStorage.getItem(key);
	},
	/** @type {(key: string) => void} */
	removeItem: (key) => {
		localStorage.removeItem(key);
	},
	getAllKeys: () => {
		return Object.keys(localStorage);
	},
	clear: () => {
		localStorage.clear();
	}
};

export const cachedKeys = (() => {
	return {
		/** @returns {string | null} */
		getActiveProject: () => {
			return storage.getItem('activeProject');
		},
		/** @param {string} projectId */
		setActiveProject: (projectId) => {
			storage.setItem('activeProject', projectId);
		},
		/** @param {string} projectId @param {string} textureId */
		setProjectTexture: (projectId, textureId) => {
			storage.setItem(`project_${projectId}_texture`, textureId);
		},
		/** @param {string} projectId @returns {string | null} */
		getProjectTexture: (projectId) => {
			return storage.getItem(`project_${projectId}_texture`);
		}
		// setActiveTexture(textureId) {
		// storage.setItem('activeTexture', textureId);
		// }
	};
})();

export const projectStorage = (() => {
	const dataKey = (/** @type {string} */ id) => `project_${id}_data`;

	return {
		/** @param {Project} project */
		saveProject: (project) => {
			storage.setItem(dataKey(project.id), JSON.stringify(project));
		},
		/**
		 * @param {string} id
		 *  @returns {Project | null} */
		getProject: (id) => {
			return JSON.parse(storage.getItem(dataKey(id)) || "null");
		},
		getAllProjectsData() {
			const keys = storage.getAllKeys();
			const projectKeys = keys.filter((key) => key.startsWith('project_') && key.endsWith('_data'));
			const projects = projectKeys.map((key) => {
				return JSON.parse(storage.getItem(key) || "null");
			})
			return projects
		}
	};
})();


// doesnt work because the storage fills up too quickly
// export const textureStorage = (() => {
// 	return {
// 		/** @param {string} id @param {ArrayBuffer} arrayBuffer */
// 		saveTexture: (id, arrayBuffer) => {
// 			storage.setItem(`texture_${id}`, arrayBufferToBase64(arrayBuffer));
// 		},
// 		/** @param {string} id @returns {ArrayBuffer | null} */
// 		getTexture: (id) => {
// 			const base64 = storage.getItem(`texture_${id}`);
// 			if (base64 === null) return null;
// 			return base64ToArrayBuffer(base64);
// 		}
// 	};
// })();