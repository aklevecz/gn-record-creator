# Monday.com Integration Analysis

## Overview
This document provides a comprehensive analysis of the Monday.com integration in the GN Record Creator application, based on code analysis of the existing codebase.

## Key Findings

### Form Fields Structure (`/src/lib/monday/formFields.js`)

The application uses a centralized form field configuration system with the following key components:

#### Submitted Field (Target Field for Logic)
```javascript
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
}
```

**Key Insight**: The `submitted` field with Monday ID `color_mkryy8hj` tracks whether a form has been "Submitted" (index 0) or "Autosaved" (index 1).

#### Field Mapping System
- **Centralized Configuration**: All form fields are defined in a single `formFields` object
- **Monday ID Mapping**: Each field has both a local `key` and a `mondayId` for API communication
- **Type Mapping**: Fields have both local `type` and `mondayType` for proper data transformation
- **Options Structure**: Dropdown/status fields use indexed options for Monday.com compatibility

#### Helper Functions Available
```javascript
// Field retrieval
getFieldByKey(key) - Get field by local key
getFieldById(id) - Get field by Monday ID
getFieldOptions(key) - Get options for dropdown fields
getRequiredFields() - Get all required fields

// Data transformation maps
keyToId - Maps local keys to Monday IDs
idToTitleAndType - Maps Monday IDs to title and type info
```

### Current Integration Architecture

#### Data Flow
1. **Local Form Data** → **Form Fields Mapping** → **Monday API Format** → **Monday.com**
2. **Monday.com** → **API Response** → **Local Storage** → **UI Updates**

#### Key Components Identified
- **Form Fields Configuration** (`/src/lib/monday/formFields.js`) - Central field definitions
- **Field Mapping Logic** - Transforms between local and Monday formats
- **Auto-save Mechanism** - Likely debounced saves to Monday
- **Status Tracking** - Submitted vs Autosaved states

### Field Types and Monday Integration

#### Status Fields (like `submitted`)
- Use `mondayType: 'status'` 
- Options have `index` values for Monday.com status columns
- Support color coding in Monday interface

#### Complex Fields
- **Record Color** (`dropdown_mkqedrj6`) - Multi-select with max 3 selections
- **Date Fields** - Release date, depot date with Monday date format
- **Address Fields** - Text type for Monday, address type locally

### Hidden Fields
```javascript
const hiddenFields = [
    formFields.status.key,
    formFields.submitted.key,
    formFields.create_date.key,
    formFields.updated_at.key,
    formFields.form_id.key
];
```

These fields are managed programmatically and not shown in the UI.

## Implications for Comparison Logic

### For Submitted Status Logic
To build logic around whether `color_mkryy8hj` is "Submitted":

1. **Fetch Monday Data**: Query Monday.com for the specific item
2. **Extract Status**: Look for `color_mkryy8hj` field in response
3. **Compare Values**: Check if value matches "Submitted" (index 0)
4. **Local Comparison**: Compare with local `submitted` field value

### Data Comparison Strategy
1. **Field-by-Field Comparison**: Use `keyToId` mapping to compare each field
2. **Type-Aware Comparison**: Handle different data types (dates, arrays, status values)
3. **Index-Based Status**: Compare status fields using index values, not text
4. **Timestamp Tracking**: Use `updated_at` field for conflict resolution

### Recommended Implementation Approach
1. **Create Comparison Service**: Fetch Monday data and compare with local
2. **Status-Specific Logic**: Special handling for submitted field logic
3. **Conflict Resolution**: UI for handling differences between local and Monday data
4. **Sync Orchestration**: Coordinate updates between local and Monday systems

## Technical Notes

### Monday.com API Integration Points
- Field mapping uses Monday column IDs (e.g., `color_mkryy8hj`)
- Status fields use indexed options for API compatibility
- Date fields likely need format conversion
- Multi-select fields (like record colors) need array handling

### Environment Configuration
The system uses `MONDAY_API_TOKEN` from environment variables for authentication.

### Form ID Tracking
The `form_id` field (`text_mks7f1bc`) is used to track form instances, which could be useful for comparison logic.

## Next Steps for Implementation

1. **Identify Monday API Functions**: Find existing functions that fetch data from Monday.com
2. **Build Comparison Logic**: Create service to compare local vs Monday data
3. **Implement Submitted Logic**: Build specific logic for `color_mkryy8hj` field
4. **Create UI Components**: Build interface for showing comparison results
5. **Test Status Scenarios**: Verify logic works for both "Submitted" and "Autosaved" states

This analysis provides the foundation for implementing robust Monday.com data comparison and submitted status logic.