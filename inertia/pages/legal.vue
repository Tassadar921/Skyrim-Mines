<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{ editorName: string; contactEmail: string }>();
</script>

<template>
    <Head :title="t('legal.title')">
        <meta name="robots" content="noindex" />
    </Head>

    <div class="min-h-screen pt-32 pb-24 px-[8%]">
        <div class="max-w-2xl mx-auto space-y-10">
            <h1 class="font-serif text-3xl font-light text-slate-800 dark:text-slate-100">
                {{ t('legal.title') }}
            </h1>

            <section class="space-y-3">
                <h2 class="font-semibold text-slate-700 dark:text-slate-200">{{ t('legal.editor.title') }}</h2>
                <div class="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <p>{{ editorName }} — {{ t('legal.editor.label') }}</p>
                    <p>
                        {{ t('legal.editor.contact') }} :
                        <a :href="'mailto:' + props.contactEmail" class="underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-400 transition-colors">{{ props.contactEmail }}</a>
                    </p>
                </div>
            </section>

            <section class="space-y-3">
                <h2 class="font-semibold text-slate-700 dark:text-slate-200">{{ t('legal.hosting.title') }}</h2>
                <p class="text-sm text-slate-600 dark:text-slate-400">{{ t('legal.hosting.description') }}</p>
            </section>

            <section class="space-y-3">
                <h2 class="font-semibold text-slate-700 dark:text-slate-200">{{ t('legal.cookies.title') }}</h2>
                <p class="text-sm text-slate-600 dark:text-slate-400">{{ t('legal.cookies.intro') }}</p>
                <div class="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table class="w-full text-xs">
                        <thead class="bg-slate-50 dark:bg-slate-800 text-left">
                            <tr>
                                <th class="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{{ t('legal.cookies.table.name') }}</th>
                                <th class="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{{ t('legal.cookies.table.purpose') }}</th>
                                <th class="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{{ t('legal.cookies.table.duration') }}</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                            <tr>
                                <td class="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">adonis-session</td>
                                <td class="px-4 py-3 text-slate-600 dark:text-slate-400">{{ t('legal.cookies.session') }}</td>
                                <td class="px-4 py-3 text-slate-600 dark:text-slate-400">{{ t('legal.cookies.sessionDuration') }}</td>
                            </tr>
                            <tr>
                                <td class="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">XSRF-TOKEN</td>
                                <td class="px-4 py-3 text-slate-600 dark:text-slate-400">{{ t('legal.cookies.csrf') }}</td>
                                <td class="px-4 py-3 text-slate-600 dark:text-slate-400">{{ t('legal.cookies.sessionDuration') }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section class="space-y-3">
                <h2 class="font-semibold text-slate-700 dark:text-slate-200">{{ t('legal.data.title') }}</h2>
                <p class="text-sm text-slate-600 dark:text-slate-400">{{ t('legal.data.visitors') }}</p>
                <p class="text-sm text-slate-600 dark:text-slate-400">{{ t('legal.data.members') }}</p>
                <p class="text-sm text-slate-600 dark:text-slate-400">{{ t('legal.data.basis') }}</p>
                <p class="text-sm text-slate-600 dark:text-slate-400">{{ t('legal.data.retention') }}</p>
                <p class="text-sm text-slate-600 dark:text-slate-400">
                    {{ t('legal.data.rights') }}
                    <a :href="'mailto:' + props.contactEmail" class="underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-400 transition-colors">{{ props.contactEmail }}</a>
                    .
                </p>
                <p class="text-sm text-slate-500 dark:text-slate-500 italic">{{ t('legal.data.cnil') }}</p>
            </section>
        </div>
    </div>
</template>
