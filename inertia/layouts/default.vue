<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { Head, usePage, router } from '@inertiajs/vue3';
import { toast, Toaster } from 'vue-sonner';
import type { Data } from '@generated/data';
import { Link } from '@adonisjs/inertia/vue';
import { useI18n } from 'vue-i18n';
import UserToolbar from '~/partials/layout/user-toolbar.vue';
import { LogIn, ShieldAlert } from '@lucide/vue';
import { urlFor } from '~/client';
import { useTheme } from '~/lib/useTheme';

const page = usePage<Data.SharedProps>();
const { t } = useI18n();
const { theme } = useTheme();

onMounted(() => {
    if (page.props.flash.error) toast.error(page.props.flash.error);
    if (page.props.flash.success) toast.success(page.props.flash.success);
});

let lastUrl = page.url;
const removeSuccessListener = router.on('success', (event) => {
    const flash = (event.detail.page.props as { flash?: { success?: string; error?: string } }).flash;
    if (page.url !== lastUrl) toast.dismiss();
    lastUrl = page.url;
    if (flash?.error) toast.error(flash.error);
    if (flash?.success) toast.success(flash.success);
});
onUnmounted(removeSuccessListener);
</script>

<template>
    <Head>
        <link rel="icon" type="image/svg+xml" href="/icons/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/icons/favicon.ico" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icons/favicon-96x96.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/icons/site.webmanifest" />
        <meta name="theme-color" content="#d97706" />
    </Head>
    <div class="min-h-screen flex flex-col w-full">
        <nav :aria-label="$t('layout.nav.label')" class="fixed top-0 left-0 right-0 z-50 bg-linear-to-b to-transparent backdrop-blur-sm">
            <div class="flex items-center justify-between px-6 min-[1080px]:px-12 py-3">
                <Link route="home" :aria-label="$t('layout.nav.home')" class="shrink-0">
                    <img :src="'/logo.svg'" alt="Consilium" class="size-12" fetchpriority="high" />
                </Link>

                <UserToolbar>
                    <template #unauthenticated>
                        <Link
                            route="login"
                            :aria-label="$t('layout.nav.login')"
                            class="text-[11px] tracking-widest uppercase text-slate-500 dark:text-slate-400 hover:text-amber-700 hover:dark:text-amber-400 transition-colors duration-300"
                        >
                            <LogIn aria-hidden="true" />
                        </Link>
                    </template>
                </UserToolbar>
            </div>
            <Link
                v-if="page.props.termsOutdated && !page.props.termsDeactivated && page.props.user"
                :href="urlFor('terms.show')"
                class="flex items-center justify-center gap-2 w-full bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 transition-colors px-4 py-2.5 text-amber-900 dark:text-amber-200 text-xs font-medium"
            >
                <ShieldAlert class="size-3.5 shrink-0" aria-hidden="true" />
                {{ $t('terms.outdatedBanner') }}
            </Link>
        </nav>
        <main class="text-slate-900 dark:text-slate-100 font-sans antialiased min-h-screen overflow-x-hidden">
            <slot />
        </main>
        <footer class="px-[8%] py-12 border-t border-amber-400/10 flex flex-col gap-5 items-center md:flex-row md:items-center md:justify-between">
            <p class="font-serif text-base font-semibold tracking-widest uppercase text-amber-700 dark:text-amber-400">
                {{ $t('layout.footer.rm-language') }}
            </p>
            <ul class="flex flex-col gap-3 items-center list-none md:flex-row md:gap-7">
                <li v-if="page.props.user?.role === 'admin'">
                    <Link
                        route="admin.dashboard"
                        class="text-[11px] tracking-widest uppercase text-slate-500 dark:text-slate-400 hover:text-amber-700 hover:dark:text-amber-400 transition-colors duration-300"
                    >
                        {{ $t('admin.title') }}
                    </Link>
                </li>
                <li>
                    <Link
                        :href="urlFor('legal.show')"
                        class="text-[11px] tracking-widest uppercase text-slate-500 dark:text-slate-400 hover:text-amber-700 hover:dark:text-amber-400 transition-colors duration-300"
                    >
                        {{ t('layout.footer.legal') }}
                    </Link>
                </li>
                <li>
                    <Link
                        :href="urlFor('terms.show')"
                        class="text-[11px] tracking-widest uppercase text-slate-500 dark:text-slate-400 hover:text-amber-700 hover:dark:text-amber-400 transition-colors duration-300"
                    >
                        {{ t('layout.footer.terms') }}
                    </Link>
                </li>
            </ul>
        </footer>
    </div>

    <Toaster position="top-center" rich-colors :theme="theme" />
</template>
