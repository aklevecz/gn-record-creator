

/** @type {Questions} */
const questions = {
	is_mastered: {
		label: 'Is your audio mastered for vinyl',
		options: [
			{ img: '', text: 'Yes' },
			{ img: '', text: 'No' }
		]
	},
	which_vinyl: {
		label: 'Whats your favorite color?',
		options: [
			{ img: 'records/green.png', text: 'Green' },
			{ img: 'records/orange.png', text: 'Orange' },
			{ img: 'records/red.png', text: 'Red' },
			{ img: 'records/yellow.png', text: 'Yellow' }
		]
	}
};

/**
 * @typedef Survey
 * @property {Questions} questions
 * @property {Record<string, string>} answers
 */

/** @type {Survey} */
const defaultSurveyState = {
	questions,
	answers: {}
};

const createSurvey = () => {
	let survey = $state({ ...defaultSurveyState });

	return {
		get state() {
			return survey;
		},
		/** @param {string} questionKey @param {string} answer */
		answer(questionKey, answer) {
			survey.answers[questionKey] = answer;
		}
	};
};

const survey = createSurvey();
export default survey;
