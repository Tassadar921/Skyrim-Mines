<script setup lang="ts">
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Minus, Plus } from '@lucide/vue';

const props = defineProps<{
    modelValue: number;
    max?: number;
    showMax?: boolean;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: number];
}>();

function normalize(value: string | number): number {
    const rounded = Math.max(0, Math.round(Number(value) || 0));
    return props.max !== undefined ? Math.min(rounded, props.max) : rounded;
}

function step(delta: number, event: MouseEvent) {
    const amount = event.shiftKey ? delta * 10 : delta;
    emit('update:modelValue', normalize(props.modelValue + amount));
}

function setMax() {
    if (props.max !== undefined) emit('update:modelValue', props.max);
}
</script>

<template>
    <div class="flex items-center gap-1">
        <Button type="button" variant="outline" size="icon-sm" class="shrink-0" @click="step(-1, $event)">
            <Minus class="size-4" />
        </Button>
        <div class="w-20 shrink-0">
            <Input type="number" class="w-full text-center" :model-value="modelValue" @update:model-value="(value) => emit('update:modelValue', normalize(value))" />
        </div>
        <Button type="button" variant="outline" size="icon-sm" class="shrink-0" @click="step(1, $event)">
            <Plus class="size-4" />
        </Button>
        <Button v-if="showMax" type="button" variant="outline" size="icon-sm" class="w-auto shrink-0 px-2 text-xs" @click="setMax">Max</Button>
    </div>
</template>
