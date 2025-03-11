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
 * @typedef Detail
 * @property {string} label
 * @property {string} description
 * @property {string} value
 * @property {string} type
 */

/**
 * @typedef Details
 * @property {Record<string, Detail>} details
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

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {Date} createdAt
 * @property {Details | null} details
 * @property {Survey | null} survey
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
 */
