<script setup lang="ts">
import { ref, computed } from 'vue';
import { Eye, EyeOff } from '@lucide/vue';
import { cn } from '~/lib/utils';

type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local';

interface Props {
    modelValue?: string | number;
    type?: InputType;
    name?: string;
    id?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    readonly?: boolean;
    error?: string;
    class?: string;
    max?: number;
    pattern?: string;
    autocomplete?: string;
}

const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    required: false,
    readonly: false,
});

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const isFocused = ref(false);
const touched = ref(false);
const showPassword = ref(false);

const isPassword = computed(() => props.type === 'password');
const actualType = computed(() => {
    if (isPassword.value) return showPassword.value ? 'text' : 'password';
    return props.type;
});

const hasValue = computed(() => props.modelValue !== undefined && props.modelValue !== null && props.modelValue !== '');
const showError = computed(() => !!props.error && touched.value);
const inputId = computed(() => props.id ?? props.name);

const handleFocus = () => {
    isFocused.value = true;
};

const handleBlur = () => {
    isFocused.value = false;
    touched.value = true;
};

const handleInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    let val = input.value;

    if (props.max && val.length > props.max) {
        val = val.slice(0, props.max);
        input.value = val;
    }

    if (props.pattern) {
        try {
            const patternRegex = new RegExp(`[${props.pattern}]`);
            if (!new RegExp(`^[${props.pattern}]*$`).test(val)) {
                val = val
                    .split('')
                    .filter((char) => patternRegex.test(char))
                    .join('');
                input.value = val;
            }
        } catch {}
    }

    emit('update:modelValue', val);
};

const togglePassword = () => {
    showPassword.value = !showPassword.value;
};
</script>

<template>
    <div class="w-full">
        <div class="relative">
            <label
                :for="inputId"
                :class="
                    cn(
                        'absolute pointer-events-none z-10 font-medium transition-all duration-200 ease-in-out',
                        isFocused || hasValue ? 'bottom-9 left-1 text-xs text-foreground' : 'bottom-1.5 left-3 text-base text-muted-foreground'
                    )
                "
            >
                {{ label }}
                <span v-if="required" class="text-destructive font-medium">*</span>
            </label>

            <input
                :id="inputId"
                :type="actualType"
                :name="name"
                :placeholder="isFocused ? placeholder : ''"
                :readonly="readonly"
                :required="required"
                :autocomplete="autocomplete"
                :aria-invalid="showError ? 'true' : undefined"
                :value="modelValue"
                :class="
                    cn(
                        'border-input bg-background selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground shadow-xs flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base outline-none transition-[color,box-shadow]',
                        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                        'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
                        'disabled:cursor-not-allowed disabled:opacity-50 read-only:cursor-not-allowed read-only:opacity-50',
                        isPassword ? 'pr-10' : '',
                        showError ? 'border-destructive focus-visible:ring-destructive/50' : '',
                        props.class
                    )
                "
                @focus="handleFocus"
                @blur="handleBlur"
                @input="handleInput"
            />

            <button
                v-if="isPassword"
                type="button"
                :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                class="absolute -top-0.5 right-0 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                @click="togglePassword"
            >
                <EyeOff v-if="showPassword" class="size-5" />
                <Eye v-else class="size-5" />
            </button>
        </div>

        <p v-if="showError" class="mt-1 text-sm text-destructive">{{ error }}</p>
    </div>
</template>
