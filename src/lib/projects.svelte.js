// import survey from './survey.svelte';
import db from './db';
import details from './details.svelte';
import project from './project.svelte';
import { cachedKeys } from './storage';
import { debounce } from './utils';

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
			if (projects.projects.length) {
				console.log('Projects already loaded');
				return;
			}
			// THIS A BIT JANKY
			const allProjects = await db.getAllProjects()
			// console.log(`allProjects in projects.svelte ${JSON.stringify(allProjects)}`)
			let defaultProject = null;
			if (allProjects.length) {
				// CACHE THE LAST PROJECT INSTEAD OF GRABBING THE FIRST ONE?
				const cachedActiveProject = cachedKeys.getActiveProject();
				if (cachedActiveProject) {
					defaultProject = allProjects.find(
						(/** @type {Project} */ p) => p.id === cachedActiveProject
					);
				} else {
				}
				if (!defaultProject) {
					defaultProject = allProjects[0];
				}
				project.set(defaultProject);
				// this.registerProject(defaultProject)
				for (const cachedProject of allProjects) {
					// if (cachedProject.name === 'default') {
					// 	defaultProject = cachedProject;
					// 	project.set(defaultProject);
					// }
					// console.log(`Registering cachedproject ${JSON.stringify(cachedProject)}`)
					this.registerProject(cachedProject);
				}
			} else {
				// CREATE NEW DEFAULT PROJECT
				defaultProject = project.create({
					name: 'default',
					details: { ...details.state }
					// survey: { ...survey.state }
				});
				db.saveProject(defaultProject);
				// idb.addProject(defaultProject);
				this.registerProject(defaultProject);
			}

			// defaultProject.survey && survey.set(defaultProject.survey);
			defaultProject.details && details.set(defaultProject.details);
			// this.activateProject(defaultProject.name);
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
		/** @param {Project} project */
		updateProject(project) {
			// const projectExists = projects.projects.find((p) => p.name === project.name);
			const projectExists = projects.projects.find((p) => p.id === project.id);
			if (projectExists) {
				projects.projects = projects.projects.map((p) => {
					if (p.name === project.name) {
						return project;
					}
					return p;
				});

				this.debounceSaveToDB(project);
				// this.activateProject(project.name);
				this.activateProject(project.id);
			}
		},

		debounceSaveToDB: debounce(function (/** @type {Project} */ project) {
			// idb.addProject(project);
			db.saveProject(project);
		}, 5000),

		/** @param {string} projectId */
		async activateProject(projectId) {
			// SHOULD USE ID
			const existingProject = projects.projects.find((project) => project.id === projectId);
			if (!existingProject) {
				throw new Error(`Project ${projectId} does not exist`);
			}
			projects.activeProject = projectId;
			project.set(existingProject);
			// existingProject.survey && survey.set(existingProject.survey);
			existingProject.details && details.set(existingProject.details);
			cachedKeys.setActiveProject(projectId);
		},
		reset() {
			projects.projects = [];
			projects.activeProject = 'default';
		}
	};
};

const projects = createProjects();
export default projects;
