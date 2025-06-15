export const recordColors = {
    purpleHaze: 'Purple haze',
    cosmicBlack: 'Cosmic black',
    oceanFloor: 'Ocean floor (dark blue)',
    skyBlue: 'Sky blue',
    salsaVerde: 'Salsa verde (green)',
    limoncello: 'Limocello (yellow)',
    habanero: 'Habanero (orange)',
    redAlert: 'Red alert',
    hibiscus: 'Hibiscus (pink)',
    lightning: 'Lightning (white)',
    glassyIce: 'Glassy (clear)'
};

// Questions just maps the questions for the survey
/** @type {Questions} */
export const questions = {
    shipping_logistics: {
        label: 'Should GN handle the shipping logistics of the finished goods?',
        options: [
            // { img: '', text: 'Yes, please handle the logistics for me' },
            // { img: '', text: 'No, thank you - I will arrange the pickup' },
            // { img: '', text: "Not sure, let's chat" }
            { img: '', text: 'No' },
            { img: '', text: 'Yes' },
            { img: '', text: 'Maybe' }
        ]
    },
    records_per_set: {
        label: '# of records per set',
        options: [
            { img: '', text: '2LP' },
            { img: '', text: '1LP' },
            { img: '', text: '3LP' },
            { img: '', text: '4LP' },
            { img: '', text: 'Not sure' }
            // { img: '', text: "Not sure, let's setup a call" }
        ]
    },
    record_format: {
        label: 'RPM / Record Format',
        options: [
            { img: '', text: '45 12in/180g' },
            { img: '', text: '33 12in/180g' },
            { img: '', text: 'Not sure' }
            // { img: '', text: "Not sure, let's setup a call" }
        ]
    },
    record_color: {
        label: 'Whats your favorite color?',
        options: [
            // { img: 'records/cosmic-black.png', text: 'A: Cosmic Black' },
            // { img: 'records/purple-haze.png', text: 'F: Purple Haze' },
            // { img: 'records/ocean-floor.png', text: 'B: Ocean Floor (Dark Blue)' },
            // { img: 'records/sky-blue.png', text: 'C: Sky Blue' },
            // { img: 'records/salsa-verde.png', text: 'D: Salsa Verde (Green)' },
            // { img: 'records/limoncello.png', text: 'K: Limocello (Yellow)' },
            // { img: 'records/habanero.png', text: 'G: Habanero (Orange)' },
            // { img: 'records/red-alert.png', text: 'H: Red Alert' },
            // { img: 'records/hibiscus.png', text: 'E: Hibiscus (Pink)' },
            // { img: 'records/lightning.png', text: 'J: Lightning (White)' },
            // { img: 'records/glassy-ice.png', text: 'L: Glassy (Clear)' }
            /** @type {Record<string, string>} */
            // export const colors = {
            // 	cosmicBlack: '#030303',
            // 	glassyIce: '#7e7e7e',
            // 	habanero: '#ff5214',
            // 	hibiscus: '#d30273',
            // 	lightning: '#e2e2e2',
            // 	limoncello: '#ded028',
            // 	oceanFloor: '#003479',
            // 	purpleHaze: '#913574',
            // 	redAlert: '#dd2a1e',
            // 	salsaVerde: '#398930',
            // 	skyBlue: '#0072b0'
            // };
            { img: 'records/purple-haze.png', text: recordColors.purpleHaze, color: '#913574' },
            { img: 'records/cosmic-black.png', text: recordColors.cosmicBlack, color: '#030303' },
            { img: 'records/ocean-floor.png', text: recordColors.oceanFloor, color: '#003479' },
            { img: 'records/sky-blue.png', text: recordColors.skyBlue, color: '#0072b0' },
            { img: 'records/salsa-verde.png', text: recordColors.salsaVerde, color: '#398930' },
            { img: 'records/limoncello.png', text: recordColors.limoncello, color: '#ded028' },
            { img: 'records/habanero.png', text: recordColors.habanero, color: '#ff5214' },
            { img: 'records/red-alert.png', text: recordColors.redAlert, color: '#dd2a1e' },
            { img: 'records/hibiscus.png', text: recordColors.hibiscus, color: '#d30273' },
            { img: 'records/lightning.png', text: recordColors.lightning, color: '#e2e2e2' },
            { img: 'records/glassy-ice.png', text: recordColors.glassyIce, color: '#7e7e7e' }
        ]
    },
    opacity: {
        label: 'Your record has the option of being opaque or transparent',
        options: [
            { img: '', text: 'Opaque' },
            { img: '', text: 'Transparent' }
        ]
    },
    lacquers: {
        label: 'Lacquers: Would you like us to handle this for you?',
        options: [
            // { img: '', text: "Not Sure. Let's discuss this on a call." },
            // { img: '', text: 'Yes, please handle on our behalf' },
            // { img: '', text: 'No, we have this handled and will ship them to you.' }
            { img: '', text: 'Maybe' },
            { img: '', text: 'Yes' },
            { img: '', text: 'No' }
        ]
    },
    metalwork: {
        label: 'Metalwork: What type of stampers do you need?',
        options: [
            // { img: '', text: '2 Step Stamper' },
            // { img: '', text: '1 Step Stamper' },
            // { img: '', text: '3 Step Stamper' },
            // { img: '', text: "Not sure, let's discuss this on a call" },
            // { img: '', text: 'Not required, we already have stampers and can ship them to you' }
            { img: '', text: '1 step stamper' },
            { img: '', text: '2 step stamper' },
            { img: '', text: '3 step stamper' },
            { img: '', text: 'Maybe' },
            { img: '', text: 'No' }
        ]
    },
    packaging: {
        label: 'Packaging: What type of LP jacket did you want to print?',
        options: [
            // { img: '', text: 'Gatefold' },
            // { img: '', text: 'Single Pocket' },
            // { img: '', text: "No Packaging Required - we'll supply it to you ourselves" },
            // { img: '', text: 'Single Pocket with Wide Spine (2LP)' },
            // { img: '', text: "Not Sure. Let's set up a call." }
            { img: '', text: 'Single pocket' },
            { img: '', text: 'Gatefold' },
            { img: '', text: 'No' },
            { img: '', text: 'Single pocket w/ wide spine (2LP)' },
            { img: '', text: 'Maybe' }
        ]
    },
    source: {
        label: 'How did you hear about us?',
        options: [
            { img: '', text: 'Heard about good neighbor from a friend' },
            { img: '', text: 'was googling' },
            { img: '', text: 'not my first time with good neighbor' },
            { img: '', text: 'friend of good neighbor' }
        ]
    },
    test_prints: {
        label: '# of Test Pressings',
        options: [
            {
                img: '',
                text: '2'
            },
            {
                img: '',
                text: '5'
            },
            {
                img: '',
                text: '10'
            },
            {
                img: '',
                text: 'Not sure'
            }
        ]
    }
};

// This is used in the detail dict to for the survey
// CONFUSING BUT SELECT HERE IS DROPDOWN IN MONDAY AND DROPDOWN HERE IS STATUS IN MONDAY
/** @type {Record<string, Detail>} */
export const detailsDict = {
    contact_first_name: {
        label: 'First Name',
        description: "What's your name?",
        value: '',
        type: 'text',
        required: true
    },
    contact_last_name: {
        label: 'Last Name',
        description: "What's your name?",
        value: '',
        type: 'text',
        required: true
    },
    contact_email: {
        label: 'Email',
        description: 'Who should we email about this project?',
        value: '',
        type: 'email',
        required: true
    },
    phone: {
        label: 'Phone Number',
        description: 'Please add the best contact phone number',
        value: '',
        type: 'tel',
        required: true
    },
    catalog_number: {
        label: 'Catalog Number',
        description: "If Cat# hasn't been determined yet, please leave blank",
        value: '',
        type: 'text',
        required: false
    },
    artist: {
        label: 'Artist',
        description: '',
        value: '',
        type: 'text',
        required: true
    },
    title: {
        label: 'Title',
        description: 'How would you describe this project? We recommend Artist, Title and Label information',
        value: '',
        type: 'text',
        required: true
    },
    label: {
        label: 'Label',
        description: '',
        value: '',
        type: 'text',
        required: true
    },

    release_date: {
        label: 'Release Date',
        description: 'When is this LP/EP due for release? (Leave blank if not sure)',
        value: '',
        type: 'date',
        required: false
    },
    depot_date: {
        label: 'Depot Date',
        description: 'When do you need finished units to be at your desired final destination by (Leave blank if not sure)',
        value: '',
        type: 'date',
        required: false
    },
    shipping_address: {
        label: 'Where would you like the finished goods to be shipped?',
        description: 'Either add general city/region, or exact address. This helps us estimate shipping time. (Leave blank if not sure)',
        value: '',
        type: 'address',
        required: false
    },
    shipping_logistics: {
        label: 'Should GN handle the shipping logistics of the finished goods?',
        description: 'Or would you prefer to arrange your own pickup via your preferred transit company?',
        value: '',
        type: 'dropdown',
        required: false
    },
    total_units: {
        label: 'How many total units would you like to manufacture? Our minimum run is 500 units',
        description: 'If you want to manufacture multiple color variants, this number should encompass everything',
        value: '',
        type: 'number',
        required: true
    },
    records_per_set: {
        label: '# of records per set',
        description:
            "Is this a single LP or perhaps a double-LP product? We usually recommend each side of a record doesn't go beyond 22 minutes in duration",
        value: '',
        type: 'dropdown',
        required: true
    },
    record_format: {
        label: 'RPM / Record Format',
        description: 'Please note only make 12in 180g records at this time',
        value: '',
        type: 'dropdown',
        required: true
    },
    record_color: {
        label: 'What color(s) would you like your records to be?',
        description:
            'Our records can be manufactured as solid or translucent colors. If unsure, please leave blank. Color options here: https://www.goodneighbormusic.com',
        value: '',
        type: 'select',
        maxSelections: 3,
        required: true
    },
    opacity: {
        label: 'Your record has the option of being opaque or transparent',
        description: 'Records can be opaque or transparent',
        value: '',
        type: 'dropdown',
        required: false
    },
    lacquers: {
        label: 'Lacquers: Would you like us to handle this for you?',
        description: 'Do you already have someone cutting the master? If not, we work with some of the best cutters in the world and can help!',
        value: '',
        type: 'dropdown',
        tooltip: {
            name: 'lacquers',
            cta: 'What are lacquers?',
            description: 'Extra info coming soon!',
            link: 'https://lacquers.com'
        },
        required: false
    },
    metalwork: {
        label: 'Metalwork: What type of stampers do you need?',
        description: 'Making stampers is a standard step in the record making process. For optimal quality, we recommend that we make your stampers.',
        value: '',
        type: 'dropdown',
        required: false
    },
    test_prints: {
        label: '# of Test Pressings',
        description: '',
        value: '',
        type: 'select',
        required: false
    },
    packaging: {
        label: 'Packaging: What type of LP jacket did you want to print?',
        description: '',
        value: '',
        type: 'dropdown',
        required: false
    },
    source: {
        label: 'Source: How did you hear about us?',
        description: '',
        value: '',
        type: 'dropdown',
        required: false
    },
    notes: {
        label: 'Add your project details, comments and/or requests below.',
        description: 'Did you want any lyric sheets or inserts? Please add any packaging notes we should know about.',
        value: '',
        type: 'text',
        required: false
    }
};
