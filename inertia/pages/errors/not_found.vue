<script setup lang="ts">
import { Link } from '@adonisjs/inertia/vue';
import { Head } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
    <Head title="404" />
    <div class="min-h-screen flex flex-col items-center justify-center gap-6 text-center">
        <p class="text-[11px] tracking-widest uppercase text-slate-500 dark:text-slate-400">404</p>
        <h1 class="font-serif text-4xl font-semibold text-slate-900 dark:text-slate-100">{{ t('errors.notFound.title') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 max-w-sm">{{ t('errors.notFound.description') }}</p>
        <Link route="home" class="text-[11px] tracking-widest uppercase text-amber-700 dark:text-amber-400 hover:underline underline-offset-4 transition-colors">
            {{ t('errors.notFound.back') }}
        </Link>
    </div>
</template>
