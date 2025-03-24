import idb from './idb';
import { cachedKeys, projectStorage } from './storage';
import projectsApi from '$lib/api/projects';
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
            idb.getTexturesByProjectId(projectId).then((textures) => {
                for (const texture of textures) {
                    idb.deleteTexture(texture.id);
                }
            });
            projectStorage.deleteProject(projectId);
            cachedKeys.deleteProjectTexture(projectId);
            projectsApi.deleteProjectById(projectId);
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
                // imgFile: imgFile,
                fileName: options?.fileName,
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
            if (!idbTextureEntry) {
                console.warn(
                    `Texture ${id} not found in database, probably deleted texture still set as active`
                );
                return null;
            }
            return idbTextureEntry.arrayBuffer;
        },

        /** @param {string} projectId */
        async getTexturesByProjectId(projectId) {
            const textures = await idb.getTexturesByProjectId(projectId);
            //   r2Api.getAllUploadsByProjectId(projectId).then(async (keys) => {
            //     for (const key of keys) {
            //       const fileHash = key.split('/').pop();
            //       const localTexture = textures.find((texture) => texture.fileHash === fileHash);
            //       if (localTexture) {
            //       }
            //     }
            //     // for (const url of urls) {
            //     // 	const imageObject = await fetch(url).then(res => {
            //     // 		const metadata = JSON.parse(res.headers.get('x-metadata') || "{}")
            //     // 		const fileType = res.headers.get('content-type')
            //     // 		const imageObject = {
            //     // 			...metadata,
            //     // 			fileType,
            //     // 			url
            //     // 		}
            //     // 		return imageObject

            //     // 	})
            //     // 	imageObjects.push(imageObject)
            //     // }
            //   });
            return textures;
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
