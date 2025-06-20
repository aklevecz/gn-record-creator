<script>
    import details from '$lib/details.svelte';
    import PhoneInput from '../input/phone-input.svelte';

    let { label, key, description, type, required } = $props();

    /** @param {*} e */
    function onInput(e) {
        details.setValue(key, e.target.value);
    }
</script>

<div class="flex flex-col">
    <label for={key} class="mb-0">{label}{#if required}*{/if}</label>
    <div class="mb-2 text-xs opacity-50">{description}</div>
    <div class="relative max-w-[300px]">
        {#if type === 'tel'}
            <PhoneInput />
        {:else}
            <input
                id={key}
                name={key}
                {type}
                oninput={onInput}
                autocomplete="on"
                bind:value={details.state[key].value}
            />
        {/if}
        {#if type === 'date'}
            <svg
                class="date-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                style="--icon-color: white;"
            >
                <path
                    d="M19 4h-2V3a1 1 0 0 0-2 0v1H9V3a1 1 0 0 0-2 0v1H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h-2v2h2v-2zm0-4h-2v2h2v-2z"
                    fill="var(--icon-color)"
                />
            </svg>
        {/if}
    </div>
</div>

<style lang="postcss">
    @reference "tailwindcss/theme";
    label {
        @apply font-semibold;
    }
    input {
        @apply w-full rounded-xs border-1 border-white px-2 py-1 text-lg;
    }
    .date-icon {
        /* Style the icon */
        /* pointer-events: none; */
        position: absolute;
        top: 50%;
        right: 8px; /* Adjust as needed */
        transform: translateY(-50%);
        width: 20px; /* Adjust as needed */
        height: 20px; /* Adjust as needed */
    }
</style>
