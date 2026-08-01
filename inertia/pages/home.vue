<script setup lang="ts">
import { Head, usePage } from '@inertiajs/vue3';
import { Link } from '@adonisjs/inertia/vue';
import { useI18n } from 'vue-i18n';
import { Button } from '~/components/ui/button';
import type { Data } from '@generated/data';

const page = usePage<Data.SharedProps>();
const { t } = useI18n();
</script>

<template>
    <Head :title="t('title')" />
    <div class="min-h-screen flex flex-col items-center justify-center text-center gap-6 px-6">
        <img :src="'/logo.svg'" alt="Consilium" class="size-20" />
        <h1 class="font-serif text-4xl font-light text-slate-800 dark:text-slate-100">{{ t('home.title') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md">{{ t('home.subtitle') }}</p>

        <div class="flex gap-3">
            <template v-if="page.props.user">
                <Button as-child>
                    <Link route="profile.show">{{ t('home.profile') }}</Link>
                </Button>
            </template>
            <template v-else>
                <Button as-child>
                    <Link route="login">{{ t('home.login') }}</Link>
                </Button>
                <Button as-child variant="outline">
                    <Link route="register">{{ t('home.register') }}</Link>
                </Button>
            </template>
        </div>
    </div>
</template>
