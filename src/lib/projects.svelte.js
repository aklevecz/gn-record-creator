import { dev } from '$app/environment';
import { FIVE_SECONDS, ONE_SECOND_MS, THIRTY_SECONDS_MS } from './constants';
import db from './db';
import details, { defaultDetailState } from './details.svelte';
import project, { defaultProjectState } from './project.svelte';
import { cachedKeys } from './storage';
import { debounce } from './utils';
import surveyApi from '$lib/api/survey';
import mondayClientApi from '$lib/api/monday';
import { DATA_VERSION } from '$lib';
import monday from '$lib/api/monday';

/** @type {{initialized: boolean,activeProject: string, projects: Project[], cachedTextures: any}} */
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
                        this.reset()
                    }

                    // This wouldn't solve differences in details
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

            defaultProject.details && details.set(defaultProject.details);
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
                const detailResponses = details.remapDetails();
                let mondayId = project.state.mondayId;
                let collectedData = { id: project.state.id, mondayId, responses: { ...detailResponses } };
                try {
                    mondayClientApi.create(collectedData).then((res) => {
                        if (res.mondayId) {
                            mondayId = res.mondayId;
                            collectedData.mondayId = mondayId;
                            project.state.mondayId = mondayId;
                        }
                        // REDUDANCY IN CASE MONDAY FAILS
                        surveyApi.create(collectedData);
                    });
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
            }

            // I think this checks all textures so it is less dependent on the active one, which is always referencable in storage or remote
            project.checkTextures();
        },
        reset() {
            projects.projects = [];
            projects.activeProject = 'new project';
        }
    };
};

const projects = createProjects();
export default projects;
