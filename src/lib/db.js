import idb from './idb';
import { projectStorage } from './storage';

const db = () => {
	return {
		/** @param {Project} project */
		saveProject(project) {
			idb.addProject(project);
			projectStorage.saveProject(project);
		},
		async getAllProjects() {
			try {
				const allProjects = await idb.getAllProjects();
				return allProjects;
			} catch (e) {
				return projectStorage.getAllProjectsData();
			}
		},
		/** @param {string} id @param {File | Blob} imgFile @param {{seed?: string, projectId?: string, fileName?: string, fileHash:string}} [options] */
		async saveTexture(id, imgFile, options) {
			const arrayBuffer = await imgFile.arrayBuffer();
			// textureStorage.saveTexture(id, arrayBuffer);
			idb.saveTexture({
				imgFile: imgFile,
				arrayBuffer,
				seed: options?.seed || 'user-upload',
				id,
				projectId: options?.projectId || 'active'
			});
		},
		/** @param {string} id */
		async getTexture(id) {
			// const arrayBuffer = textureStorage.getTexture(id);
			// if (arrayBuffer) {
			//     return arrayBuffer;
			// }
			const idbTextureEntry = await idb.getTexture(id);
			return idbTextureEntry.arrayBuffer;
		},

		/** @param {string} projectId */
		getTexturesByProjectId(projectId) {
			return idb.getTexturesByProjectId(projectId);
		}
	};
};

export default db();
