<script>
    let { text = 'Sick!', bottomPercent = 0 } = $props();
</script>

<div style="bottom:{bottomPercent}%;" class="cute-feedback">
    <div class="h-ful relative w-full">
        <div class="absolute top-0 right-0 rounded-lg bg-white p-4 text-black">{text}</div>
        <img class="h-full w-full" src="/characters/spin-color.svg" alt="spin" />
    </div>
</div>

<style lang="postcss">
    @reference "tailwindcss/theme";
    .cute-feedback {
        @apply fixed bottom-50 z-30 h-[258px] w-[200px];
    }
</style>
