import survey from './survey.svelte';
import details from './details.svelte';
import project from './project.svelte';
import idb from './idb';
import { debounce } from './utils';

/** @type {{activeProject: string, projects: Project[]}} */
const defaultProjectsState = {
	activeProject: 'default',
	projects: []
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
			const defaultExists = projects.projects.find((project) => project.name === 'default');
			if (defaultExists) {
				console.log('already initialized');
				return;
			}

			// THIS A BIT JANKY
			const allProjects = await idb.getAllProjects();
			let defaultProject = null;
			if (allProjects.length) {
				console.log('REGISTER EXSTING');
				for (const cachedProject of allProjects) {
					if (cachedProject.name === 'default') {
						defaultProject = cachedProject;
						project.set(defaultProject);
					}
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
		},
		/** @param {Project} project */
		registerProject(project) {
			projects.projects = [...projects.projects, project];
		},
		/** @param {Project} project */
		updateProject(project) {
			const projectExists = projects.projects.find((p) => p.name === project.name);
			if (projectExists) {
				projects.projects = projects.projects.map((p) => {
					if (p.name === project.name) {
						return project;
					}
					return p;
				});

				this.debouncedSaveToIDB(project);
			}
		},
		debouncedSaveToIDB: debounce(function (project) {
			idb.addProject(project);
		}, 1000),
		/** @param {string} projectName */
		activateProject(projectName) {
			const existingProject = projects.projects.find((project) => project.name === projectName);
			if (!existingProject) {
				throw new Error(`Project ${projectName} does not exist`);
			}
			projects.activeProject = projectName;
			project.set(existingProject);
			existingProject.survey && survey.set(existingProject.survey);
			existingProject.details && details.set(existingProject.details);
		}
	};
};

const projects = createProjects();
export default projects;
