<script>
    import { parsePhoneNumberFromString } from 'libphonenumber-js';

    import countries from './countries';
    import project from '$lib/project.svelte';
    import details from '$lib/details.svelte';
    // import user from '$lib/stores/user.svelte';

    /** @type {import('libphonenumber-js').CountryCode }*/
    let selectedCountry = $state("US");
    let phone = $state('');
    let error = $state('');

    // let phoneValue = $derived(user.state.phoneNumber.number);
	// IM NOT SURE IF ITS BETTER TO USE THIS DERIVED PATTERN OR BIND VALUE
    let phoneValue = $derived(project.state.details?.phone.value.split('-').pop());
	let countryValue = $derived(project.state.details?.phone.value.split('-')[0])

    function validatePhone() {
        if (!phone.trim()) {
            error = '';
            return;
        }
        try {
            const parsed = parsePhoneNumberFromString(phone, selectedCountry);
            if (parsed && parsed.isValid()) {
                error = '';
            } else {
                error = 'Invalid phone number';
            }
        } catch (err) {
            console.log(err);
            error = 'Invalid phone number';
        }
    }

    // $effect(() => {
	// 	/** @type {import('libphonenumber-js').CountryCode | * }*/
	// 	const savedCountryCode = project.state.details?.phone.value.split('-')[0] 
	// 	selectedCountry = savedCountryCode || "US"
    // });

    const getCountryPrefix = () => {
        return countries.find((c) => c.code === selectedCountry)?.dialCode || '+1';
    };

    /** @param {*} e*/
    function handleInput(e) {
        // hasSubmittedCode = false;
        phone = e.target.value;
        validatePhone();
        // UPDATE DETAILS
        // user.updateUser({
        //     phoneNumber: {
        //         number: phone,
        //         countryCode: getCountryPrefix()
        //     }
        // });
        details.setValue('phone', `${selectedCountry}-${phone}`);
		console.log(details.state.phone)
    }

    /** @param {*} e*/
    function handleCountryChange(e) {
        selectedCountry = e.target.value;
        validatePhone();
        details.setValue('phone', `${selectedCountry}-${phone}`);

        // UPDATE DETAILS
        // user.updateUser({ phoneNumber: { number: phone, countryCode: getCountryPrefix() } });
    }
</script>

<div class="phone-input-container">
    <!-- <label for="phone">Phone Number</label> -->
    <div class="phone-input">
        <select id="country-code-select" value={countryValue} onchange={handleCountryChange}>
            {#each countries as country}
                <option value={country.code}>
                    {country.flag}
                    {country.dialCode}
                </option>
            {/each}
        </select>

        <input
            id="phone"
            autocomplete="tel"
            type="tel"
            placeholder="Enter phone number"
            value={phoneValue}
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
        /* max-width: 200px; */
        /* margin: 20px auto; */
    }

    .phone-input {
        display: flex;
        gap: 4px;
        /* align-items: center; */
    }

    select {
        padding: 10px 6px;
        border: 1px solid;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg width='10' height='5' viewBox='0 0 10 5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l5 5 5-5z' fill='%23666'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 10px center;
        background-size: 10px 5px;
        flex: 0 0 10%;
        @apply text-lg;
    }

    /* label {
        @apply mb-1 text-sm;
    } */

    input {
        padding: 10px;
        border: 1px solid;
        width: 205px;
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
