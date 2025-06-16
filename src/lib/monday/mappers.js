
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

    // Project Information
    title: {
        id: 'text_mkqm48k7',
        mondayId: 'text_mkqm48k7',
        key: 'title',
        title: 'Title',
        label: 'Title',
        description: 'How would you describe this project? We recommend Artist, Title and Label information',
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

    // Dates
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

    // Shipping
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
            { value: 'No', text: 'No', index: 0 },
            { value: 'Yes', text: 'Yes', index: 1 },
            { value: 'Maybe', text: 'Maybe', index: 2 }
        ]
    },

    // Production Details
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
            { value: '2LP', text: '2LP', index: 0 },
            { value: '1LP', text: '1LP', index: 1 },
            { value: '3LP', text: '3LP', index: 2 },
            { value: '4LP', text: '4LP', index: 3 },
            { value: 'Not sure', text: 'Not sure', index: 4 }
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
            { value: '45 12in/180g', text: '45 12in/180g', index: 0 },
            { value: '33 12in/180g', text: '33 12in/180g', index: 1 },
            { value: 'Not sure', text: 'Not sure', index: 2 }
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
            { value: 'Maybe', text: 'Maybe', index: 0 },
            { value: 'Yes', text: 'Yes', index: 1 },
            { value: 'No', text: 'No', index: 2 }
        ]
    },

    metalwork: {
        id: 'color_mkqezhm4',
        mondayId: 'color_mkqezhm4',
        key: 'metalwork',
        title: 'Metalwork',
        label: 'Metalwork: What type of stampers do you need?',
        description: 'Making stampers is a standard step in the record making process. For optimal quality, we recommend that we make your stampers.',
        type: 'dropdown',
        mondayType: 'status',
        required: false,
        defaultValue: '',
        options: [
            { value: '1 step stamper', text: '1 step stamper', index: 0 },
            { value: '2 step stamper', text: '2 step stamper', index: 1 },
            { value: '3 step stamper', text: '3 step stamper', index: 2 },
            { value: 'Maybe', text: 'Maybe', index: 3 },
            { value: 'No', text: 'No', index: 4 }
        ]
    },

    test_prints: {
        id: 'text_mkr38tqq',
        mondayId: 'text_mkr38tqq',
        key: 'test_prints',
        title: '# of Test Pressings',
        label: '# of Test Pressings',
        description: '',
        type: 'select',
        mondayType: 'dropdown',
        required: false,
        defaultValue: [],
        options: [
            { value: '2', text: '2', index: 0 },
            { value: '5', text: '5', index: 1 },
            { value: '10', text: '10', index: 2 },
            { value: 'Not sure', text: 'Not sure', index: 3 }
        ]
    },

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
            { value: 'No', text: 'No', index: 2 },
            { value: 'Single pocket w/ wide spine (2LP)', text: 'Single pocket w/ wide spine (2LP)', index: 3 },
            { value: 'Maybe', text: 'Maybe', index: 4 }
        ]
    },

    // Meta fields
    source: {
        id: 'color_mkqebxff',
        mondayId: 'color_mkqebxff',
        key: 'source',
        title: 'Source',
        label: 'Source: How did you hear about us?',
        description: '',
        type: 'dropdown',
        mondayType: 'status',
        required: false,
        defaultValue: '',
        options: [
            { value: 'Heard about good neighbor from a friend', text: 'Heard about good neighbor from a friend', index: 0 },
            { value: 'was googling', text: 'was googling', index: 1 },
            { value: 'not my first time with good neighbor', text: 'not my first time with good neighbor', index: 2 },
            { value: 'friend of good neighbor', text: 'friend of good neighbor', index: 3 }
        ],
        remap: {
            'Heard about good neighbor from a friend': 'Referral',
            'was googling': 'Google search',
            'not my first time with good neighbor': 'Repeat',
            'friend of good neighbor': 'Personal connection'
        }
    },

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
            { value: 'submitted', text: 'Submitted', index: 0 },
            { value: 'autosaved', text: 'Autosaved', index: 1 }
        ]
    },

    notes: {
        id: 'long_text_mkqeqcgs',
        mondayId: 'long_text_mkqeqcgs',
        key: 'notes',
        title: 'Project details',
        label: 'Add your project details, comments and/or requests below.',
        description: 'Did you want any lyric sheets or inserts? Please add any packaging notes we should know about.',
        type: 'text',
        mondayType: 'long_text',
        required: false,
        defaultValue: ''
    },

    // Special name field for Monday
    name: {
        id: 'name',
        mondayId: 'name',
        key: 'name',
        title: 'Name',
        label: 'Name',
        description: '',
        type: 'name',
        mondayType: 'name',
        required: false,
        defaultValue: ''
    }
};

// Derived mappings - these are now generated from the single source above
export const keyToId = Object.keys(formFields).reduce((acc, key) => {
    acc[key] = formFields[key].mondayId;
    return acc;
}, {});

export const idToTitleAndType = Object.keys(formFields).reduce((acc, key) => {
    const field = formFields[key];
    acc[field.mondayId] = {
        title: field.title,
        type: field.mondayType
    };
    return acc;
}, {});

// Helper functions to work with the consolidated structure
export const getFieldByKey = (key) => formFields[key];
export const getFieldById = (id) => Object.values(formFields).find((field) => field.mondayId === id);
export const getFieldOptions = (key) => formFields[key]?.options || [];
export const getRequiredFields = () => Object.values(formFields).filter((field) => field.required);

export const intakeFormGroupTitleToId = {
    'Intake Form': 'topics'
};

// // Semantic mappers -- just for this file -- maybe not necessary?
// const intakeFormTitleToId = {
//     // NAME DEPRECATED TO USE PROJECT NAME BECAUSE CONTACT NAME IS THE DEFAULT ID/NAME FOR MONDAY INTAKE FORM
//     Name: 'name',
//     'Email address': 'email_mkrw9e0e',
//     'Phone number': 'phone_mkqfjtqw',
//     Status: 'color_mkqex5zn',
//     Source: 'color_mkqebxff',
//     'Create date': 'date_mkqegnht',
//     'Contact first name': 'text_mkqe97hx',
//     'Contact last name': 'text_mkrnjvq9',
//     Title: 'text_mkqm48k7',
//     Label: 'text_mkqeg2p5',
//     Artist: 'text_mkqek005',
//     'Catalog number': 'text_mkqev8rm',
//     'Release date': 'date_mkqeje2k',
//     'Depot date': 'date_mkqewgvs',
//     'Shipping location': 'text_mkqeanrf',
//     'Handling shipping': 'color_mkqe347x',
//     'Total Units': 'text_mkqevd4n',
//     '# of Records': 'color_mkqe5zht',
//     'RPM/Record Format': 'color_mkqed74p',
//     Colors: 'dropdown_mkqedrj6',
//     Opacity: 'color_mkr58s9v',
//     'Lacquers handling': 'color_mkqenc0a',
//     Metalwork: 'color_mkqezhm4',
//     '# of Test Pressings': 'text_mkr38tqq',
//     Packaging: 'color_mkqej81e',
//     'Project details': 'long_text_mkqeqcgs',
//     submitted: 'color_mkryy8hj'
// };

// // This is important for remapping values
// export const intakeFormIdToTitleAndType = {
//     name: {
//         title: 'Name',
//         type: 'name'
//     },
//     text_mkqm48k7: {
//         title: 'Title',
//         type: 'text'
//     },
//     email_mkrw9e0e: {
//         title: 'Email address',
//         type: 'email'
//     },
//     phone_mkqfjtqw: {
//         title: 'Phone number',
//         type: 'phone'
//     },
//     color_mkqex5zn: {
//         title: 'Status',
//         type: 'status'
//     },
//     color_mkqebxff: {
//         title: 'Source',
//         type: 'status'
//     },
//     date_mkqegnht: {
//         title: 'Create date',
//         type: 'date'
//     },
//     text_mkqe97hx: {
//         title: 'Contact first name',
//         type: 'text'
//     },
//     text_mkrnjvq9: {
//         title: 'Contact last name',
//         type: 'text'
//     },
//     text_mkqeg2p5: {
//         title: 'Label',
//         type: 'text'
//     },
//     text_mkqek005: {
//         title: 'Artist',
//         type: 'text'
//     },
//     text_mkqev8rm: {
//         title: 'Catalog number',
//         type: 'text'
//     },
//     date_mkqeje2k: {
//         title: 'Release date',
//         type: 'date'
//     },
//     date_mkqewgvs: {
//         title: 'Depot date',
//         type: 'date'
//     },
//     text_mkqeanrf: {
//         title: 'Shipping location',
//         type: 'text'
//     },
//     color_mkqe347x: {
//         title: 'Handling shipping',
//         type: 'status'
//     },
//     text_mkqevd4n: {
//         title: 'Total Units',
//         type: 'text'
//     },
//     color_mkqe5zht: {
//         title: '# of Records',
//         type: 'status'
//     },
//     color_mkqed74p: {
//         title: 'RPM/Record Format',
//         type: 'status'
//     },
//     dropdown_mkqedrj6: {
//         title: 'Colors',
//         type: 'dropdown'
//     },
//     color_mkr58s9v: {
//         title: 'Opacity',
//         type: 'status'
//     },
//     color_mkqenc0a: {
//         title: 'Lacquers handling',
//         type: 'status'
//     },
//     color_mkqezhm4: {
//         title: 'Metalwork',
//         type: 'status'
//     },
//     text_mkr38tqq: {
//         title: '# of Test Pressings',
//         type: 'dropdown'
//     },
//     color_mkqej81e: {
//         title: 'Packaging',
//         type: 'status'
//     },
//     long_text_mkqeqcgs: {
//         title: 'Project details',
//         type: 'long_text'
//     },
//     color_mkryy8hj: {
//         title: 'submitted',
//         type: 'status'
//     }
// };

// // Items not in the form, but in Monday -- could just put everything here?
// export const intakeFormFields = {
//     status: {
//         id: 'color_mkqex5zn',
//         title: 'Status',
//         options: {
//             connected: 0,
//             new: 1
//             // opportunity: 2,
//             // customer: 3,
//             // repeat: 4,
//             // unqualified: 5,
//             // contact: 6,
//             // qualified: 7,
//             // submitted: 8
//         }
//     },
//     source: {
//         id: 'color_mkqebxff',
//         title: 'Source',
//         options: {
//             referral: 0,
//             google_search: 1,
//             repeat: 2,
//             personal_connection: 3
//         },
//         remap: {
//             'Heard about good neighbor from a friend': 'Referral',
//             'was googling': 'Google search',
//             'not my first time with good neighbor': 'Repeat',
//             'friend of good neighbor': 'Personal connection'
//         }
//     },
//     create_date: {
//         id: 'date_mkqegnht',
//         title: 'Create date'
//     },
//     updated_at: {
//         id: "date_mkrym40t",
//         title: 'Updated at'
//     },
//     submitted: {
//         id: "color_mkryy8hj",
//         title: 'Submitted',
//         options: {
//             submitted: 0,
//             autosaved: 1
//         }
//     }
// };

// // This is important for remapping values
// /** @type {Record<string, string>} */
// export const keyToId = {
//     title: intakeFormTitleToId['Title'],
//     contact_first_name: intakeFormTitleToId['Contact first name'],
//     contact_last_name: intakeFormTitleToId['Contact last name'],
//     contact_email: intakeFormTitleToId['Email address'],
//     phone: intakeFormTitleToId['Phone number'],
//     label: intakeFormTitleToId['Label'],
//     artist: intakeFormTitleToId['Artist'],
//     catalog_number: intakeFormTitleToId['Catalog number'],
//     release_date: intakeFormTitleToId['Release date'],
//     depot_date: intakeFormTitleToId['Depot date'],
//     shipping_address: intakeFormTitleToId['Shipping location'],
//     shipping_logistics: intakeFormTitleToId['Handling shipping'],
//     total_units: intakeFormTitleToId['Total Units'],
//     records_per_set: intakeFormTitleToId['# of Records'],
//     record_format: intakeFormTitleToId['RPM/Record Format'],
//     record_color: intakeFormTitleToId['Colors'],
//     opacity: intakeFormTitleToId['Opacity'],
//     lacquers: intakeFormTitleToId['Lacquers handling'],
//     metalwork: intakeFormTitleToId['Metalwork'],
//     test_prints: intakeFormTitleToId['# of Test Pressings'],
//     packaging: intakeFormTitleToId['Packaging'],
//     notes: intakeFormTitleToId['Project details'],
//     source: intakeFormTitleToId.Source,
//     status: intakeFormTitleToId.Status,
//     submitted: intakeFormFields.submitted.id
// };
