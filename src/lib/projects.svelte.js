import survey from './survey.svelte';
import details from './details.svelte';
import project from './project.svelte';
import idb from './idb';
import { debounce } from './utils';

/** @type {{activeProject: string, projects: Project[], cachedTextures: any}} */
const defaultProjectsState = {
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
			return projects.projects.find((project) => project.name === projects.activeProject);
		},
		async init() {
			if (projects.projects.length) {
				console.log('Projects already loaded');
				return;
			}

			// THIS A BIT JANKY
			const allProjects = await idb.getAllProjects();
			let defaultProject = null;
			if (allProjects.length) {
				console.log('REGISTER EXSTING');
				defaultProject = allProjects[0]
				project.set(defaultProject);
				// this.registerProject(defaultProject)
				for (const cachedProject of allProjects) {
					// if (cachedProject.name === 'default') {
					// 	defaultProject = cachedProject;
					// 	project.set(defaultProject);
					// }
					this.registerProject(cachedProject);
				}
			} else {
				console.log('REGISTER NEW');
				defaultProject = project.create({
					name: 'default',
					details: { ...details.state },
					survey: { ...survey.state }
				});
				idb.addProject(defaultProject);
				this.registerProject(defaultProject);
			}

			// defaultProject.survey && survey.set(defaultProject.survey);
			defaultProject.details && details.set(defaultProject.details);
			this.activateProject(defaultProject.name);
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

				this.debouncedSaveToIDB(project);
				this.activateProject(project.name);
			}
		},
		debouncedSaveToIDB: debounce(function (project) {
			idb.addProject(project);
		}, 500),
		/** @param {string} projectName */
		async activateProject(projectName) {
			// SHOULD USE ID
			const existingProject = projects.projects.find((project) => project.name === projectName);
			if (!existingProject) {
				throw new Error(`Project ${projectName} does not exist`);
			}
			projects.activeProject = projectName;
			project.set(existingProject);
			existingProject.survey && survey.set(existingProject.survey);
			existingProject.details && details.set(existingProject.details);

			const cachedTextures = await idb.getTexturesByProjectId(existingProject.id);
			
			// projects.cachedTextures = cachedTextures.sort(
			// 	(/** @type {GeneratedImgEntry} */ a, /** @type {GeneratedImgEntry} */ b) =>
			// 		a.lastModified - b.lastModified
			// );

			projects.cachedTextures = cachedTextures.map(texture => {
				console.log(`Loading file ${texture.imgFile.name}`);
				const blobFromBuffer = new Blob([texture.arrayBuffer], { type: texture.imgFile.type });
				const url = URL.createObjectURL(blobFromBuffer);
				return url
			})
		},
		reset() {
			projects.projects = [];
			projects.activeProject = 'default';
		}
	};
};

const projects = createProjects();
export default projects;
