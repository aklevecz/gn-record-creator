// STRUCTURED DATA
/** @type {Questions} */
const questions = {
	is_mastered: {
		label: 'Is your audio mastered for vinyl',
		options: [
			{ img: '', text: 'yes' },
			{ img: '', text: 'no' }
		]
	},
	which_vinyl: {
		label: 'Whats your favorite color?',
		options: [
			{ img: 'records/green.png', text: 'green' },
			{ img: 'records/orange.png', text: 'orange' },
			{ img: 'records/red.png', text: 'red' },
			{ img: 'records/yellow.png', text: 'yellow' }
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
		},
		remapResponses() {
			const responses = Object.entries(survey.answers).reduce(
				(/** @type {Record<string, string>} */ acc, [key, value]) => {
					acc[key] = value;
					return acc;
				},
				{}
			);
            return responses
		}
	};
};

const survey = createSurvey();
export default survey;
