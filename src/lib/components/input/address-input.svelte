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
    <!-- {#if label}
        <label for="address-input-{key}" class="address-label">{label}</label>
    {/if} -->
    <label for={key} class="mb-0">{label}{#if required}*{/if}</label>
    <div class="mb-2 text-xs opacity-50">{description}</div>
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

<style lang="postcss">
    /* Assuming TailwindCSS is configured via postcss */
    @reference "tailwindcss/theme";

    .address-input-container {
        @apply mb-4 w-full;
    }

    /* .address-label {
        @apply mb-1 block text-sm font-medium text-gray-700;
    } */

    .input-wrapper {
        @apply relative;
    }

    input[type='text'] {
        @apply block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm;
    }

    /* Add padding to the right if loading spinner is visible */
    input.loading {
        @apply pr-10;
    }

    .spinner {
        @apply pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3;
    }
    .spinner::after {
        /* Simple CSS spinner */
        content: '';
        @apply block h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600;
    }

    .suggestions-list li {
        @apply relative cursor-pointer py-2 pr-9 pl-3 text-white select-none hover:bg-indigo-600 hover:text-white;
    }

    .error {
        @apply mt-1 text-sm text-red-600;
    }
</style>
