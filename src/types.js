/**
 * @typedef Option
 * @property {string} img
 * @property {string} text
 */

/**
 * @typedef Question
 * @type {{label: string, options: Option[]}}
 */

/**
 * @typedef Questions @type {Record<string, Question>}
 */

/**
 * @typedef Survey
 * @property {Questions} questions
 * @property {Record<string, string>} answers
 */

/** 
 * @typedef Tooltip
 * @property {string} name
 * @property {string} cta
 * @property {string} description
 * @property {string} link
 */

/**
 * @typedef Detail
 * @property {string} label
 * @property {string} description
 * @property {string} value
 * @property {Tooltip} [tooltip]
 * @property {'text' | 'number' | 'select' | 'dropdown' | 'date' | 'tel' | 'email' | 'address'} type
 * @property {boolean} required
 */

// /**
//  * @typedef Details
//  * @property {Record<string, Detail>} details
//  */

/** 
 * @typedef {Record<string, Detail>} Details
 */

/** @typedef {('idle'|'starting'|'processing'|'succeeded'|'failed'|'canceled')} Status */

/**
 * @typedef {Object} ReplicateResponse
 * @property {string} id - Unique identifier for the prediction
 * @property {string} model - Name of the model used for the prediction
 * @property {string} version - Version of the model used
 * @property {Object} input - Input parameters for the prediction
 * @property {string} input.hf_lora - HuggingFace LoRA identifier
 * @property {string} input.prompt - Text prompt used for the prediction
 * @property {string} logs - Any logs generated during the prediction process
 * @property {string[]} output - Array of URLs to the generated output(s)
 * @property {boolean} data_removed - Indicates whether the data has been removed
 * @property {null|string} error - Error message if an error occurred, null otherwise
 * @property {Status} status - Current status of the prediction
 * @property {string} created_at - ISO 8601 timestamp of when the prediction was created
 * @property {Object} urls - URLs for additional actions
 * @property {string} urls.cancel - URL to cancel the prediction
 * @property {string} urls.get - URL to get the prediction details
 */

/**
 * @typedef {Object} GeneratedImgEntry
 * @property {string} id
 * @property {number} lastModified
 * @property {string} fileType
 * @property {string} fileName
 * @property {Blob} imgBlob
 * @property {string} imgUrl
 * @property {string} seed
 * @property {string} prompt
 */

// SHOULD THESE BE NUMBERS?
/**
 * @typedef Pricing
 * @property {number} record_color
 * @property {number} total_units
 * @property {number} records_per_set
 * @property {number} record_format
 * @property {number} lacquers
 * @property {number} metalwork
 * @property {number} test_prints
 * @property {number} packaging
 * @property {number} estimatedCost
 */

/** 
 * @typedef CarbonSavings
 * @property {number} record_color
 * @property {number} total_units
 * @property {number} packaging
 * @property {number} shipping_address
 * @property {number} estimatedCarbonSavings
 */

/**
 * @typedef Texture
 * @property {string} fileHash
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} mondayId
 * @property {string} version
 * @property {string} name
 * @property {Date} createdAt
 * @property {Details | null} details
 * @property {Texture[]} textures
 * @property {Pricing} pricing
 * @property {any} carbonSavings // Define the type more specifically if possible
 */

/**
 * @typedef {object} Submission
 * @property {string} id - Unique identifier for the submission
 * @property {string} project_name - Name of the project
 * @property {string} contact_name - Name of the contact person
 * @property {string} contact_email - Email address of the contact
 * @property {string} phone - Phone number
 * @property {string} label - Record label
 * @property {string} artist - Artist name
 * @property {string} catalog_number - Catalog number for the release
 * @property {string} release_date - Date of release
 * @property {string} depot_date - Date for depot arrival
 * @property {string} shipping_address - Address for shipping finished goods
 * @property {string} shipping_logistics - Whether GN handles shipping logistics
 * @property {string} total_units - Total number of units to manufacture
 * @property {string} records_per_set - Number of records per set
 * @property {string} record_format - RPM / Record format
 * @property {string} record_color - Color(s) of the records
 * @property {string} lacquers - Whether lacquers are handled by service
 * @property {string} metalwork - Type of stampers needed
 * @property {string} test_prints - Number of test pressings required
 * @property {string} packaging - Type of LP jacket to print
 * @property {string} notes - Additional project details, comments, and requests
 * @property {string} status - Current status of the submission
 * @property {string} session - Session identifier associated with the submission
 */

/**
 * @typedef {Object} ImgData
 * @property {string} [id]
 * @property {string} [seed]
 * @property {string} projectId
 * @property {string} [fileName]
 * @property {string} [fileHash]
 * @property {Blob} [imgBlob]
 * @property {string} [imgUrl]
 * @property {string} [prompt]
 * @property {string | null} [fileType]
 */

/**
 * @typedef {Object} TextureObject
 * @property {string} url
 * @property {string} id
 * @property {string} seed
 * @property {string} fileName
 * @property {string} fileType
 * @property {ArrayBuffer} arrayBuffer
 */

/**
 * @typedef {Object} IDBTextureObject
 * @property {ArrayBuffer} arrayBuffer
 * @property {string} fileHash
 * @property {string} fileName
 * @property {string} fileType
 * @property {string} id
 * @property {number} lastModified
 * @property {string} projectId
 * @property {string} seed
 */
