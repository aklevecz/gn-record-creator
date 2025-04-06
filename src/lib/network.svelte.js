/**
 * @typedef {Object} NetworkState
 * @property {boolean} isOnline - Indicates whether the network is online or offline.
 */

/** @type {NetworkState} */
const defaultNetworkState = {
    isOnline: navigator.onLine
};

let FORCE_OFFLINE = false;

/** @type {*} */
const testNavigator = {
    onLine: false
};

const createNetwork = () => {
    let network = $state({ ...defaultNetworkState });

    /** @type {Navigator | null} */
    let navigator = null;
    return {
        get state() {
            return network;
        },
        /**
         * Initializes event listeners for online/offline events.
         */
        init() {
            navigator = FORCE_OFFLINE ? testNavigator : window.navigator;
            window.addEventListener('online', this.updateNetworkStatus);
            window.addEventListener('offline', this.updateNetworkStatus);

            // Set the initial state
            setTimeout(() => this.updateNetworkStatus(), 0);
        },

        updateNetworkStatus() {
            network.isOnline = navigator ? navigator.onLine : true;
            console.log('Network is online:', network.isOnline);
        },
        /**
         * Cleans up event listeners for online/offline events.
         */
        cleanup() {
            window.removeEventListener('online', this.updateNetworkStatus);
            window.removeEventListener('offline', this.updateNetworkStatus);
        },
        /**
         * Manually update the network state.
         * @param {boolean} isOnline
         */
        setOnlineStatus(isOnline) {
            network.isOnline = isOnline;
        }
    };
};

const network = createNetwork();
export default network;

export { createNetwork };
