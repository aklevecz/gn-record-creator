// Questions just maps the questions for the survey
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
		label: '# of records per set',
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

// For instance details dict includes all of the above questions, but doesnt have their values
// I could just wrap them all into details
/** @type {Record<string, Detail>} */
export const detailsDict = {
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
        type: 'email'
    },
    phone: {
        label: 'Phone Number',
        description: 'Please add the best contact phone number',
        value: '',
        type: 'tel'
    },
    label: {
        label: 'Label',
        description: '',
        value: '',
        type: 'text'
    },
    artist: {
        label: 'Artist',
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
        type: 'address'
    },
    shipping_logistics: {
        label: 'Should GN handle the shipping logistics of the finished goods?',
        description:
            'Or would you prefer to arrange your own pickup via your preferred transit company?',
        value: '',
        type: 'dropdown'
    },
    total_units: {
        label: 'How many total units would you like to manufacture? Our minimum run is 500 units',
        description:
            'If you want to manufacture multiple color variants, this number should encompass everything',
        value: '',
        type: 'number'
    },
    records_per_set: {
        label: '# of records per set',
        description:
            "Is this a single LP or perhaps a double-LP product? We usually recommend each side of a record doesn't go beyond 22 minutes in duration",
        value: '',
        type: 'dropdown'
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
        type: 'select',
        tooltip: {
            name: 'lacquers',
            cta: 'What are lacquers?',
            description: 'lacquers are like lacquers that make lacquers',
            link: 'https://lacquers.com'
        }
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