<script setup lang="ts">
import { computed } from 'vue';
import { Loader2, SendHorizontal } from '@lucide/vue';
import { cn } from '~/lib/utils';

interface Props {
    isValid?: boolean;
    isLoading?: boolean;
    submittable?: boolean;
    class?: string;
}

const props = withDefaults(defineProps<Props>(), {
    isValid: true,
    isLoading: false,
    submittable: true,
});

const emit = defineEmits<{
    submit: [];
}>();

const isSubmitDisabled = computed(() => props.isLoading || !props.isValid);

const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!isSubmitDisabled.value) {
        emit('submit');
    }
};
</script>

<template>
    <div :class="cn('flex items-center justify-center', props.class)">
        <div class="w-10/12 rounded-xl border bg-card px-8 py-6 text-card-foreground shadow sm:w-lg">
            <form class="flex flex-col gap-3" @submit="handleSubmit">
                <div v-if="$slots.header" class="flex flex-col space-y-1.5 pb-2">
                    <slot name="header" />
                </div>

                <div class="flex flex-col gap-8">
                    <slot />
                </div>

                <slot name="links" />

                <div v-if="submittable" class="flex justify-center pt-2">
                    <button
                        type="submit"
                        :disabled="isSubmitDisabled"
                        :class="
                            cn(
                                'inline-flex h-10 w-full items-center justify-center gap-2 rounded-md px-8 text-sm font-medium transition-colors',
                                'bg-primary text-primary-foreground hover:bg-primary/90',
                                'disabled:pointer-events-none disabled:opacity-50',
                            )
                        "
                    >
                        <Loader2 v-if="isLoading" class="size-4 animate-spin" />
                        <slot v-else name="submit-content">
                            <span class="text-lg">Envoyer</span>
                            <SendHorizontal class="size-5" />
                        </slot>
                    </button>
                </div>

                <slot name="footer" />
            </form>
        </div>
    </div>
</template>
