<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { cn } from '~/lib/utils';

/**
 * 24-hour "HH:mm" picker. Native `type="time"` inputs follow the browser's locale (AM/PM on an English
 * browser), so hours and minutes are picked from two lists instead, always in French 24-hour format.
 */
const props = withDefaults(
    defineProps<{
        modelValue: string | null | undefined;
        /** Minute granularity offered in the list; a value off the grid (e.g. 09:07) is still shown. */
        minuteStep?: number;
        disabled?: boolean;
        class?: HTMLAttributes['class'];
    }>(),
    { minuteStep: 5 },
);

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const pad = (value: number) => String(value).padStart(2, '0');

const hour = computed(() => props.modelValue?.slice(0, 2) ?? '');
const minute = computed(() => props.modelValue?.slice(3, 5) ?? '');

const hours = Array.from({ length: 24 }, (_, value) => pad(value));
const minutes = computed(() => {
    const options = Array.from({ length: Math.ceil(60 / props.minuteStep) }, (_, index) => pad(index * props.minuteStep));
    return minute.value && !options.includes(minute.value) ? [...options, minute.value].sort() : options;
});

function onHourChange(value: unknown) {
    emit('update:modelValue', `${String(value)}:${minute.value || '00'}`);
}

function onMinuteChange(value: unknown) {
    emit('update:modelValue', `${hour.value || '00'}:${String(value)}`);
}
</script>

<template>
    <div :class="cn('flex items-center gap-1', props.class)">
        <Select :model-value="hour || undefined" :disabled="disabled" @update:model-value="onHourChange">
            <SelectTrigger class="w-[4.5rem]" aria-label="Heures">
                <SelectValue placeholder="--" />
            </SelectTrigger>
            <SelectContent class="max-h-64">
                <SelectItem v-for="value in hours" :key="value" :value="value">{{ value }}</SelectItem>
            </SelectContent>
        </Select>
        <span class="text-muted-foreground">h</span>
        <Select :model-value="minute || undefined" :disabled="disabled" @update:model-value="onMinuteChange">
            <SelectTrigger class="w-[4.5rem]" aria-label="Minutes">
                <SelectValue placeholder="--" />
            </SelectTrigger>
            <SelectContent class="max-h-64">
                <SelectItem v-for="value in minutes" :key="value" :value="value">{{ value }}</SelectItem>
            </SelectContent>
        </Select>
    </div>
</template>
