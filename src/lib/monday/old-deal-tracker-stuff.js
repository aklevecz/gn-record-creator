export const dealTrackerGroupIdToTitle = {
    topics: 'Discovery',
    closed: 'Quote Sent',
    new_group49013__1: 'Quote approved - Billing Codes, Costs and quantities to be added/finalized',
    new_group48974__1: 'Invoice finalized & ready for QB',
    new_group75371: 'WON, Deposit Received >> IN PRODUCTION',
    new_group54140__1: 'Promos / R&D',
    new_group84535__1: 'COMPLETED',
    new_group80748__1: 'LOST, Deal Fell Through',
    group_mknmfwkf: 'Bad timing',
    group_mknstj2d: 'Tests'
};

export const dealTrackerGroupTitleToId = {
    Discovery: 'topics',
    'Quote Sent': 'closed',
    'Quote approved - Billing Codes, Costs and quantities to be added/finalized': 'new_group49013__1',
    'Invoice finalized & ready for QB': 'new_group48974__1',
    'WON, Deposit Received >> IN PRODUCTION': 'new_group75371',
    'Promos / R&D': 'new_group54140__1',
    COMPLETED: 'new_group84535__1',
    'LOST, Deal Fell Through': 'new_group80748__1',
    'Bad timing': 'group_mknmfwkf',
    Tests: 'group_mknstj2d'
};

const dealTrackerColumnTitleToObject = {
    '# of Test Pressings required?': {
        id: 'numbers50',
        type: 'numbers'
    },
    'Artist:': {
        id: 'artist',
        type: 'text'
    },
    'CAT/PROJ #': {
        id: 'short_text_1__1',
        type: 'text'
    },
    'Calc Roll Up Invoice': {
        id: 'subitems_formula',
        type: 'mirror'
    },
    'Close Date': {
        id: 'deal_close_date',
        type: 'date'
    },
    'Collation & Packing Notes': {
        id: 'long_text',
        type: 'long_text'
    },
    'Completed Date': {
        id: 'date_mkm2y4ea',
        type: 'date'
    },
    'Contact Email': {
        id: 'email__1',
        type: 'email'
    },
    'Contact Name:': {
        id: 'short_text8__1',
        type: 'text'
    },
    'Customer Contact': {
        id: 'deal_contact',
        type: 'board_relation'
    },
    'Deal Value (GN)': {
        id: 'formula5__1',
        type: 'formula'
    },
    'Deal creation date': {
        id: 'deal_creation_date',
        type: 'date'
    },
    'Deal length': {
        id: 'deal_length',
        type: 'formula'
    },
    'Depot Date': {
        id: 'date5',
        type: 'date'
    },
    'Expected Close Date': {
        id: 'color_mkny6etg',
        type: 'status'
    },
    'Final Quantity': {
        id: 'dup__of_total_discs__1',
        type: 'numbers'
    },
    'GN Income/Unit ($)': {
        id: 'formula_mkpbxm0k',
        type: 'formula'
    },
    'GN Invoice #': {
        id: 'text8__1',
        type: 'text'
    },
    'GN Margin': {
        id: 'formula9__1',
        type: 'formula'
    },
    'Invoice Value': {
        id: 'formula__1',
        type: 'formula'
    },
    InvoicePriority: {
        id: 'dup__of_quotecat__1',
        type: 'status'
    },
    'Label:': {
        id: 'text9',
        type: 'text'
    },
    'Lacquers?': {
        id: 'status8',
        type: 'status'
    },
    'Last Check In': {
        id: 'date__1',
        type: 'date'
    },
    'Last Follow Up': {
        id: 'date_mknhhrwc',
        type: 'date'
    },
    Leads: {
        id: 'board_relation_mkp7y0rc',
        type: 'board_relation'
    },
    Notes: {
        id: 'text_mknh1fek',
        type: 'text'
    },
    Owner: {
        id: 'deal_owner',
        type: 'people'
    },
    Packaging: {
        id: 'status44',
        type: 'status'
    },
    'Payment Terms': {
        id: 'status71__1',
        type: 'status'
    },
    Phone: {
        id: 'phone__1',
        type: 'phone'
    },
    'QC Issues': {
        id: 'status1__1',
        type: 'status'
    },
    'Quote #': {
        id: 'text__1',
        type: 'text'
    },
    'Quote Sent Date': {
        id: 'date3__1',
        type: 'date'
    },
    QuoteCAT: {
        id: 'status6__1',
        type: 'status'
    },
    'Record: #/Set': {
        id: '__of_records_set',
        type: 'status'
    },
    'Record: Format / RPM': {
        id: 'single_select_3',
        type: 'status'
    },
    'Release Date': {
        id: 'date',
        type: 'date'
    },
    'Req Date INVOICE': {
        id: 'date6__1',
        type: 'date'
    },
    'Sales Team': {
        id: 'people__1',
        type: 'people'
    },
    'Ship Finished Goods': {
        id: 'location0',
        type: 'location'
    },
    'Should GN handle the shipping logistics of the finished goods?': {
        id: 'single_select9__1',
        type: 'status'
    },
    'Shrink Wrap': {
        id: 'single_select_2',
        type: 'status'
    },
    Sleeve: {
        id: 'single_select_1',
        type: 'status'
    },
    'Special Notes:': {
        id: 'single_select5',
        type: 'status'
    },
    'Special Request/Notes:': {
        id: 'long_text2',
        type: 'long_text'
    },
    Stage: {
        id: 'deal_stage',
        type: 'status'
    },
    'Stampers?': {
        id: 'status06',
        type: 'status'
    },
    Status: {
        id: 'color_mknhgew1',
        type: 'status'
    },
    'Subitem Rollup Deal Value': {
        id: 'subitems_gn_revenue__1',
        type: 'mirror'
    },
    Tasks: {
        id: 'subitems',
        type: 'subtasks'
    },
    'Test Pressing Destinations': {
        id: 'numbers4__1',
        type: 'numbers'
    },
    'Title:': {
        id: 'text6',
        type: 'text'
    },
    'Total Discs': {
        id: 'numbers1__1',
        type: 'numbers'
    },
    'Total Units': {
        id: 'number4__1',
        type: 'numbers'
    },
    'WON Date': {
        id: 'date1__1',
        type: 'date'
    },
    'What color(s) would you like your records to be?': {
        id: 'multi_select__1',
        type: 'dropdown'
    }
};

const dealTrackerColumnTitleToId = {
    '# of Test Pressings required?': 'numbers50',
    'Artist:': 'artist',
    'CAT/PROJ #': 'short_text_1__1',
    'Calc Roll Up Invoice': 'subitems_formula',
    'Collation & Packing Notes': 'long_text',
    'Completed Date': 'date_mkm2y4ea',
    'Contact Email': 'email__1',
    'Contact Name:': 'short_text8__1',
    'Customer Contact': 'deal_contact',
    'Deal Value (GN)': 'formula5__1',
    'Deal creation date': 'deal_creation_date',
    'Deal length': 'deal_length',
    'Depot Date': 'date5',
    'Expected Close Date': 'color_mkny6etg',
    'Final Quantity': 'dup__of_total_discs__1',
    'GN Income/Unit ($)': 'formula_mkpbxm0k',
    'GN Invoice #': 'text8__1',
    'GN Margin': 'formula9__1',
    'Invoice Value': 'formula__1',
    InvoicePriority: 'dup__of_quotecat__1',
    'Label:': 'text9',
    'Lacquers?': 'status8',
    'Last Check In': 'date__1',
    'Last Follow Up': 'date_mknhhrwc',
    Leads: 'board_relation_mkp7y0rc',
    Notes: 'text_mknh1fek',
    Owner: 'deal_owner',
    Packaging: 'status44',
    'Payment Terms': 'status71__1',
    Phone: 'phone__1',
    'QC Issues': 'status1__1',
    'Quote #': 'text__1',
    'Quote Sent Date': 'date3__1',
    QuoteCAT: 'status6__1',
    'Record: #/Set': '__of_records_set',
    'Record: Format / RPM': 'single_select_3',
    'Release Date': 'date',
    'Req Date INVOICE': 'date6__1',
    'Sales Team': 'people__1',
    'Ship Finished Goods': 'location0',
    'Should GN handle the shipping logistics of the finished goods?': 'single_select9__1',
    'Shrink Wrap': 'single_select_2',
    Sleeve: 'single_select_1',
    'Special Notes:': 'single_select5',
    'Special Request/Notes:': 'long_text2',
    Stage: 'deal_stage',
    'Stampers?': 'status06',
    Status: 'color_mknhgew1',
    'Subitem Rollup Deal Value': 'subitems_gn_revenue__1',
    Tasks: 'subitems',
    'Test Pressing Destinations': 'numbers4__1',
    'Title:': 'text6',
    'Total Discs': 'numbers1__1',
    'Total Units': 'number4__1',
    'WON Date': 'date1__1',
    'What color(s) would you like your records to be?': 'multi_select__1',
    'Close Date': 'deal_close_date'
};

export const dealTrackerColumnIdToTitleAndType = {
    numbers50: {
        title: '# of Test Pressings required?',
        type: 'numbers'
    },
    artist: {
        title: 'Artist:',
        type: 'text'
    },
    short_text_1__1: {
        title: 'CAT/PROJ #',
        type: 'text'
    },
    subitems_formula: {
        title: 'Calc Roll Up Invoice',
        type: 'mirror'
    },
    deal_close_date: {
        title: 'Close Date',
        type: 'date'
    },
    long_text: {
        title: 'Collation & Packing Notes',
        type: 'long_text'
    },
    date_mkm2y4ea: {
        title: 'Completed Date',
        type: 'date'
    },
    email__1: {
        title: 'Contact Email',
        type: 'email'
    },
    short_text8__1: {
        title: 'Contact Name:',
        type: 'text'
    },
    deal_contact: {
        title: 'Customer Contact',
        type: 'board_relation'
    },
    formula5__1: {
        title: 'Deal Value (GN)',
        type: 'formula'
    },
    deal_creation_date: {
        title: 'Deal creation date',
        type: 'date'
    },
    deal_length: {
        title: 'Deal length',
        type: 'formula'
    },
    date5: {
        title: 'Depot Date',
        type: 'date'
    },
    color_mkny6etg: {
        title: 'Expected Close Date',
        type: 'status'
    },
    dup__of_total_discs__1: {
        title: 'Final Quantity',
        type: 'numbers'
    },
    formula_mkpbxm0k: {
        title: 'GN Income/Unit ($)',
        type: 'formula'
    },
    text8__1: {
        title: 'GN Invoice #',
        type: 'text'
    },
    formula9__1: {
        title: 'GN Margin',
        type: 'formula'
    },
    formula__1: {
        title: 'Invoice Value',
        type: 'formula'
    },
    dup__of_quotecat__1: {
        title: 'InvoicePriority',
        type: 'status'
    },
    text9: {
        title: 'Label:',
        type: 'text'
    },
    status8: {
        title: 'Lacquers?',
        type: 'status'
    },
    date__1: {
        title: 'Last Check In',
        type: 'date'
    },
    date_mknhhrwc: {
        title: 'Last Follow Up',
        type: 'date'
    },
    board_relation_mkp7y0rc: {
        title: 'Leads',
        type: 'board_relation'
    },
    text_mknh1fek: {
        title: 'Notes',
        type: 'text'
    },
    deal_owner: {
        title: 'Owner',
        type: 'people'
    },
    status44: {
        title: 'Packaging',
        type: 'status'
    },
    status71__1: {
        title: 'Payment Terms',
        type: 'status'
    },
    phone__1: {
        title: 'Phone',
        type: 'phone'
    },
    status1__1: {
        title: 'QC Issues',
        type: 'status'
    },
    text__1: {
        title: 'Quote #',
        type: 'text'
    },
    date3__1: {
        title: 'Quote Sent Date',
        type: 'date'
    },
    status6__1: {
        title: 'QuoteCAT',
        type: 'status'
    },
    __of_records_set: {
        title: 'Record: #/Set',
        type: 'status'
    },
    single_select_3: {
        title: 'Record: Format / RPM',
        type: 'status'
    },
    date: {
        title: 'Release Date',
        type: 'date'
    },
    date6__1: {
        title: 'Req Date INVOICE',
        type: 'date'
    },
    people__1: {
        title: 'Sales Team',
        type: 'people'
    },
    location0: {
        title: 'Ship Finished Goods',
        type: 'location'
    },
    single_select9__1: {
        title: 'Should GN handle the shipping logistics of the finished goods?',
        type: 'status'
    },
    single_select_2: {
        title: 'Shrink Wrap',
        type: 'status'
    },
    single_select_1: {
        title: 'Sleeve',
        type: 'status'
    },
    single_select5: {
        title: 'Special Notes:',
        type: 'status'
    },
    long_text2: {
        title: 'Special Request/Notes:',
        type: 'long_text'
    },
    deal_stage: {
        title: 'Stage',
        type: 'status'
    },
    status06: {
        title: 'Stampers?',
        type: 'status'
    },
    color_mknhgew1: {
        title: 'Status',
        type: 'status'
    },
    subitems_gn_revenue__1: {
        title: 'Subitem Rollup Deal Value',
        type: 'mirror'
    },
    subitems: {
        title: 'Tasks',
        type: 'subtasks'
    },
    numbers4__1: {
        title: 'Test Pressing Destinations',
        type: 'numbers'
    },
    text6: {
        title: 'Title:',
        type: 'text'
    },
    numbers1__1: {
        title: 'Total Discs',
        type: 'numbers'
    },
    number4__1: {
        title: 'Total Units',
        type: 'numbers'
    },
    date1__1: {
        title: 'WON Date',
        type: 'date'
    },
    multi_select__1: {
        title: 'What color(s) would you like your records to be?',
        type: 'dropdown'
    }
};

/** @type {Record<string, string>} */
export const keyToIdOld = {
    // project name is just the id
    project_name: dealTrackerColumnTitleToId['Title:'],
    contact_name: dealTrackerColumnTitleToId['Contact Name:'],
    contact_email: dealTrackerColumnTitleToId['Contact Email'],
    phone: dealTrackerColumnTitleToId['Phone'],
    label: dealTrackerColumnTitleToId['Label:'],
    artist: dealTrackerColumnTitleToId['Artist:'],
    catalog_number: dealTrackerColumnTitleToId['CAT/PROJ #'],
    release_date: dealTrackerColumnTitleToId['Release Date'],
    depot_date: dealTrackerColumnTitleToId['Depot Date'],
    shipping_address: dealTrackerColumnTitleToId['Ship Finished Goods'],
    shipping_logistics: dealTrackerColumnTitleToId['Should GN handle the shipping logistics of the finished goods?'],
    total_units: dealTrackerColumnTitleToId['Total Units'],
    records_per_set: dealTrackerColumnTitleToId['Record: #/Set'],
    record_format: dealTrackerColumnTitleToId['Record: Format / RPM'],
    record_color: dealTrackerColumnTitleToId['What color(s) would you like your records to be?'],
    lacquers: dealTrackerColumnTitleToId['Lacquers?'],
    metalwork: dealTrackerColumnTitleToId['Stampers?'],
    test_prints: dealTrackerColumnTitleToId['# of Test Pressings required?'],
    packaging: dealTrackerColumnTitleToId['Packaging'],
    notes: dealTrackerColumnTitleToId['Notes']
    // status: dealTrackerColumnTitleToId['Status']
};
