<script setup lang="ts">
import { computed, ref, type HTMLAttributes } from 'vue';
import { CalendarDate, parseDate, type DateValue } from '@internationalized/date';
import { CalendarIcon } from '@lucide/vue';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { formatCalendarDate } from '~/lib/date_format';
import { cn } from '~/lib/utils';

defineOptions({
    inheritAttrs: false,
});

const props = defineProps<{
    modelValue: string | null;
    min?: string;
    disabled?: boolean;
    placeholder?: string;
    class?: HTMLAttributes['class'];
}>();

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const open = ref(false);

const selected = computed<DateValue | undefined>(() => (props.modelValue ? parseDate(props.modelValue) : undefined));
const minValue = computed<CalendarDate | undefined>(() => (props.min ? parseDate(props.min) : undefined));

function onSelect(value: DateValue | undefined) {
    if (!value) return;
    emit('update:modelValue', value.toString());
    open.value = false;
}
</script>

<template>
    <Popover v-model:open="open">
        <PopoverTrigger as-child>
            <Button type="button" variant="outline" :disabled="disabled" :class="cn('w-full justify-start text-left font-normal', !modelValue && 'text-muted-foreground', props.class)">
                <CalendarIcon class="size-4" />
                {{ modelValue ? formatCalendarDate(modelValue) : placeholder }}
            </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0" align="start">
            <Calendar :model-value="selected" :min-value="minValue" @update:model-value="onSelect" />
        </PopoverContent>
    </Popover>
</template>
