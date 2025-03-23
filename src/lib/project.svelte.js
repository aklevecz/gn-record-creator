import db from './db';
import projects from './projects.svelte';
import { serializeDeep } from './utils';
import r2Api from '$lib/api/r2';
import { cachedKeys } from './storage';

/** @type {Project} */
const defaultProjectState = {
    id: '',
    name: 'default',
    createdAt: new Date(),
    details: null,
    textures: [],
    pricing: {
        record_color: '',
        total_units: 0,
        records_per_set: 0,
        record_format: '',
        lacquers: '',
        metalwork: '',
        test_prints: 0,
        packaging: '',
        estimatedCost: 0
    }
};

const pricingKeys = Object.keys(defaultProjectState.pricing).filter(
    (key) => key !== 'estimatedCost'
);

// We now have textures and cachedTextures which is kind of confusing
const createProject = () => {
    let project = $state({ ...defaultProjectState });

    // Could combine these into a textures object
    // Do these need to be reactive?
    /** @type {IDBTextureObject[]} */
    let cachedTextures = $state([])

    /** @type {string[]} */
    let remoteTextureIds = $state([]);

    let texturesLoaded = $state(false);

	let activeTextureUrl = $state('');

    return {
        get state() {
            return project;
        },
        get cachedTextures() {
            return cachedTextures;
        },
        get texturesLoaded() {
            return texturesLoaded;
        },
		get activeTextureUrl() {
			return activeTextureUrl;
		},
        /** @param {Project} newState */
        set(newState) {
            project = newState;
        },
        /**
         * @param {{name?: string, details: Details, textures: Texture[]}} props
         * @returns {Project}
         */
        create({ name, details, textures }) {
            const id = crypto.randomUUID();
            project.id = id;
            project.name = name || id;
            project.details = details;
            project.textures = textures;
            project.createdAt = new Date();
            project.pricing = {
                record_color: '',
                total_units: 0,
                records_per_set: 0,
                record_format: '',
                lacquers: '',
                metalwork: '',
                test_prints: 0,
                packaging: '',
                estimatedCost: 0
            };

            return {
                id: project.id,
                name: project.name,
                details: project.details,
                textures: project.textures,
                createdAt: project.createdAt,
                pricing: project.pricing
            };
        },
        /** @param {{name: string, details: Details, survey: Survey}} props */
        update({ name, details, survey }) {
            project.name = name;
            project.details = details;

            return {
                name: project.name,
                details: project.details,
                createdAt: project.createdAt
            };
        },
        /** @param {string} name */
        updateName(name) {
            project.name = name;
            projects.updateProject(serializeDeep(project));
        },
        /** @param {Details} details */
        updateDetails(details) {
            project.details = details;

            // pricing calculations
            const pricingObjects = pricingKeys.reduce(
                (/** @type {Record<string, string>} */ acc, key) => {
                    acc[key] = details.details[key].value;
                    return acc;
                },
                {}
            );

            let estimatedCost = parseInt(pricingObjects.total_units) * 10;
            project.pricing.estimatedCost = estimatedCost;
            project.name = project.details?.details.project_name.value || project.name;
            projects.updateProject(serializeDeep(project));
        },
        /** @param {Texture} texture */
        addTexture(texture) {
            if (project.textures.find((t) => t.fileHash === texture.fileHash)) return;
            project.textures.push(texture);
            projects.updateProject(serializeDeep(project));
        },
        async checkTextures() {
			texturesLoaded = false
            console.log(`Checking textures for project ${project.id}`);

            try {
                // Currently this is ONLY IDB, should it have more of this logic below?
                cachedTextures = await db.getTexturesByProjectId(project.id);
            } catch (error) {
                console.log('Texture from the IDB failed try to fetch remotely...');
            }

            // local texture ids that should match the above from idb
            const textures = project.textures;

            // just in case fetched from the r2
            const remoteTexturesPaths = await r2Api.getAllUploadsByProjectId(project.id);
            remoteTextureIds = remoteTexturesPaths
                .map((path) => path.split('/').pop())
                .filter((path) => path !== undefined);

            // Compare textures to remoteTextureIds
            const remoteOnlyTextures = remoteTextureIds.filter(
                (textureId) => !textures.map((t) => t.fileHash).includes(textureId)
            );
            texturesLoaded = true;
            // Do something with remoteOnlyTextures...
        },

        async generateTextureObjectsWithUrls() {
            const textureObjects = cachedTextures.map((texture) => {
                const blobFromBuffer = new Blob([texture.arrayBuffer], { type: texture.fileType });
                const url = URL.createObjectURL(blobFromBuffer);
                return {
                    url,
                    id: texture.id,
                    seed: texture.seed,
                    fileName: texture.fileName,
                    arrayBuffer: texture.arrayBuffer,
                    fileType: texture.fileType
                };
            });
            return textureObjects;
        },

        async generateActiveTexture() {
			URL.revokeObjectURL(activeTextureUrl);
            const activeTextureId = cachedKeys.getProjectTexture(project.id);
            if (activeTextureId) {
                try {
					// This is also only IDB right now
                    const activeTextureArrayBuffer = await db.getTexture(activeTextureId);
                    if (activeTextureArrayBuffer) {
                        const blobFromBuffer = new Blob([activeTextureArrayBuffer], {
                            type: 'image/png'
                        });
                        const url = URL.createObjectURL(blobFromBuffer);
						activeTextureUrl = url
                        return url;
                    }
                } catch (error) {
                    console.log('Texture from the IDB failed try to fetch remotely...');
                    // logic to fetch texture remotely and then cache locally or not?
                }
            }
        }
    };
};

const project = createProject();
export default project;

export { createProject };
