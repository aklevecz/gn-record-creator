import { dev } from '$app/environment';
import { DATA_VERSION } from '$lib';
import surveyApi from '$lib/api/survey';
import mondayApi from '$lib/api/monday';
import { FIVE_SECONDS, ONE_SECOND_MS, THIRTY_SECONDS_MS } from './constants';
import db from './db';
import details, { defaultDetailState } from './details.svelte';
import project, { defaultProjectState } from './project.svelte';
import { cachedKeys } from './storage';
import { debounce } from './utils';

/** @type {{initialized: boolean, activeProject: string, projects: Project[], cachedTextures: any}} */
const defaultProjectsState = {
    initialized: false,
    activeProject: 'new project',
    projects: [],
    cachedTextures: []
};

const createProjects = () => {
    const projects = $state({ ...defaultProjectsState });

    return {
        get state() {
            return projects;
        },
        get activeProject() {
            return projects.projects.find((project) => project.id === projects.activeProject);
        },
        get initialized() {
            return projects.initialized;
        },
        async init() {
            // STILL SHOULD DO SOME LOGIC TO FETCH REMOTE PROJECTS AND COMPARE THEM TO LOCAL
            if (projects.projects.length) {
                console.log('Projects already loaded');
                return;
            }
            const allProjects = await db.getAllProjects();
            let defaultProject = null;

            // If there are existing projects in the cache
            if (allProjects.length) {
                // Might be important to make sure cached data shares the same current model as things are changing
                // Or need to version the local state as well-- though this also works?
                for (let cachedProject of allProjects) {
                    let forceUpdate = false;
                    if (cachedProject.version !== DATA_VERSION) {
                        forceUpdate = true;
                        // NEED TO IMPROVE: This just sets their detail values to the default
                        cachedProject.details = { ...defaultDetailState };
                        cachedProject.version = DATA_VERSION;
                        this.reset();
                    }

                    // Oh this compares the top level of the project state model to the cached projects
                    if (Object.keys(defaultProjectState).every((key) => cachedProject[key])) {
                        console.log(`Project ${cachedProject.id} has all expected keys`);
                    } else {
                        forceUpdate = true;
                        console.log(`Project ${cachedProject.id} does not have all expected keys`);
                        cachedProject = { ...defaultProjectState, ...cachedProject };
                    }

                    if (forceUpdate) {
                        db.saveProject(cachedProject);
                    }
                    this.registerProject(cachedProject);
                }

                const cachedActiveProject = cachedKeys.getActiveProject();
                if (cachedActiveProject) {
                    defaultProject = allProjects.find((/** @type {Project} */ p) => p.id === cachedActiveProject);
                }
                if (!defaultProject) {
                    defaultProject = allProjects[0];
                }
            } else {
                // If there are no existing projects, then create a default project
                defaultProject = project.create({
                    name: 'new project',
                    details: { ...details.state },
                    textures: []
                });
                db.saveProject(defaultProject);
                this.registerProject(defaultProject);
            }

            // Remote survey gets in the way
            // for (const [key, entry] of Object.entries(defaultProject.details)) {
            //     // TODO: Figure out how to check arrays efficently, in this case only for colors
            //     if (formFields[key].options && (entry.value && typeof entry.value === 'string')) {
            //         const possibleValues = formFields[key].options.map((option) => option.value);
            //         if (!possibleValues.includes(entry.value)) {
            //             console.log(`Invalid value for ${key}: ${entry.value}`);
            //             defaultProject.details[key].value = ''
            //         }
            //     }
            // }
            // defaultProject.details && details.set(defaultProject.details);
            this.activateProject(defaultProject.id);
            projects.initialized = true;
        },
        /** @param {Project} project */
        registerProject(project) {
            projects.projects = [...projects.projects, project];
        },
        /** @param {string} projectId */
        unregisterProject(projectId) {
            projects.projects = projects.projects.filter((p) => p.id !== projectId);
        },
        /** @param {string} projectId */
        deleteProject(projectId) {
            db.deleteProject(projectId);
            this.unregisterProject(projectId);
        },
        /** @param {Project} updatedProject */
        updateProject(updatedProject) {
            const projectExists = projects.projects.find((p) => p.id === updatedProject.id);
            if (projectExists) {
                projects.projects = projects.projects.map((p) => {
                    if (p.id === updatedProject.id) {
                        return updatedProject;
                    }
                    return p;
                });

                this.debouncedSaveRemote();
                this.debounceSaveToDB(updatedProject);
            }
        },
        debouncedSaveRemote: debounce(
            () => {
                const detailResponses = details.remapDetailsAndStringify();
                let mondayId = project.state.mondayId;
                let collectedData = { id: project.state.id, mondayId, responses: { ...detailResponses } };
                try {
                    // mondayClientApi.create(collectedData).then((res) => {
                    //     if (res.mondayId) {
                    //         mondayId = res.mondayId;
                    //         collectedData.mondayId = mondayId;
                    //         project.state.mondayId = mondayId;
                    //     }
                    // REDUDANCY IN CASE MONDAY FAILS
                    surveyApi.create(collectedData);
                    // });
                } catch (e) {
                    console.error(e);
                    // REDUNDANCY IN CASE MONDAY FAILS
                    surveyApi.create(collectedData);
                } finally {
                }
            },
            dev ? FIVE_SECONDS : THIRTY_SECONDS_MS
        ),
        debounceSaveToDB: debounce(function (/** @type {Project} */ project) {
            db.saveProject(project);
        }, ONE_SECOND_MS),

        /** @param {string} projectId */
        async activateProject(projectId) {
            console.log('Activating project', projectId);
            const existingProject = projects.projects.find((project) => project.id === projectId);
            if (!existingProject) {
                throw new Error(`Project ${projectId} does not exist`);
            }
            projects.activeProject = projectId;
            project.set(existingProject);
            existingProject.details && details.set(existingProject.details);
            cachedKeys.setActiveProject(projectId);

            const existingActiveTextureId = cachedKeys.getProjectTexture(projectId);
            if (existingActiveTextureId) {
                project.setActiveTexture(existingActiveTextureId);
            } else {
                project.resetActiveTexture()
            }

            // I think this checks all textures so it is less dependent on the active one, which is always referencable in storage or remote
            project.checkTextures();
        },
        reset() {
            projects.projects = [];
            projects.activeProject = 'new project';
        },
        /**
         * Check if a project has submitted status in Monday.com
         * @param {string} projectId - The local project ID
         * @returns {Promise<{success: boolean, data?: {isSubmitted: boolean, currentStatus: string, mondayId: string, lastChecked: string}, error?: string}>}
         */
        async checkProjectSubmittedStatus(projectId) {
            const project = projects.projects.find(p => p.id === projectId);
            
            if (!project) {
                return {
                    success: false,
                    error: 'Project not found'
                };
            }

            if (!project.mondayId) {
                return {
                    success: false,
                    error: 'Project does not have a Monday ID'
                };
            }

            return await mondayApi.checkSubmittedStatus(project.mondayId);
        },
        /**
         * Check if the currently active project has submitted status in Monday.com
         * @returns {Promise<{success: boolean, data?: {isSubmitted: boolean, currentStatus: string, mondayId: string, lastChecked: string}, error?: string}>}
         */
        async checkActiveProjectSubmittedStatus() {
            if (!projects.activeProject) {
                return {
                    success: false,
                    error: 'No active project'
                };
            }

            return await this.checkProjectSubmittedStatus(projects.activeProject);
        }
    };
};

const projects = createProjects();
export default projects;
