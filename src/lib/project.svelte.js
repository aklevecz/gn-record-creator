import projects from "./projects.svelte";
import { serializeDeep } from "./utils";

/** @type {Project} */
const defaultProjectState = {
	id: '',
	name: 'default',
	createdAt: new Date(),
	details: null,
	survey: null
};

const createProject = () => {
	let project = $state({ ...defaultProjectState });

	return {
		get state() {
			return project;
		},
        /** @param {Project} newState */
        set(newState) {
            project = newState
        },
		/** 
         * @param {{name: string, details: Details, survey: Survey}} props
         * @returns {Project}
        */
		create({ name, details, survey }) {
            project.id = crypto.randomUUID();
			project.name = name;
			project.details = details;
			project.survey = survey;
			project.createdAt = new Date();
			return {
				id: project.id,
				name: project.name,
				details: project.details,
				survey: project.survey,
				createdAt: project.createdAt
			};
		},
		/** @param {{name: string, details: Details, survey: Survey}} props */
		update({ name, details, survey }) {
			project.name = name;
			project.details = details;
			project.survey = survey;

			return {
				name: project.name,
				details: project.details,
				survey: project.survey,
				createdAt: project.createdAt
			};
		},
		/** @param {string} name */
		updateName(name) {
			project.name = name;
            projects.updateProject(serializeDeep(project))
		},
		/** @param {Details} details */
		updateDetails(details) {
			project.details = details;
            projects.updateProject(serializeDeep(project))
		},
		/** @param {Survey} survey */
		updateSurvey(survey) {
			project.survey = survey;
            projects.updateProject(serializeDeep(project));
		}
	};
};

const project = createProject();
export default project;
