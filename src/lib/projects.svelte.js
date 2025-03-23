// import survey from './survey.svelte';
import db from './db';
import details from './details.svelte';
import project from './project.svelte';
import { cachedKeys } from './storage';
import { debounce } from './utils';

const ONE_SECOND_MS = 1000;

/** @type {{initialized: boolean,activeProject: string, projects: Project[], cachedTextures: any}} */
const defaultProjectsState = {
    initialized: false,
    activeProject: 'default',
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
                const cachedActiveProject = cachedKeys.getActiveProject();
                if (cachedActiveProject) {
                    defaultProject = allProjects.find(
                        (/** @type {Project} */ p) => p.id === cachedActiveProject
                    );
                }
                if (!defaultProject) {
                    defaultProject = allProjects[0];
                }

                for (const cachedProject of allProjects) {
                    this.registerProject(cachedProject);
                }
            } else {
				// If there are no existing projects, then create a default project
                defaultProject = project.create({
                    name: 'default',
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
        removeProject(projectId) {
            projects.projects = projects.projects.filter((p) => p.id !== projectId);
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

                this.debounceSaveToDB(updatedProject);
            }
        },

        debounceSaveToDB: debounce(function (/** @type {Project} */ project) {
            db.saveProject(project);
        }, ONE_SECOND_MS),

        /** @param {string} projectId */
        async activateProject(projectId) {
            console.log("Activating project", projectId);
            const existingProject = projects.projects.find((project) => project.id === projectId);
            if (!existingProject) {
                throw new Error(`Project ${projectId} does not exist`);
            }
            projects.activeProject = projectId;
            project.set(existingProject);
            existingProject.details && details.set(existingProject.details);
            cachedKeys.setActiveProject(projectId);
            project.checkTextures()
            project.generateActiveTexture()
        },
        reset() {
            projects.projects = [];
            projects.activeProject = 'default';
        }
    };
};

const projects = createProjects();
export default projects;
