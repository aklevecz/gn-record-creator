<script>
    import details from '$lib/details.svelte'; // Assuming address should be stored here

    /**
     * @typedef {Object} AddressComponent
     * @property {string} [address1]
     * @property {string} [address2]
     * @property {string} [city]
     * @property {string} [state]
     * @property {string} [postalCode]
     * @property {string} [country]
     */

    /**
     * @typedef {Object} Suggestion
     * @property {string} fullAddress
     * @property {AddressComponent} [components]
     */

    let {
        label = 'Shipping Address',
        key = 'shipping_address',
        description = '',
        initialValue = '',
        required = false
    } = $props();

    // Internal reactive state using Svelte 5 runes
    let value = $state(initialValue);
    /** @type {Suggestion[]} */
    let suggestions = $state([]);
    let showSuggestions = $state(false);
    let error = $state('');
    let loading = $state(false);
    /** @type {NodeJS.Timeout|undefined} */
    let debounceTimer = $state(undefined);

    /**
     * Fetches address suggestions from the location API
     * @param {string} query - The search query
     * @returns {Promise<void>}
     */
    async function fetchAddressSuggestions(query) {
        if (!query || query.length < 3) {
            suggestions = [];
            showSuggestions = false;
            return;
        }

        details.setValue(key, query);

        loading = true;
        error = '';
        console.log('Fetching suggestions for:', query);

        try {
            const response = await fetch(`/api/location?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Network response was not ok');

            /** @type {any[]} */
            const data = await response.json();
            suggestions = data.map((suggestion) => ({
                fullAddress: suggestion.display_name
            }));

            const uniqueSuggestionsMap = new Map();
            const currentSuggestions = suggestions; // Use a temporary variable to read current state
            currentSuggestions.forEach((suggestion) => {
                if (!uniqueSuggestionsMap.has(suggestion.fullAddress)) {
                    uniqueSuggestionsMap.set(suggestion.fullAddress, suggestion);
                }
            });
            suggestions = Array.from(uniqueSuggestionsMap.values());

            showSuggestions = suggestions.length > 0; // Update showSuggestions *after* deduplication
        } catch (err) {
            console.error('Failed to fetch address suggestions:', err);
            error = 'Could not fetch suggestions. Please check your connection or input.';
            suggestions = [];
            showSuggestions = false;
        } finally {
            loading = false;
        }
    }

    /**
     * Selects a suggestion from the dropdown
     * @param {Suggestion} suggestion - The selected address suggestion
     */
    function selectSuggestion(suggestion) {
        value = suggestion.fullAddress;

        details.setValue(key, suggestion.fullAddress);
        console.log(`Updated '${key}' in details store:`, details.state[key]);

        suggestions = [];
        showSuggestions = false;
        error = '';
    }

    /**
     * Handles input changes with debouncing
     * @param {*} event - The input event
     */
    function handleInput(event) {
        const target = event.currentTarget;
        value = target.value;
        if (debounceTimer) clearTimeout(debounceTimer);

        // If user clears input or modifies significantly after selection, clear stored value
        // Comparing against the string value now stored in details.state
        // if (details.state[key]?.value !== value) { // Access the .value property
        //      details.setValue(key, ''); // Set to empty string instead of null
        //      error = ''; // Clear previous errors on new input
        // }

        debounceTimer = setTimeout(() => {
            fetchAddressSuggestions(value);
        }, 300); // 300ms debounce delay
    }

    function handleBlur() {
        // Use window.setTimeout for browser environments
        setTimeout(() => {
            showSuggestions = false;
        }, 150);
    }

    // Optional: Effect to sync with external store changes if needed
    // $effect(() => {
    //   const storeValue = details.state[key]?.value; // Access .value here too
    //   if (storeValue && storeValue !== value) {
    //     value = storeValue;
    //   } else if (!storeValue && value !== initialValue) {
    //      value = initialValue;
    //   }
    // });
</script>

<div class="address-input-container">
    <label for={key}>{label}{#if required}*{/if}</label>
    {#if description}<div class="description">{description}</div>{/if}
    <div class="input-wrapper">
        <input
            type="text"
            id={key}
            placeholder="Start typing address..."
            bind:value
            oninput={handleInput}
            onblur={handleBlur}
            autocomplete="off"
            class:loading
            aria-autocomplete="list"
            aria-controls="suggestions-list-{key}"
        />
        {#if loading}
            <div class="spinner" aria-hidden="true"></div>
        {/if}
        {#if showSuggestions && suggestions.length > 0}
            <ul class="suggestions-list" id="suggestions-list-{key}" role="listbox">
                {#each suggestions as suggestion, index (suggestion.fullAddress)}
                    <li
                        role="option"
                        aria-selected="false"
                        id="suggestion-{key}-{index}"
                        onmousedown={() => selectSuggestion(suggestion)}
                    >
                        {suggestion.fullAddress}
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
    {#if error}
        <div class="error" role="alert">{error}</div>
    {/if}
</div>

<style>
    .address-input-container {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
    }
    label {
        font-family: var(--gn-font-sans);
        font-weight: 700;
        font-size: 16px;
        letter-spacing: -0.024em;
        color: var(--gn-ink);
    }
    .description {
        font-size: 12px;
        color: var(--gn-fg-2);
        margin-bottom: 4px;
    }
    .input-wrapper {
        position: relative;
        max-width: 320px;
    }
    input[type='text'] {
        width: 100%;
    }
    input.loading {
        padding-right: 38px;
    }
    .spinner {
        position: absolute;
        inset: 0 12px 0 auto;
        display: flex;
        align-items: center;
        pointer-events: none;
    }
    .spinner::after {
        content: '';
        display: block;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid var(--gn-n-300);
        border-top-color: var(--gn-ink);
        animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
    .suggestions-list {
        list-style: none;
        margin: 6px 0 0;
        padding: 6px;
        background: var(--gn-paper);
        border: 1px solid var(--gn-ink);
        border-radius: var(--gn-r-sm);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        max-height: 240px;
        overflow-y: auto;
        position: absolute;
        left: 0;
        right: 0;
        top: 100%;
        z-index: 10;
    }
    .suggestions-list li {
        cursor: pointer;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
        color: var(--gn-ink);
        user-select: none;
    }
    .suggestions-list li:hover {
        background: var(--gn-ink);
        color: var(--gn-paper);
    }
    .error {
        margin-top: 4px;
        font-size: 13px;
        color: var(--gn-vinyl-red);
    }
</style>
