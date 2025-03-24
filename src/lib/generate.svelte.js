import generateApi from '$lib/api/generate';
import uploadApi from '$lib/api/upload';
import { calculateFileHash, fetchImageAsBlob } from '$lib/utils';
import db from './db';
import project from './project.svelte';
import projects from './projects.svelte';
import { cachedKeys } from './storage';

export const GenerationErrors = {
    NETWORK: 'Check your internet connection and try again',
    NO_RESPONSE: 'No response from server',
    TIMEOUT: 'Generation took too long',
    CANCELED: 'Generation was canceled',
    FAILED: 'Generation failed - please try again',
    INVALID_ID: 'Invalid generation ID received'
};

/** @type {{generating: boolean, status: Status, outputs: any[], percentage: number, cachedImgs: IDBTextureObject[]}} */
const defaultState = {
    generating: false,
    status: 'idle',
    outputs: [],
    percentage: 0,
    cachedImgs: []
};
const createGenerateStore = () => {
    let generate = $state({ ...defaultState });

    async function refreshAllGeneratedImgs() {
        // Using Texture Object instead of generated collection, because the generated collection no longer stores the file buffer
        // const generatedImgs = await db.getAllGeneratedImgs();
        const generatedImgs = await db.getTexturesByProjectId(project.state.id);
        generate.cachedImgs = generatedImgs
            .filter((img) => img.seed !== 'user-upload')
            .sort(
                (/** @type {IDBTextureObject} */ a, /** @type {IDBTextureObject} */ b) =>
                    a.lastModified - b.lastModified
            );
    }

    return {
        get state() {
            return generate;
        },
        /**
         * Asynchronously generates data based on the provided prompt by making
         * a request to the API.
         *
         * @param {string} prompt - The text prompt used for generating data.
         * @param {string} model - The model used for generating data.
         * @returns {Promise<ReplicateResponse | undefined>} - A promise that resolves with the generated data.
         * @throws Will log an error if the request fails.
         */
        createGeneration: async (prompt, model) => {
            generate.generating = true;
            // try {
            let data = await generateApi.generate(prompt, model);
            return data;
            // } catch (error) {
            // 	throw new Error(error);
            // }
        },

        /**
         * Periodically polls the API to check on the status of a generation.
         * If the generation has finished, updates the state and clears the interval.
         * If the generation times out (defined by `maxTimeout`), clears the interval and
         * sets the state to "canceled".
         *
         * @param {string} id - The generation ID to poll.
         * @param {function} cb - The callback function to call when the generation finishes.
         * @returns {Promise<number>} The ID of the interval that was set.
         */
        pollGeneration: async (id, cb) => {
            /** @type {*} */
            let interval = null;
            let intervalMs = 1000;
            let maxTimeout = 60 * 1000 * 6;
            let intervalStart = Date.now();
            generate.generating = true;
            interval = setInterval(async () => {
                const data = await generateApi.checkGeneration(id);
                const str = data.logs;
                const seed = str.match(/Using seed: (\d+)/)?.[1];
                const prompt = str.match(/Prompt: (.*?)(?=txt2img)/s)?.[1];
                const loadTime = str.match(/Loading LoRA took: ([\d.]+)/)?.[1];

                // Updated regex for progress updates
                const progressUpdates = [
                    ...str.matchAll(
                        /(\d+)%\|[█▌▎▍▋▊▉ ]+\| (\d+)\/(\d+) \[([^\]]+)\](?:, ([\d.]+)it\/s)?/g
                    )
                ].map((match) => ({
                    percentage: parseInt(match[1]),
                    step: parseInt(match[2]),
                    totalSteps: parseInt(match[3]),
                    time: match[4],
                    iterationsPerSecond: match[5] ? parseFloat(match[5]) : null
                }));

                try {
                    generate.percentage = progressUpdates[progressUpdates.length - 1].percentage;
                } catch (e) {}

                console.log({
                    seed,
                    prompt,
                    loadTime,
                    progressUpdates
                });

                generate.status = data.status;
                if (data.status === 'succeeded') {
                    generate.generating = false;
                    generate.outputs = data.output;
                    // history.add(data.output[0]);
                    const imgUrl = data.output[0];

                    const promptSeed = `${prompt?.replace(/[^a-zA-Z0-9]/g, '_')}_${seed}`;
                    // overkill?
                    // const id = `${projects.activeProject?.id}-${promptSeed}`;
                    const id = promptSeed;
                    fetchImageAsBlob(imgUrl).then(async function (blob) {
                        const projectId = projects.activeProject?.id || 'missing-project-id';
                        const imgSeed = seed || 'missing-seed';
                        const imgPrompt = prompt || 'missing-prompt';

                        // const fileName = promptSeed;

                        const fileHash = await calculateFileHash(blob);

                        // DEPRECATED?
                        await db.addGeneratedImg({
                            id: promptSeed,
                            projectId,
                            imgUrl,
                            fileHash,
                            fileType: blob.type,
                            seed: imgSeed,
                            prompt: imgPrompt
                        });

                        await db.saveTexture(fileHash, blob, {
                            seed: imgSeed,
                            id: fileHash,
                            fileName: promptSeed,
                            fileHash,
                            projectId
                        });
                        cachedKeys.setProjectTexture(projectId, fileHash);
                        project.setActiveTexture(fileHash);
                        project.checkTextures();
                        // project.generateActiveTexture();

                        if (projects.activeProject?.id) {
                            uploadApi.uploadTexture({
                                id: fileHash,
                                fileName: promptSeed,
                                projectId,
                                image: blob,
                                seed: imgSeed,
                                prompt: imgPrompt
                            });
                        }

                        cb(imgUrl);
                        // threeScene.updateMaterialTexture(URL.createObjectURL(blob))
                        await refreshAllGeneratedImgs();
                        generate.percentage = 0;
                    });
                    clearInterval(interval);
                } else if (data.status === 'failed') {
                    generate.generating = false;
                    clearInterval(interval);
                } else if (data.status === 'canceled') {
                    generate.generating = false;
                    clearInterval(interval);
                }
                let timeElapsed = Date.now() - intervalStart;
                if (timeElapsed > maxTimeout) {
                    generate.generating = false;
                    clearInterval(interval);
                }
            }, intervalMs);
            return interval;
        },
        refreshAllGeneratedImgs,
        /** @param {Status} status */
        setStatus: (status) => {
            generate.status = status;
        },
        reset: () => {
            generate = { ...defaultState };
        }
    };
};

const generate = createGenerateStore();

export default generate;
