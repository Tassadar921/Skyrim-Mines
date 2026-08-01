<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
import { Form } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';

const { t } = useI18n();

const form = useForm({ email: '' });

const handleSubmit = () => form.post('/forgot-password');
</script>

<template>
    <Head :title="$t('auth.forgotPassword.title')">
        <meta name="robots" content="noindex" />
    </Head>
    <div class="min-h-screen flex items-center justify-center">
        <Form :is-loading="form.processing" class="relative flex items-center justify-center border rounded-lg px-15 py-8 m-auto" @submit="handleSubmit">
            <div class="flex flex-col gap-8">
                <div>
                    <h1 class="text-2xl font-semibold">{{ $t('auth.forgotPassword.title') }}</h1>
                    <p class="text-sm text-muted-foreground mt-1">{{ $t('auth.forgotPassword.subtitle') }}</p>
                </div>

                <div class="flex flex-col gap-6">
                    <Input v-model="form.email" name="email" type="email" :label="t('auth.forgotPassword.email')" :error="form.errors.email" autocomplete="email" required />

                    <Button type="submit" :disabled="form.processing">
                        {{ $t('auth.forgotPassword.submit') }}
                    </Button>
                </div>

                <p class="text-sm text-center text-muted-foreground">
                    <a href="/login" class="text-foreground underline-offset-4 hover:underline">
                        {{ $t('auth.forgotPassword.backToLogin') }}
                    </a>
                </p>
            </div>
        </Form>
    </div>
</template>
