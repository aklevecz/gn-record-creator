import projects from './projects.svelte';
import { serializeDeep } from './utils';

/** @type {Project} */
const defaultProjectState = {
	id: '',
	name: 'default',
	createdAt: new Date(),
	details: null,
	survey: null,
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

const createProject = () => {
	let project = $state({ ...defaultProjectState });

	return {
		get state() {
			return project;
		},
		/** @param {Project} newState */
		set(newState) {
			project = newState;
		},
		/**
		 * @param {{name?: string, details: Details, survey: Survey}} props
		 * @returns {Project}
		 */
		create({ name, details, survey }) {
			const id = crypto.randomUUID();
			project.id = id;
			project.name = name || id;
			project.details = details;
			project.survey = survey;
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
				survey: project.survey,
				createdAt: project.createdAt,
				pricing: project.pricing
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
		/** @param {Survey} survey */
		updateSurvey(survey) {
			project.survey = survey;
			projects.updateProject(serializeDeep(project));
		}
	};
};

const project = createProject();
export default project;

export { createProject };
