<script>
    import { parsePhoneNumberFromString } from 'libphonenumber-js';

    import countries from './countries';
    import project from '$lib/project.svelte';
    import details from '$lib/details.svelte';
    
    /** @type {Record<string, string>} */
    const countryNames = {
        'US': 'United States',
        'GB': 'United Kingdom', 
        'CA': 'Canada',
        'AU': 'Australia',
        'DE': 'Germany',
        'FR': 'France',
        'IT': 'Italy',
        'ES': 'Spain',
        'NL': 'Netherlands',
        'BE': 'Belgium',
        'CH': 'Switzerland',
        'SE': 'Sweden',
        'NO': 'Norway',
        'DK': 'Denmark',
        'FI': 'Finland',
        'JP': 'Japan',
        'CN': 'China',
        'IN': 'India',
        'BR': 'Brazil',
        'MX': 'Mexico'
    };

    /** @type {import('libphonenumber-js').CountryCode }*/
    let selectedCountry = $state("US");
    let phone = $state('');
    let error = $state('');

    // Initialize from saved data on mount
    $effect(() => {
        const savedPhone = project.state.details?.phone.value;
        if (savedPhone && typeof savedPhone === 'string' && savedPhone.includes('-')) {
            const [country, phoneNumber] = savedPhone.split('-');
            if (country && phoneNumber !== undefined) {
                selectedCountry = /** @type {import('libphonenumber-js').CountryCode} */ (country);
                phone = phoneNumber;
            }
        }
    });


    function validatePhone() {
        if (!phone.trim()) {
            error = '';
            return true;
        }
        try {
            const parsed = parsePhoneNumberFromString(phone, selectedCountry);
            if (parsed && parsed.isValid()) {
                error = '';
                return true;
            } else {
                const countryName = countryNames[selectedCountry] || selectedCountry;
                error = `Please enter a valid ${countryName} phone number`;
                return false;
            }
        } catch (err) {
            error = 'Invalid phone number format';
            return false;
        }
    }



    /** @param {*} e*/
    function handleInput(e) {
        phone = e.target.value;
        if (validatePhone()) {
            details.setValue('phone', `${selectedCountry}-${phone}`);
        }
    }
    

    /** @param {*} e*/
    function handleCountryChange(e) {
        selectedCountry = e.target.value;
        if (phone.trim() && validatePhone()) {
            details.setValue('phone', `${selectedCountry}-${phone}`);
        }
    }
</script>

<div class="phone-input-container">
    <div class="phone-input">
        <select id="country-code-select" value={selectedCountry} onchange={handleCountryChange}>
            {#each countries as country}
                <option value={country.code}>
                    {country.flag} {country.dialCode} {country.code}
                </option>
            {/each}
        </select>

        <input
            id="phone"
            autocomplete="tel"
            type="tel"
            placeholder="Enter phone number"
            value={phone}
            oninput={handleInput}
        />
    </div>
    {#if error}
        <div class="error">{error}</div>
    {/if}
</div>

<style lang="postcss">
    @reference "tailwindcss/theme";
    .phone-input-container {
        width: 100%;
    }

    .phone-input {
        display: flex;
        gap: 4px;
        align-items: stretch;
    }

    select {
        padding: 10px 6px;
        border: 1px solid;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg width='10' height='5' viewBox='0 0 10 5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l5 5 5-5z' fill='%23666'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 10px center;
        background-size: 10px 5px;
        /* min-width: 200px; */
        max-width: 250px;
        flex-shrink: 0;
        @apply text-lg;
    }


    input {
        padding: 10px;
        border: 1px solid;
        flex: 1;
        min-width: 150px;
        @apply text-lg;
    }

    input:focus,
    select:focus {
        outline: none;
        border-color: #0070f3;
        box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.2);
    }

    .error {
        margin-top: 6px;
        color: #e74c3c;
        font-size: 0.875rem;
        text-align: center;
    }
</style>
