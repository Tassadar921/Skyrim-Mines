<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { Head, usePage, router } from '@inertiajs/vue3';
import { toast, Toaster } from 'vue-sonner';
import type { Data } from '@generated/data';
import { Link } from '@adonisjs/inertia/vue';
import UserToolbar from '~/partials/layout/user-toolbar.vue';
import { useTheme } from '~/lib/use_theme';

const page = usePage<Data.SharedProps>();
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
    </Head>
    <div class="min-h-screen flex flex-col w-full">
        <nav :aria-label="$t('layout.nav.label')" class="fixed top-0 left-0 right-0 z-50 bg-linear-to-b to-transparent backdrop-blur-sm">
            <div class="flex items-center justify-between px-6 min-[1080px]:px-12 py-3">
                <Link route="home" :aria-label="$t('layout.nav.home')" class="shrink-0">
                    <img :src="'/logo.png'" alt="Compagnie Minière de la Crevasse" class="size-12" fetchpriority="high" />
                </Link>

                <ul class="flex items-center gap-7 list-none">
                    <li>
                        <Link
                            route="tarifs"
                            class="text-[11px] tracking-widest uppercase text-slate-500 dark:text-slate-400 hover:text-amber-700 hover:dark:text-amber-400 transition-colors duration-300"
                        >
                            {{ $t('layout.nav.tarifs') }}
                        </Link>
                    </li>
                    <li v-if="page.props.user?.role === 'admin' || page.props.user?.role === 'auditor' || page.props.user?.role === 'staff'">
                        <Link
                            route="stocks"
                            class="text-[11px] tracking-widest uppercase text-slate-500 dark:text-slate-400 hover:text-amber-700 hover:dark:text-amber-400 transition-colors duration-300"
                        >
                            {{ $t('layout.nav.stocks') }}
                        </Link>
                    </li>
                    <li>
                        <Link
                            route="devis.create"
                            class="text-[11px] tracking-widest uppercase text-slate-500 dark:text-slate-400 hover:text-amber-700 hover:dark:text-amber-400 transition-colors duration-300"
                        >
                            {{ $t('layout.nav.devis') }}
                        </Link>
                    </li>
                    <li>
                        <Link
                            route="commandes.create"
                            class="text-[11px] tracking-widest uppercase text-slate-500 dark:text-slate-400 hover:text-amber-700 hover:dark:text-amber-400 transition-colors duration-300"
                        >
                            {{ $t('layout.nav.commandes') }}
                        </Link>
                    </li>
                    <li>
                        <Link
                            route="organigramme"
                            class="text-[11px] tracking-widest uppercase text-slate-500 dark:text-slate-400 hover:text-amber-700 hover:dark:text-amber-400 transition-colors duration-300"
                        >
                            {{ $t('layout.nav.organigramme') }}
                        </Link>
                    </li>
                </ul>

                <UserToolbar />
            </div>
        </nav>
        <main class="text-slate-900 dark:text-slate-100 font-sans antialiased min-h-screen overflow-x-hidden">
            <slot />
        </main>
        <footer class="px-[8%] py-12 border-t border-amber-400/10 flex flex-col gap-5 items-center md:flex-row md:items-center md:justify-end">
            <ul class="flex flex-col gap-3 items-center list-none md:flex-row md:gap-7">
                <li v-if="page.props.user?.organizationRole === 'owner' || page.props.user?.organizationRole === 'admin'">
                    <Link
                        route="organization.show"
                        class="text-[11px] tracking-widest uppercase text-slate-500 dark:text-slate-400 hover:text-amber-700 hover:dark:text-amber-400 transition-colors duration-300"
                    >
                        {{ $t('organization.navLink') }}
                    </Link>
                </li>
                <li v-if="page.props.user?.role === 'admin' || page.props.user?.role === 'auditor'">
                    <Link
                        route="admin.dashboard"
                        class="text-[11px] tracking-widest uppercase text-slate-500 dark:text-slate-400 hover:text-amber-700 hover:dark:text-amber-400 transition-colors duration-300"
                    >
                        {{ $t('admin.title') }}
                    </Link>
                </li>
            </ul>
        </footer>
    </div>

    <Toaster position="top-center" rich-colors :theme="theme" />
</template>
