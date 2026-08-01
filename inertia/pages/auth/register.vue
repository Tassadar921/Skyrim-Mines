<script setup lang="ts">
import { computed } from 'vue';
import { Head, useForm } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
import { Form } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { CheckCircle, XCircle } from '@lucide/vue';
import { urlFor } from '~/client';

const { t } = useI18n();

const form = useForm({
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    acceptedTerms: false,
    website: '',
});

const password = computed(() => form.password);

const rules = computed(() => ({
    length: password.value.length >= 8,
    upper: /[A-Z]/.test(password.value),
    lower: /[a-z]/.test(password.value),
    digit: /\d/.test(password.value),
    special: /[^a-zA-Z\d]/.test(password.value),
}));

const passwordsMatch = computed(() => form.passwordConfirmation.length > 0 && form.password === form.passwordConfirmation);
const allRulesValid = computed(() => Object.values(rules.value).every(Boolean));
const canSubmit = computed(() => form.username.trim().length >= 2 && form.email.length > 0 && allRulesValid.value && passwordsMatch.value && form.acceptedTerms);

const handleSubmit = () => {
    if (!canSubmit.value) return;
    form.post('/register');
};
</script>

<template>
    <Head :title="$t('auth.register.title')">
        <meta name="robots" content="noindex" />
    </Head>
    <div class="min-h-screen flex items-center justify-center">
        <Form :is-loading="form.processing" class="relative flex items-center justify-center border rounded-lg px-15 py-8 m-auto" @submit="handleSubmit">
            <input
                v-model="form.website"
                name="website"
                type="text"
                tabindex="-1"
                autocomplete="off"
                aria-hidden="true"
                style="position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden"
            />
            <div class="flex flex-col gap-8">
                <div>
                    <h1 class="text-2xl font-semibold">{{ $t('auth.register.title') }}</h1>
                    <p class="text-sm text-muted-foreground mt-1">{{ $t('auth.register.subtitle') }}</p>
                </div>

                <div class="flex flex-col gap-6">
                    <Input v-model="form.username" name="username" type="text" :label="t('auth.register.username')" :error="form.errors.username" autocomplete="username" required />
                    <Input v-model="form.email" name="email" type="email" :label="t('auth.register.email')" :error="form.errors.email" autocomplete="email" required />

                    <div class="space-y-2">
                        <Label for="password">{{ $t('auth.register.password') }}</Label>
                        <Input id="password" v-model="form.password" name="password" type="password" :error="form.errors.password" autocomplete="new-password" required />
                        <ul class="mt-2 space-y-1">
                            <li v-for="(valid, key) in rules" :key="key" class="flex items-center gap-2 text-xs" :class="valid ? 'text-green-600 dark:text-green-400' : 'text-slate-400'">
                                <CheckCircle v-if="valid" class="size-3.5 shrink-0" />
                                <XCircle v-else class="size-3.5 shrink-0" />
                                {{ $t(`auth.register.rules.${key}`) }}
                            </li>
                        </ul>
                    </div>

                    <div class="space-y-2">
                        <Label for="confirmation">{{ $t('auth.register.confirmation') }}</Label>
                        <Input
                            id="confirmation"
                            v-model="form.passwordConfirmation"
                            name="passwordConfirmation"
                            type="password"
                            :error="form.errors.passwordConfirmation"
                            autocomplete="new-password"
                            required
                        />
                        <p v-if="form.passwordConfirmation.length > 0 && !passwordsMatch" class="text-xs text-destructive">
                            {{ $t('auth.register.mismatch') }}
                        </p>
                    </div>

                    <div class="flex items-start gap-2.5">
                        <input id="acceptedTerms" v-model="form.acceptedTerms" type="checkbox" class="mt-0.5 size-4 shrink-0 rounded border-slate-300 accent-amber-600 cursor-pointer" />
                        <Label for="acceptedTerms" class="text-sm font-normal leading-snug cursor-pointer">
                            {{ $t('auth.register.acceptTerms') }}
                            <a :href="urlFor('terms.show')" target="_blank" class="underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
                                {{ $t('auth.register.termsLink') }}
                            </a>
                        </Label>
                    </div>

                    <Button type="submit" :disabled="!canSubmit || form.processing">
                        {{ $t('auth.register.submit') }}
                    </Button>
                </div>

                <p class="text-sm text-center text-muted-foreground">
                    {{ $t('auth.register.hasAccount') }}
                    <a href="/login" class="text-foreground underline-offset-4 hover:underline">
                        {{ $t('auth.register.login') }}
                    </a>
                </p>
            </div>
        </Form>
    </div>
</template>
