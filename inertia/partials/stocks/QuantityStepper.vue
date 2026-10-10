<script setup lang="ts">
import { ref, watch } from 'vue';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Minus, Plus } from '@lucide/vue';
import { evaluateMathExpression } from '~/lib/safe_math_eval';

const props = defineProps<{
    modelValue: number;
    min?: number;
    max?: number;
    showMax?: boolean;
    disabled?: boolean;
    /** Lets the field be typed as "=50+30+12" (evaluated on blur/Enter) — handy when the same item ends up split across several stacks. */
    allowFormula?: boolean;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: number];
}>();

function normalize(value: number): number {
    const rounded = Math.max(props.min ?? 0, Math.round(value));
    return props.max !== undefined ? Math.min(rounded, props.max) : rounded;
}

function step(delta: number, event: MouseEvent) {
    const amount = event.shiftKey ? delta * 10 : delta;
    emit('update:modelValue', normalize(props.modelValue + amount));
}

function setMax() {
    if (props.max !== undefined) emit('update:modelValue', props.max);
}

// Formula mode: the raw text is kept locally and only evaluated/committed on blur or Enter, so
// typing "=50+30+12" isn't wiped out mid-entry by the controlled modelValue resetting the input.
const rawInput = ref<string | number>(props.modelValue);

watch(
    () => props.modelValue,
    (value) => {
        rawInput.value = value;
    },
);

function onInputChange(value: string | number) {
    if (!props.allowFormula) {
        emit('update:modelValue', normalize(Number(value) || 0));
        return;
    }
    rawInput.value = value;
}

function commitFormula() {
    if (!props.allowFormula) return;

    const raw = String(rawInput.value).trim();
    const evaluated = raw.startsWith('=') ? evaluateMathExpression(raw.slice(1)) : Number(raw);
    rawInput.value = normalize(Number.isNaN(evaluated) ? props.modelValue : evaluated);

    emit('update:modelValue', rawInput.value as number);
}
</script>

<template>
    <div class="flex items-center gap-1">
        <Button type="button" variant="outline" size="icon-sm" class="shrink-0" :disabled="disabled" @click="step(-1, $event)">
            <Minus class="size-4" />
        </Button>
        <div class="w-20 shrink-0">
            <Input
                :type="allowFormula ? 'text' : 'number'"
                class="w-full text-center"
                :disabled="disabled"
                :model-value="allowFormula ? rawInput : modelValue"
                @update:model-value="onInputChange"
                @blur="commitFormula"
                @keydown.enter="commitFormula"
            />
        </div>
        <Button type="button" variant="outline" size="icon-sm" class="shrink-0" :disabled="disabled" @click="step(1, $event)">
            <Plus class="size-4" />
        </Button>
        <Button v-if="showMax" type="button" variant="outline" size="icon-sm" class="w-auto shrink-0 px-2 text-xs" :disabled="disabled" @click="setMax">Max</Button>
    </div>
</template>
