import idb from './idb';
import { projectStorage } from './storage';

import r2Api from '$lib/api/r2';

const db = () => {
	return {
		/** @param {Project} project */
		saveProject(project) {
			idb.addProject(project);
			projectStorage.saveProject(project);
		},
        /** @param {string} projectId */
        deleteProject(projectId) {
            idb.deleteProject(projectId);
            projectStorage.deleteProject(projectId);
        },
		async getAllProjects() {
			try {
				const allProjects = await idb.getAllProjects();
				return allProjects;
			} catch (e) {
				return projectStorage.getAllProjectsData();
			}
		},
		/** @param {string} id @param {File | Blob} imgFile @param {ImgData} [options] */
		async saveTexture(id, imgFile, options) {
			const arrayBuffer = await imgFile.arrayBuffer();
			// textureStorage.saveTexture(id, arrayBuffer);
			idb.saveTexture({
				imgFile: imgFile,
				arrayBuffer,
				seed: options?.seed || 'user-upload',
				id,
				projectId: options?.projectId || 'active',
                fileHash: options?.fileHash
			});
		},
        /** @param {string} id */
        async deleteTexture(id) {
            idb.deleteTexture(id);
        },
		/** @param {string} id */
		async getTexture(id) {
			// SHOULD THIS RETURN AN OBJECT???

			
			// const arrayBuffer = textureStorage.getTexture(id);
			// if (arrayBuffer) {
			//     return arrayBuffer;
			// }
			const idbTextureEntry = await idb.getTexture(id);
			return idbTextureEntry.arrayBuffer;
		},

		/** @param {string} projectId */
		getTexturesByProjectId(projectId) {
			// return r2Api.getAllUploadsByProjectId(projectId)
			return idb.getTexturesByProjectId(projectId);
		},
        async getAllGeneratedImgs() {
            return idb.getAllGeneratedImgs();
        },
        /** @param {ImgData} entry*/
        async addGeneratedImg(entry) {
            return idb.addGeneratedImg(entry);
        }
	};
};

export default db();
