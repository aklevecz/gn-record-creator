// const detailItems = [
// 	{ key: 'project_name', label: 'Project Name' },
// 	{ key: 'company_name', label: 'Company Name' },
// 	{ key: 'your_name', label: 'Your Name' },
// 	{ key: 'email', label: 'Email Address' },
// 	{ key: 'phone_number', label: 'Phone Number' },
// 	{ key: 'artist_name', label: 'Artist Name' },
// 	{ key: 'project_title', label: 'Project Title' }
// ];

/**
 * @typedef Detail
 * @property {string} label
 * @property {string} value
 */

/** @type {Record<string, Detail>} */
const detailsDict = {
    project_name: {
        label: 'Project Name', value: ''},
    company_name: {
        label: 'Company Name', value: ''},
    your_name: {
        label: 'Your Name', value: ''},
    email: {
        label: 'Email Address', value: ''},
    phone_number: {
        label: 'Phone Number', value: ''},
    artist_name: {
        label: 'Artist Name', value: ''},
    project_title: {
        label: 'Project Title', value: ''}
}

/**
 * @typedef Details
 * @property {Record<string, Detail>} details
 */

/** @type {Details} */
const defaultDetailState = {
	details: detailsDict
};

const createDetails = () => {
	let details = $state({ ...defaultDetailState });

	return {
		get state() {
			return details;
		},
		/** @param {string} key @param {string} value */
		set(key, value) {
			details.details[key].value = value;
		}
	};
};

const details = createDetails();

export default details;
