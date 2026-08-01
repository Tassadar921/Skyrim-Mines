<script setup lang="ts">
import { ref, computed } from 'vue';
import { Head, router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { CheckCircle, XCircle } from '@lucide/vue';

const props = defineProps<{ token: string }>();

const password = ref('');
const passwordConfirmation = ref('');
const isSubmitting = ref(false);

const rules = computed(() => ({
    length: password.value.length >= 8,
    upper: /[A-Z]/.test(password.value),
    lower: /[a-z]/.test(password.value),
    digit: /\d/.test(password.value),
    special: /[^a-zA-Z\d]/.test(password.value),
}));

const passwordsMatch = computed(() => passwordConfirmation.value.length > 0 && password.value === passwordConfirmation.value);
const allRulesValid = computed(() => Object.values(rules.value).every(Boolean));
const canSubmit = computed(() => allRulesValid.value && passwordsMatch.value);

function submit() {
    isSubmitting.value = true;
    router.post(
        `${urlFor('password.reset.update')}?token=${props.token}`,
        { password: password.value, passwordConfirmation: passwordConfirmation.value },
        {
            onFinish: () => {
                isSubmitting.value = false;
            },
        }
    );
}
</script>

<template>
    <Head :title="$t('passwordReset.title')">
        <meta name="robots" content="noindex" />
    </Head>
    <div class="min-h-screen pt-32 pb-24 px-[8%]">
        <div class="max-w-md mx-auto space-y-8">
            <h1 class="font-serif text-3xl font-light text-slate-800 dark:text-slate-100">
                {{ $t('passwordReset.title') }}
            </h1>

            <div class="space-y-5">
                <div class="space-y-2">
                    <Label for="password">{{ $t('passwordReset.password') }}</Label>
                    <Input id="password" v-model="password" type="password" />

                    <ul class="mt-2 space-y-1">
                        <li v-for="(valid, key) in rules" :key="key" class="flex items-center gap-2 text-xs" :class="valid ? 'text-green-600 dark:text-green-400' : 'text-slate-400'">
                            <CheckCircle v-if="valid" class="size-3.5 shrink-0" />
                            <XCircle v-else class="size-3.5 shrink-0" />
                            {{ $t(`passwordReset.rules.${key}`) }}
                        </li>
                    </ul>
                </div>

                <div class="space-y-2">
                    <Label for="confirmation">{{ $t('passwordReset.confirmation') }}</Label>
                    <Input id="confirmation" v-model="passwordConfirmation" type="password" />
                    <p v-if="passwordConfirmation.length > 0 && !passwordsMatch" class="text-xs text-destructive">
                        {{ $t('passwordReset.mismatch') }}
                    </p>
                </div>

                <Button :disabled="!canSubmit || isSubmitting" class="w-full" @click="submit">
                    {{ $t('passwordReset.submit') }}
                </Button>
            </div>
        </div>
    </div>
</template>
