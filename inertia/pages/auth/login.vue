<script setup lang="ts">
import { computed } from 'vue';
import { Head, useForm, usePage } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
import { Form } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import type { Data } from '@generated/data';
import { Button } from '~/components/ui/button';
import { urlFor } from '~/client';

const page = usePage<Data.SharedProps>();
const { t } = useI18n();

const form = useForm({
    email: '',
    password: '',
    acceptTerms: false,
});

const requiresTermsAcceptance = computed(() => !!page.props.flash.requireTermsAcceptance);
const canSubmit = computed(() => !requiresTermsAcceptance.value || form.acceptTerms);

const handleSubmit = () => {
    if (!canSubmit.value) return;
    form.post('/login');
};
</script>

<template>
    <Head :title="$t('auth.login.title')">
        <meta name="robots" content="noindex" />
    </Head>
    <div class="min-h-screen flex items-center justify-center">
        <Form :is-loading="form.processing" class="relative flex items-center justify-center border rounded-lg px-15 py-8 m-auto" @submit="handleSubmit">
            <div class="flex flex-col gap-8">
                <h1 class="text-2xl font-semibold">{{ $t('auth.login.title') }}</h1>
                <p class="text-sm text-muted-foreground">{{ $t('auth.login.subtitle') }}</p>

                <div class="mt-3 flex flex-col gap-8">
                    <Input v-model="form.email" name="email" type="email" :label="t('auth.login.email')" :error="form.errors.email" autocomplete="username" required />
                    <Input v-model="form.password" name="password" type="password" :label="t('auth.login.password')" :error="form.errors.password" autocomplete="password" required />

                    <a href="/forgot-password" class="text-xs text-muted-foreground underline-offset-4 hover:underline -mt-4 self-end">
                        {{ $t('auth.login.forgotPassword') }}
                    </a>

                    <div v-if="requiresTermsAcceptance" class="flex items-start gap-2.5">
                        <input id="acceptTerms" v-model="form.acceptTerms" type="checkbox" class="mt-0.5 size-4 shrink-0 rounded border-slate-300 accent-amber-600 cursor-pointer" />
                        <Label for="acceptTerms" class="text-sm font-normal leading-snug cursor-pointer">
                            {{ $t('auth.login.acceptTerms') }}
                            <a :href="urlFor('terms.show')" target="_blank" class="underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
                                {{ $t('auth.login.termsLink') }}
                            </a>
                        </Label>
                    </div>

                    <Button type="submit" :disabled="!canSubmit || form.processing">
                        {{ $t('auth.login.submit') }}
                    </Button>
                </div>

                <p class="text-sm text-center text-muted-foreground">
                    {{ $t('auth.login.noAccount') }}
                    <a href="/register" class="text-foreground underline-offset-4 hover:underline">
                        {{ $t('auth.login.register') }}
                    </a>
                </p>
            </div>
        </Form>
    </div>
</template>
