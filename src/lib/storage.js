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
		},
		// setActiveTexture(textureId) {
			// storage.setItem('activeTexture', textureId);
		// }
	};
})()

