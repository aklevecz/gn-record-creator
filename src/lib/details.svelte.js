import project from './project.svelte';

/** @type {Record<string, Detail>} */
const detailsDict = {
	project_name: {
		label: 'Project Name',
		description:
			'How would you describe this project? We recommend Artist, Title and Label information',
		value: '',
		type: 'text'
	},
	contact_name: {
		label: 'Contact Name',
		description: "What's your name?",
		value: '',
		type: 'text'
	},
	contact_email: {
		label: 'Contact Email',
		description: 'Who should we email about this project?',
		value: '',
		type: 'text'
	},
	phone: {
		label: 'Phone Number',
		description: 'Please add the best contact phone number',
		value: '',
		type: 'phone'
	},
	label: {
		label: 'Label',
		description: '',
		value: '',
		type: 'text'
	},
	artist: {
		label: 'Aritst',
		description: '',
		value: '',
		type: 'text'
	},
	catalog_number: {
		label: 'Catalog Number',
		description: "If Cat# hasn't been determined yet, please leave blank",
		value: '',
		type: 'text'
	},
	release_date: {
		label: 'Release Date',
		description: 'When is this LP/EP due for release? (Leave blank if not sure)',
		value: '',
		type: 'date'
	},
	depot_date: {
		label: 'Depot Date',
		description:
			'When do you need finished units to be at your desired final destination by (Leave blank if not sure)',
		value: '',
		type: 'date'
	},
	shipping_address: {
		label: 'Where would you like the finished goods to be shipped?',
		description:
			'Either add general city/region, or exact address. This helps us estimate shipping time. (Leave blank if not sure)',
		value: '',
		type: 'text'
	},
	shipping_logistics: {
		label: 'Should GN handle the shipping logistics of the finished goods?',
		description:
			'Or would you prefer to arrange your own pickup via your preferred transit company?',
		value: '',
		type: 'select'
	},
	total_units: {
		label: 'How many total units would you like to manufacture? Our minimum run is 500 units',
		description:
			'If you want to manufacture multiple color variants, this number should encompass everything',
		value: '',
		type: 'number'
	},
	records_per_set: {
		label: '# of records pet set',
		description:
			"Is this a single LP or perhaps a double-LP product? We usually recommend each side of a record doesn't go beyond 22 minutes in duration",
		value: '',
		type: 'select'
	},
	record_format: {
		label: 'RPM / Record Format',
		description: 'Please note only make 12in 180g records at this time',
		value: '',
		type: 'select'
	},
	record_color: {
		label: 'What color(s) would you like your records to be?',
		description:
			'Our records can be manufactured as solid or translucent colors. If unsure, please leave blank. Color options here: https://www.goodneighbormusic.com',
		value: '',
		type: 'select'
	},
	lacquers: {
		label: 'Lacquers: Would you like us to handle this for you?',
		description:
			'Do you already have someone cutting the master? If not, we work with some of the best cutters in the world and can help!',
		value: '',
		type: 'select'
	},
	metalwork: {
		label: 'Metalwork: What type of stampers do you need?',
		description:
			'Making stampers is a standard step in the record making process. For optimal quality, we recommend that we make your stampers.',
		value: '',
		type: 'select'
	},
	test_prints: {
		label: '# of Test Pressings required?',
		description: '',
		value: '',
		type: 'text'
	},
	packaging: {
		label: 'Packaging: What type of LP jacket did you want to print?',
		description: '',
		value: '',
		type: 'select'
	},
	notes: {
		label: 'Add your project details, comments and/or requests below.',
		description:
			'Did you want any lyric sheets or inserts? Please add any packaging notes we should know about.',
		value: '',
		type: 'text'
	}
};

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
		/** @param {Details} newState */
		set(newState) {
			details = newState;
		},
		/** @param {string} key @param {string} value */
		setValue(key, value) {
			details.details[key].value = value;
			project.updateDetails(details);
		},
		remapDetails() {
			const responses = Object.entries(details.details).reduce(
				(/** @type {Record<string, string>} */ acc, [key, obj]) => {
					acc[key] = obj.value;
					return acc;
				},
				{}
			);
			return responses;
		}
	};
};

const details = createDetails();

export default details;
