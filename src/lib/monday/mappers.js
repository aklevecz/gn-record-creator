
export const intakeFormGroupTitleToId = {
    'Intake Form': 'topics'
};

// Semantic mappers -- just for this file -- maybe not necessary?
const intakeFormTitleToId = {
    // NAME DEPRECATED TO USE PROJECT NAME BECAUSE CONTACT NAME IS THE DEFAULT ID/NAME FOR MONDAY INTAKE FORM
    Name: 'name',
    'Email address': 'email_mkrw9e0e',
    'Phone number': 'phone_mkqfjtqw',
    Status: 'color_mkqex5zn',
    Source: 'color_mkqebxff',
    'Create date': 'date_mkqegnht',
    'Contact first name': 'text_mkqe97hx',
    'Contact last name': 'text_mkrnjvq9',
    Title: 'text_mkqm48k7',
    Label: 'text_mkqeg2p5',
    Artist: 'text_mkqek005',
    'Catalog number': 'text_mkqev8rm',
    'Release date': 'date_mkqeje2k',
    'Depot date': 'date_mkqewgvs',
    'Shipping location': 'text_mkqeanrf',
    'Handling shipping': 'color_mkqe347x',
    'Total Units': 'text_mkqevd4n',
    '# of Records': 'color_mkqe5zht',
    'RPM/Record Format': 'color_mkqed74p',
    Colors: 'dropdown_mkqedrj6',
    Opacity: 'color_mkr58s9v',
    'Lacquers handling': 'color_mkqenc0a',
    Metalwork: 'color_mkqezhm4',
    '# of Test Pressings': 'text_mkr38tqq',
    Packaging: 'color_mkqej81e',
    'Project details': 'long_text_mkqeqcgs',
    submitted: 'color_mkqezh4h'
};


// This is important for remapping values
export const intakeFormIdToTitleAndType = {
    name: {
        title: 'Name',
        type: 'name'
    },
    text_mkqm48k7: {
        title: 'Title',
        type: 'text'
    },
    email_mkrw9e0e: {
        title: 'Email address',
        type: 'email'
    },
    phone_mkqfjtqw: {
        title: 'Phone number',
        type: 'phone'
    },
    color_mkqex5zn: {
        title: 'Status',
        type: 'status'
    },
    color_mkqebxff: {
        title: 'Source',
        type: 'status'
    },
    date_mkqegnht: {
        title: 'Create date',
        type: 'date'
    },
    text_mkqe97hx: {
        title: 'Contact first name',
        type: 'text'
    },
    text_mkrnjvq9: {
        title: 'Contact last name',
        type: 'text'
    },
    text_mkqeg2p5: {
        title: 'Label',
        type: 'text'
    },
    text_mkqek005: {
        title: 'Artist',
        type: 'text'
    },
    text_mkqev8rm: {
        title: 'Catalog number',
        type: 'text'
    },
    date_mkqeje2k: {
        title: 'Release date',
        type: 'date'
    },
    date_mkqewgvs: {
        title: 'Depot date',
        type: 'date'
    },
    text_mkqeanrf: {
        title: 'Shipping location',
        type: 'text'
    },
    color_mkqe347x: {
        title: 'Handling shipping',
        type: 'status'
    },
    text_mkqevd4n: {
        title: 'Total Units',
        type: 'text'
    },
    color_mkqe5zht: {
        title: '# of Records',
        type: 'status'
    },
    color_mkqed74p: {
        title: 'RPM/Record Format',
        type: 'status'
    },
    dropdown_mkqedrj6: {
        title: 'Colors',
        type: 'dropdown'
    },
    color_mkr58s9v: {
        title: 'Opacity',
        type: 'status'
    },
    color_mkqenc0a: {
        title: 'Lacquers handling',
        type: 'status'
    },
    color_mkqezhm4: {
        title: 'Metalwork',
        type: 'status'
    },
    text_mkr38tqq: {
        title: '# of Test Pressings',
        type: 'dropdown'
    },
    color_mkqej81e: {
        title: 'Packaging',
        type: 'status'
    },
    long_text_mkqeqcgs: {
        title: 'Project details',
        type: 'long_text'
    },
    color_mkryy8hj: {
        title: 'submitted',
        type: 'status'
    }
};

// Items not in the form, but in Monday -- could just put everything here?
export const intakeFormFields = {
    status: {
        id: 'color_mkqex5zn',
        title: 'Status',
        options: {
            connected: 0,
            new: 1
            // opportunity: 2,
            // customer: 3,
            // repeat: 4,
            // unqualified: 5,
            // contact: 6,
            // qualified: 7,
            // submitted: 8
        }
    },
    source: {
        id: 'color_mkqebxff',
        title: 'Source',
        options: {
            referral: 0,
            google_search: 1,
            repeat: 2,
            personal_connection: 3
        },
        remap: {
            'Heard about good neighbor from a friend': 'Referral',
            'was googling': 'Google search',
            'not my first time with good neighbor': 'Repeat',
            'friend of good neighbor': 'Personal connection'
        }
    },
    create_date: {
        id: 'date_mkqegnht',
        title: 'Create date'
    },
    updated_at: {
        id: "date_mkrym40t",
        title: 'Updated at'
    },
    submitted: {
        id: "color_mkryy8hj",
        title: 'Submitted',
        options: {
            submitted: 0,
            autosaved: 1
        }
    }
};

// This is important for remapping values
/** @type {Record<string, string>} */
export const keyToId = {
    title: intakeFormTitleToId['Title'],
    contact_first_name: intakeFormTitleToId['Contact first name'],
    contact_last_name: intakeFormTitleToId['Contact last name'],
    contact_email: intakeFormTitleToId['Email address'],
    phone: intakeFormTitleToId['Phone number'],
    label: intakeFormTitleToId['Label'],
    artist: intakeFormTitleToId['Artist'],
    catalog_number: intakeFormTitleToId['Catalog number'],
    release_date: intakeFormTitleToId['Release date'],
    depot_date: intakeFormTitleToId['Depot date'],
    shipping_address: intakeFormTitleToId['Shipping location'],
    shipping_logistics: intakeFormTitleToId['Handling shipping'],
    total_units: intakeFormTitleToId['Total Units'],
    records_per_set: intakeFormTitleToId['# of Records'],
    record_format: intakeFormTitleToId['RPM/Record Format'],
    record_color: intakeFormTitleToId['Colors'],
    opacity: intakeFormTitleToId['Opacity'],
    lacquers: intakeFormTitleToId['Lacquers handling'],
    metalwork: intakeFormTitleToId['Metalwork'],
    test_prints: intakeFormTitleToId['# of Test Pressings'],
    packaging: intakeFormTitleToId['Packaging'],
    notes: intakeFormTitleToId['Project details'],
    source: intakeFormTitleToId.Source,
    status: intakeFormTitleToId.Status,
    submitted: intakeFormFields.submitted.id
};
