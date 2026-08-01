<script setup lang="ts">
import { Head, usePage, router } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue-sonner';
import { urlFor } from '~/client';
import { Button } from '~/components/ui/button';
import { ShieldCheck, ShieldAlert } from '@lucide/vue';
import type { Data } from '@generated/data';

const { t } = useI18n();
const page = usePage<Data.SharedProps>();

const props = defineProps<{ contactEmail: string }>();

function accept() {
    router.post(
        urlFor('terms.accept'),
        {},
        {
            preserveScroll: true,
            onSuccess: () => {
                page.props.termsOutdated = false;
                page.props.termsDeactivated = false;
                toast.success(t('terms.acceptSuccess'));
            },
        }
    );
}
</script>

<template>
    <Head :title="t('terms.title')">
        <meta name="robots" content="noindex" />
    </Head>

    <div class="min-h-screen pt-32 pb-24 px-[8%]">
        <div class="max-w-2xl mx-auto space-y-10">
            <div v-if="page.props.termsOutdated && page.props.user" class="rounded-lg border border-amber-400/40 bg-amber-50 dark:bg-amber-950/30 px-5 py-5 flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                    <ShieldAlert class="size-5 text-amber-700 dark:text-amber-400 shrink-0" />
                    <p class="text-sm text-amber-800 dark:text-amber-300">
                        {{ page.props.termsDeactivated ? t('terms.deactivatedBanner') : t('terms.outdatedBanner') }}
                    </p>
                </div>
                <Button class="gap-2 shrink-0" @click="accept">
                    <ShieldCheck class="size-4" />
                    {{ t('terms.reaccept') }}
                </Button>
            </div>

            <div class="space-y-1">
                <h1 class="font-serif text-3xl font-light text-slate-800 dark:text-slate-100">
                    {{ t('terms.title') }}
                </h1>
                <p class="text-xs text-slate-400 dark:text-slate-500">{{ t('terms.lastUpdated') }}</p>
            </div>

            <section v-for="section in ['object', 'access', 'subscriptions', 'data', 'account', 'responsibility', 'changes', 'law']" :key="section" class="space-y-2">
                <h2 class="font-semibold text-slate-700 dark:text-slate-200">{{ t(`terms.${section}.title`) }}</h2>
                <p class="text-sm text-slate-600 dark:text-slate-400">{{ t(`terms.${section}.content`) }}</p>
            </section>

            <p class="text-sm text-slate-500 dark:text-slate-500">
                {{ t('legal.data.rights') }}
                <a :href="'mailto:' + props.contactEmail" class="underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-400 transition-colors">{{ props.contactEmail }}</a>
                .
            </p>
        </div>
    </div>
</template>
