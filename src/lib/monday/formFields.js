// Record colors - keeping this separate as it's a clean, focused object
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

// Consolidated field definitions - single source of truth
/** @type {Record<string, FormField>} */
export const formFields = {
    // Contact Information
    contact_first_name: {
        id: 'text_mkqe97hx',
        mondayId: 'text_mkqe97hx',
        key: 'contact_first_name',
        title: 'Contact first name',
        label: 'First Name',
        description: "What's your name?",
        type: 'text',
        mondayType: 'text',
        required: true,
        defaultValue: ''
    },

    contact_last_name: {
        id: 'text_mkrnjvq9',
        mondayId: 'text_mkrnjvq9',
        key: 'contact_last_name',
        title: 'Contact last name',
        label: 'Last Name',
        description: "What's your name?",
        type: 'text',
        mondayType: 'text',
        required: true,
        defaultValue: ''
    },

    contact_email: {
        id: 'email_mkrw9e0e',
        mondayId: 'email_mkrw9e0e',
        key: 'contact_email',
        title: 'Email address',
        label: 'Email',
        description: 'Who should we email about this project?',
        type: 'email',
        mondayType: 'email',
        required: true,
        defaultValue: ''
    },

    phone: {
        id: 'phone_mkqfjtqw',
        mondayId: 'phone_mkqfjtqw',
        key: 'phone',
        title: 'Phone number',
        label: 'Phone Number',
        description: 'Please add the best contact phone number',
        type: 'tel',
        mondayType: 'phone',
        required: true,
        defaultValue: ''
    },

    title: {
        id: 'text_mkqm48k7',
        mondayId: 'text_mkqm48k7',
        key: 'title',
        title: 'Title',
        label: 'Title',
        description: '',
        type: 'text',
        mondayType: 'text',
        required: true,
        defaultValue: ''
    },

    artist: {
        id: 'text_mkqek005',
        mondayId: 'text_mkqek005',
        key: 'artist',
        title: 'Artist',
        label: 'Artist',
        description: '',
        type: 'text',
        mondayType: 'text',
        required: true,
        defaultValue: ''
    },

    label: {
        id: 'text_mkqeg2p5',
        mondayId: 'text_mkqeg2p5',
        key: 'label',
        title: 'Label',
        label: 'Label',
        description: '',
        type: 'text',
        mondayType: 'text',
        required: true,
        defaultValue: ''
    },

    catalog_number: {
        id: 'text_mkqev8rm',
        mondayId: 'text_mkqev8rm',
        key: 'catalog_number',
        title: 'Catalog number',
        label: 'Catalog Number',
        description: "If Cat# hasn't been determined yet, please leave blank",
        type: 'text',
        mondayType: 'text',
        required: false,
        defaultValue: ''
    },

    release_date: {
        id: 'date_mkqeje2k',
        mondayId: 'date_mkqeje2k',
        key: 'release_date',
        title: 'Release date',
        label: 'Release Date',
        description: 'When is this LP/EP due for release? (Leave blank if not sure)',
        type: 'date',
        mondayType: 'date',
        required: false,
        defaultValue: ''
    },

    depot_date: {
        id: 'date_mkqewgvs',
        mondayId: 'date_mkqewgvs',
        key: 'depot_date',
        title: 'Depot date',
        label: 'Depot Date',
        description: 'When do you need finished units to be at your desired final destination by (Leave blank if not sure)',
        type: 'date',
        mondayType: 'date',
        required: false,
        defaultValue: ''
    },

    shipping_address: {
        id: 'text_mkqeanrf',
        mondayId: 'text_mkqeanrf',
        key: 'shipping_address',
        title: 'Shipping location',
        label: 'Where would you like the finished goods to be shipped?',
        description: 'Either add general city/region, or exact address. This helps us estimate shipping time. (Leave blank if not sure)',
        type: 'address',
        mondayType: 'text',
        required: false,
        defaultValue: ''
    },

    shipping_logistics: {
        id: 'color_mkqe347x',
        mondayId: 'color_mkqe347x',
        key: 'shipping_logistics',
        title: 'Handling shipping',
        label: 'Should GN handle the shipping logistics of the finished goods?',
        description: 'Or would you prefer to arrange your own pickup via your preferred transit company?',
        type: 'dropdown',
        mondayType: 'status',
        required: false,
        defaultValue: '',
        options: [
            { value: 'Yes', text: 'Yes, please handle the logistics for me', index: 1 },
            { value: 'No', text: 'No, thank you - I will arrange the pickup', index: 0 },
            { value: 'Maybe', text: "Not sure, let's chat", index: 2 }
        ]
    },

    total_units: {
        id: 'text_mkqevd4n',
        mondayId: 'text_mkqevd4n',
        key: 'total_units',
        title: 'Total Units',
        label: 'How many total units would you like to manufacture? Our minimum run is 500 units',
        description: 'If you want to manufacture multiple color variants, this number should encompass everything',
        type: 'number',
        mondayType: 'text',
        required: true,
        defaultValue: ''
    },

    records_per_set: {
        id: 'color_mkqe5zht',
        mondayId: 'color_mkqe5zht',
        key: 'records_per_set',
        title: '# of Records',
        label: '# of records per set',
        description:
            "Is this a single LP or perhaps a double-LP product? We usually recommend each side of a record doesn't go beyond 22 minutes in duration",
        type: 'dropdown',
        mondayType: 'status',
        required: true,
        defaultValue: '',
        options: [
            { value: '1LP', text: '1LP', index: 1 },
            { value: '2LP', text: '2LP', index: 0 },
            { value: '3LP', text: '3LP', index: 2 },
            // { value: '4LP', text: '4LP', index: 3 },
            { value: 'Not sure', text: "Not sure, let's setup a call", index: 4 }
        ]
    },

    record_format: {
        id: 'color_mkqed74p',
        mondayId: 'color_mkqed74p',
        key: 'record_format',
        title: 'RPM/Record Format',
        label: 'RPM / Record Format',
        description: 'Please note only make 12in 180g records at this time',
        type: 'dropdown',
        mondayType: 'status',
        required: true,
        defaultValue: '',
        options: [
            { value: '33 12in/180g', text: '33 12in/180g', index: 1 },
            { value: '45 12in/180g', text: '45 12in/180g', index: 0 },
            { value: 'Not sure', text: "Not sure, let's setup a call", index: 2 }
        ]
    },

    record_color: {
        id: 'dropdown_mkqedrj6',
        mondayId: 'dropdown_mkqedrj6',
        key: 'record_color',
        title: 'Colors',
        label: 'What color(s) would you like your records to be?',
        description:
            'Our records can be manufactured as solid or translucent colors. If unsure, please leave blank. Color options here: https://www.goodneighbormusic.com',
        type: 'select',
        mondayType: 'dropdown',
        required: true,
        defaultValue: [],
        maxSelections: 3,
        options: [
            { value: recordColors.purpleHaze, text: recordColors.purpleHaze, color: '#913574', img: 'records/purple-haze.png' },
            { value: recordColors.cosmicBlack, text: recordColors.cosmicBlack, color: '#030303', img: 'records/cosmic-black.png' },
            { value: recordColors.oceanFloor, text: recordColors.oceanFloor, color: '#003479', img: 'records/ocean-floor.png' },
            { value: recordColors.skyBlue, text: recordColors.skyBlue, color: '#0072b0', img: 'records/sky-blue.png' },
            { value: recordColors.salsaVerde, text: recordColors.salsaVerde, color: '#398930', img: 'records/salsa-verde.png' },
            { value: recordColors.limoncello, text: recordColors.limoncello, color: '#ded028', img: 'records/limoncello.png' },
            { value: recordColors.habanero, text: recordColors.habanero, color: '#ff5214', img: 'records/habanero.png' },
            { value: recordColors.redAlert, text: recordColors.redAlert, color: '#dd2a1e', img: 'records/red-alert.png' },
            { value: recordColors.hibiscus, text: recordColors.hibiscus, color: '#d30273', img: 'records/hibiscus.png' },
            { value: recordColors.lightning, text: recordColors.lightning, color: '#e2e2e2', img: 'records/lightning.png' },
            { value: recordColors.glassyIce, text: recordColors.glassyIce, color: '#7e7e7e', img: 'records/glassy-ice.png' }
        ]
    },

    opacity: {
        id: 'color_mkr58s9v',
        mondayId: 'color_mkr58s9v',
        key: 'opacity',
        title: 'Opacity',
        label: 'Your record has the option of being opaque or transparent',
        description: 'Records can be opaque or transparent',
        type: 'dropdown',
        mondayType: 'status',
        required: false,
        defaultValue: '',
        options: [
            { value: 'Opaque', text: 'Opaque', index: 0 },
            { value: 'Transparent', text: 'Transparent', index: 1 }
        ]
    },

    lacquers: {
        id: 'color_mkqenc0a',
        mondayId: 'color_mkqenc0a',
        key: 'lacquers',
        title: 'Lacquers handling',
        label: 'Lacquers: Would you like us to handle this for you?',
        description: 'Do you already have someone cutting the master? If not, we work with some of the best cutters in the world and can help!',
        type: 'dropdown',
        mondayType: 'status',
        required: false,
        defaultValue: '',
        tooltip: {
            name: 'lacquers',
            cta: 'What are lacquers?',
            description: 'Extra info coming soon!',
            link: 'https://lacquers.com'
        },
        options: [
            { value: 'Yes', text: 'Yes, Good Neighbor cuts the master lacquers', index: 1 },
            { value: 'No', text: 'No, we have our own lacquer cutting arranged', index: 2 },
            { value: 'Not sure', text: 'Unsure, please advise on lacquer options', index: 3 }
        ]
    },

    // metalwork: {
    //     id: 'color_mkqezhm4',
    //     mondayId: 'color_mkqezhm4',
    //     key: 'metalwork',
    //     title: 'Metalwork',
    //     label: 'Metalwork: What type of stampers do you need?',
    //     description: 'Making stampers is a standard step in the record making process. For optimal quality, we recommend that we make your stampers.',
    //     type: 'dropdown',
    //     mondayType: 'status',
    //     required: false,
    //     defaultValue: '',
    //     options: [
    //         { value: '1 step stamper', text: '1 step stamper', index: 0 },
    //         { value: '2 step stamper', text: '2 step stamper', index: 1 },
    //         { value: '3 step stamper', text: '3 step stamper', index: 2 },
    //         { value: 'Maybe', text: 'Maybe', index: 3 },
    //         { value: 'No', text: 'No', index: 4 }
    //     ]
    // },

    // test_prints: {
    //     id: 'text_mkr38tqq',
    //     mondayId: 'text_mkr38tqq',
    //     key: 'test_prints',
    //     title: '# of Test Pressings',
    //     label: '# of Test Pressings',
    //     description: '',
    //     type: 'select',
    //     mondayType: 'dropdown',
    //     required: false,
    //     defaultValue: [],
    //     options: [
    //         { value: '2', text: '2', index: 0 },
    //         { value: '5', text: '5', index: 1 },
    //         { value: '10', text: '10', index: 2 },
    //         { value: 'Not sure', text: 'Not sure', index: 3 }
    //     ]
    // },

    packaging: {
        id: 'color_mkqej81e',
        mondayId: 'color_mkqej81e',
        key: 'packaging',
        title: 'Packaging',
        label: 'Packaging: What type of LP jacket did you want to print?',
        description: '',
        type: 'dropdown',
        mondayType: 'status',
        required: false,
        defaultValue: '',
        options: [
            { value: 'Single pocket', text: 'Single pocket', index: 0 },
            { value: 'Gatefold', text: 'Gatefold', index: 1 },
            { value: 'Single pocket w/ wide spine (2LP)', text: 'Single pocket w/ wide spine (2LP)', index: 3 },
            { value: 'No', text: "No Packaging Required - we'll supply it to you ourselves", index: 2 },
            { value: 'Not sure', text: "No sure. Let's set up a call", index: 4 }
        ]
    },

    packaging_sleeve: {
        id: 'color_mks373jg',
        mondayId: 'color_mks373jg',
        key: 'packaging_sleeve',
        title: 'Packaging Sleeve',
        label: 'Packaging: What type of inner-sleeve would you like?',
        description: 'Please note, we recommend poly-lined to protext the records from abrasion over the course of its lifecycle',
        type: 'dropdown',
        mondayType: 'status',
        required: false,
        defaultValue: '',
        options: [
            { value: 'Plain white, Poly-Lined', text: 'Plain white, Poly-Lined', index: 0 },
            { value: 'Plain black, Poly-Lined', text: 'Plain black, Poly-Lined', index: 1 },
            { value: 'Printed (1-Color)(not poly-lined)', text: 'Printed (1-Color)(not poly-lined)', index: 2 },
            { value: 'Printed (4-Color)(not poly-lined)', text: 'Printed (4-Color)(not poly-lined)', index: 3 },
            { value: 'Not sure', text: "Not sure. Let's set up a call", index: 4 }
        ]
    },

    notes: {
        id: 'long_text_mkqeqcgs',
        mondayId: 'long_text_mkqeqcgs',
        key: 'notes',
        title: 'Project details',
        label: 'Add your project details, comments and/or requests below.',
        description: 'Did you want any lyric sheets, inserts, or shrink wraps? Please add any packaging notes we should know about.',
        type: 'text',
        mondayType: 'long_text',
        required: false,
        defaultValue: ''
    },

    source: {
        id: 'color_mkqebxff',
        mondayId: 'color_mkqebxff',
        key: 'source',
        title: 'Source',
        label: 'How did you hear about us?',
        description: '',
        type: 'dropdown',
        mondayType: 'status',
        required: false,
        defaultValue: '',
        options: [
            { value: 'Referral', text: 'Referral', index: 0 },
            { value: 'Google search', text: 'Google search', index: 1 },
            { value: 'Repeat', text: 'Repeat', index: 2 },
            { value: 'Personal connection', text: 'Personal connection', index: 3 },
            { value: 'Social Media', text: 'Social Media', index: 4 },
            { value: 'Event', text: 'Event', index: 5 },
            { value: 'Blog/article', text: 'Blog or article', index: 6 },
            { value: 'Other', text: 'Other', index: 7 }
        ]
    },

    // DB/MONDAY ONLY FIELDS
    status: {
        id: 'color_mkqex5zn',
        mondayId: 'color_mkqex5zn',
        key: 'status',
        title: 'Status',
        label: 'Status',
        description: '',
        type: 'status',
        mondayType: 'status',
        required: false,
        defaultValue: '',
        options: [
            { value: 'connected', text: 'Connected', index: 0 },
            { value: 'new', text: 'New', index: 1 }
        ]
    },

    submitted: {
        id: 'color_mkryy8hj',
        mondayId: 'color_mkryy8hj',
        key: 'submitted',
        title: 'submitted',
        label: 'Submitted',
        description: '',
        type: 'status',
        mondayType: 'status',
        required: false,
        defaultValue: '',
        options: [
            { value: 'Submitted', text: 'Submitted', index: 0 },
            { value: 'Autosaved', text: 'Autosaved', index: 1 }
        ]
    },

    create_date: {
        id: 'date_mkqegnht',
        mondayId: 'date_mkqegnht',
        key: 'create_date',
        title: 'Create date',
        label: 'Create Date',
        description: '',
        type: 'date',
        mondayType: 'date',
        required: false,
        defaultValue: ''
    },

    updated_at: {
        id: 'date_mkrym40t',
        mondayId: 'date_mkrym40t',
        key: 'updated_at',
        title: 'Update date',
        label: 'Update Date',
        description: '',
        type: 'date',
        mondayType: 'date',
        required: false,
        defaultValue: ''
    },

    form_id: {
        id: 'text_mks7f1bc',
        mondayId: 'text_mks7f1bc',
        key: 'form_id',
        title: 'Form ID',
        label: 'Form ID',
        description: '',
        type: 'text',
        mondayType: 'text',
        required: false,
        defaultValue: ''
    }

    // Special name field for Monday
    // name: {
    //     id: 'name',
    //     mondayId: 'name',
    //     key: 'name',
    //     title: 'Name',
    //     label: 'Name',
    //     description: '',
    //     type: 'name',
    //     mondayType: 'name',
    //     required: false,
    //     defaultValue: ''
    // }
};

const hiddenFields = [formFields.status.key, formFields.submitted.key, formFields.create_date.key, formFields.updated_at.key, formFields.form_id.key];

export { hiddenFields };

// Derived mappings - these are now generated from the single source above
/** @type {Record<string, string>} */
export const keyToId = Object.keys(formFields).reduce((/** @type {Record<string, string>} */ acc, key) => {
    acc[key] = formFields[key].mondayId;
    return acc;
}, {});

/** @type {Record<string, {title: string, type: string}>} */
export const idToTitleAndType = Object.keys(formFields).reduce((/** @type {Record<string, {title: string, type: string}>} */ acc, key) => {
    const field = formFields[key];
    acc[field.mondayId] = {
        title: field.title,
        type: field.mondayType
    };
    return acc;
}, {});

// Helper functions to work with the consolidated structure
/**
 * Get a form field by its key
 * @param {string} key - The key of the form field
 * @returns {FormField | undefined}
 */
export const getFieldByKey = (key) => formFields[key];

/**
 * Get a form field by its Monday.com ID
 * @param {string} id - The Monday.com ID of the form field
 * @returns {FormField | undefined}
 */
export const getFieldById = (id) => Object.values(formFields).find((field) => field.mondayId === id);

/**
 * Get options for a form field by its key
 * @param {string} key - The key of the form field
 * @returns {FormFieldOption[]}
 */
export const getFieldOptions = (key) => formFields[key]?.options || [];

/**
 * Get all required form fields
 * @returns {FormField[]}
 */
export const getRequiredFields = () => Object.values(formFields).filter((field) => field.required);

/** @type {Record<string, string>} */
export const intakeFormGroupTitleToId = {
    'Intake Form': 'topics'
};
