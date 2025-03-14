// STRUCTURED DATA

import project from './project.svelte';

/** @type {Questions} */
export const questions = {
	shipping_logistics: {
		label: 'Should GN handle the shipping logistics of the finished goods?',
		options: [
			{ img: '', text: 'Yes, please handle the logistics for me' },
			{ img: '', text: 'No, thank you - I will arrange the pickup' },
			{ img: '', text: "Not sure, let's chat" }
		]
	},
	records_per_set: {
		label: '# of records pet set',
		options: [
			{ img: '', text: '1LP' },
			{ img: '', text: '2LP' },
			{ img: '', text: '3LP' },
			{ img: '', text: '4LP' },
			{ img: '', text: "Not sure, let's setup a call" }
		]
	},
	record_format: {
		label: 'RPM / Record Format',
		options: [
			{ img: '', text: '33 12in/180g' },
			{ img: '', text: '45 12in/180g' },
			{ img: '', text: "Not sure, let's setup a call" }
		]
	},
	record_color: {
		label: 'Whats your favorite color?',
		options: [
			{ img: 'records/cosmic-black.png', text: 'cosmic-black' },
			{ img: 'records/purple-haze.png', text: 'purple-haze' },
			{ img: 'records/ocean-floor.png', text: 'ocean-floor' },
			{ img: 'records/sky-blue.png', text: 'sky-blue' },
			{ img: 'records/salsa-verde.png', text: 'salsa-verde' },
			{ img: 'records/limoncello.png', text: 'limoncello' },
			{ img: 'records/habanero.png', text: 'habanero' },
			{ img: 'records/red-alert.png', text: 'red-alert' },
			{ img: 'records/hibiscus.png', text: 'hibiscus' },
			{ img: 'records/lightning.png', text: 'lightning' },
			{ img: 'records/glassy-ice.png', text: 'glassy-ice' }
		]
	},
	lacquers: {
		label: 'Lacquers: Would you like us to handle this for you?',
		options: [
			{ img: '', text: 'Yes, please handle on our behalf' },
			{ img: '', text: 'No, we have this handled and will ship them to you' },
			{ img: '', text: "Not sure, let's discuss this on a call" }
		]
	},
	metalwork: {
		label: "Metalwork: What type of stampers do you need?",
		options: [
			{ img: '', text: '2 Step Stamper' },
			{ img: '', text: '3 Step Stamper' },
			{ img: '', text: "Not sure, let's discuss this on a call" },
			{ img: '', text: "Not required, we already have stampers and can ship them to you" }
		]
	},
	packaging: {
		label: 'Packaging: What type of LP jacket did you want to print?',
		options: [
			{ img: '', text: 'Single Pocket' },
			{ img: '', text: 'Gatefold' },
			{ img: '', text: 'Single Pocket with Wide Spine (2LP)' },
			{ img: '', text: 'No Packaging Required - we\'ll supply it to you ourselves' },
			{ img: '', text: "Not sure, let's set up a call" }
		]
	}
};

/** @type {Survey} */
const defaultSurveyState = {
	questions,
	answers: {}
};

// DEPRECATED IN FAVOR OF USING DETAILS STORE?
const createSurvey = () => {
	let survey = $state({ ...defaultSurveyState });

	return {
		get state() {
			return survey;
		},
		/** @param {Survey} newState */
		set(newState) {
			survey = newState;
		},
		/** @param {string} questionKey @param {string} answer */
		answer(questionKey, answer) {
			survey.answers[questionKey] = answer;
			project.updateSurvey(survey);
		},
		remapResponses() {
			const responses = Object.entries(survey.answers).reduce(
				(/** @type {Record<string, string>} */ acc, [key, value]) => {
					acc[key] = value;
					return acc;
				},
				{}
			);
			return responses;
		},
		reset() {
			survey = { ...defaultSurveyState };
		}
	};
};

const survey = createSurvey();
export default survey;
