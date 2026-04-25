<script>
    import details from '$lib/details.svelte';
    import PhoneInput from '../input/phone-input.svelte';

    let { label, key, description, type, required } = $props();

    /** @param {*} e */
    function onInput(e) {
        details.setValue(key, e.target.value);
    }
</script>

<div class="detail-field">
    <label for={key}>
        {label}{#if required}*{/if}
    </label>
    {#if description}<div class="description">{description}</div>{/if}
    <div class="input-wrap">
        {#if type === 'tel'}
            <PhoneInput />
        {:else}
            <input id={key} name={key} {type} oninput={onInput} autocomplete="on" bind:value={details.state[key].value} />
        {/if}
        {#if type === 'date'}
            <svg
                class="date-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="M19 4h-2V3a1 1 0 0 0-2 0v1H9V3a1 1 0 0 0-2 0v1H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h-2v2h2v-2zm0-4h-2v2h2v-2z"
                    fill="var(--gn-ink)"
                />
            </svg>
        {/if}
    </div>
</div>

<style>
    .detail-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
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
    .input-wrap {
        position: relative;
        max-width: 320px;
    }
    input {
        width: 100%;
    }
    .date-icon {
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        pointer-events: none;
    }
</style>
