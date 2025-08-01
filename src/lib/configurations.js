const public_dev = '091495765fa5ef2725a175a57b276ec30dc9d39c22d30410f2ede68a3eab66b3';
const public_schnell = '2a6b576af31790b470f0a8442e1e9791213fa13799cbb65a9fc1436e96389574';

/**
 * @typedef {Object} Configuration
 * @property {string} model - Name of the model to use
 * @property {string} triggerWord - Word to trigger the model
 * @property {string} promptWord - Word to replace the trigger word
 * @property {string} replicateId - Replicate deployment ID
 * @property {Object} modelParams - Parameters to pass to the model
 */

/** @typedef {Record<string, Configuration>} AIConfiguration */

/** @type {AIConfiguration} */
export default {
	'aklevecz/bao-flux': {
		triggerWord: 'a french bulldog',
		promptWord: 'bao',
		model: 'aklevecz/bao-flux',
		replicateId: public_dev,
		modelParams: {
			hf_lora: 'aklevecz/bao-flux'
		}
	},
	'aklevecz/bao-flux-schnell': {
		triggerWord: 'a french bulldog',
		promptWord: 'bao',
		model: 'aklevecz/bao-flux-schnell',
		replicateId: public_schnell,
		modelParams: {
			hf_lora: 'aklevecz/bao-flux-schnell'
		}
	},
	'aklevecz/finn_flux': {
		triggerWord: 'a white cat',
		promptWord: 'finn',
		model: 'aklevecz/finn_flux',
		replicateId: public_schnell,
		modelParams: {
			hf_lora: 'aklevecz/finn_flux'
		}
	},
	'black-forest-labs/flux-schnell': {
		triggerWord: 'a french bulldog',
		promptWord: 'bao',
		model: 'black-forest-labs/flux-schnell',
		replicateId: public_schnell,
		modelParams: {}
	},
	'black-forest-labs/flux-1.1-pro-ultra': {
		triggerWord: 'a french bulldog',
		promptWord: 'bao',
		model: 'black-forest-labs/flux-1.1-pro-ultra',
		// replicateId: public_dev,
		safety_tolerance: 6,
		modelParams: {}
	},
	'aklevecz/flux-raptor-lora': {
		triggerWord: 'velociraptor',
		promptWord: 'raptor',
		model: 'aklevecz/flux-raptor-lora',
		replicateId: public_dev,
		modelParams: {
			hf_lora: 'aklevecz/flux-raptor-lora'
		}
	}
};
