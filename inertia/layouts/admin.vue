<script setup lang="ts">
import { watch } from 'vue';
import { Head, usePage } from '@inertiajs/vue3';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { Link } from '@adonisjs/inertia/vue';
import { Toaster, toast } from 'vue-sonner';
import type { Data } from '@generated/data';
import UserToolbar from '~/partials/layout/user-toolbar.vue';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '~/components/ui/sidebar';
import { getItems, getFooterItems, type MenuItem } from '~/lib/admin-menu';
import { urlFor } from '~/client';
import { useI18n } from 'vue-i18n';
import { useTheme } from '~/lib/useTheme';

const isActive = (item: MenuItem) => {
    const target = urlFor(item.route);
    const currentPath = page.url.split('?')[0];
    if (item.exact) return currentPath === target;
    return currentPath === target || currentPath.startsWith(target + '/');
};

const page = usePage<Data.SharedProps>();
const { pageTitle } = useAdminLayout();
const { t } = useI18n();
const { theme } = useTheme();
const items = getItems(t);
const footerItems = getFooterItems(t);

watch(
    () => page.props.flash,
    (flash) => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    },
    { immediate: true, deep: true }
);
</script>

<template>
    <Head :title="pageTitle || t('admin.title')">
        <meta name="robots" content="noindex, nofollow" />
    </Head>
    <main>
        <div class="font-sans antialiased overflow-x-hidden">
            <SidebarProvider>
                <Sidebar>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>{{ page.props.user?.email }}</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem v-for="item in items" :key="item.route">
                                        <SidebarMenuButton as-child :is-active="isActive(item)" :class="{ 'pointer-events-none': isActive(item) }">
                                            <Link :route="item.route">
                                                <component :is="item.icon" />
                                                <span>{{ item.title }}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                    <SidebarFooter>
                        <SidebarMenu>
                            <SidebarMenuItem v-for="item in footerItems" :key="item.route">
                                <SidebarMenuButton as-child>
                                    <Link :route="item.route">
                                        <component :is="item.icon" />
                                        <span>{{ item.title }}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>
                <div class="min-h-screen flex flex-col w-full">
                    <nav class="flex items-center justify-between border-b w-full h-20 py-5">
                        <div class="flex items-center px-5">
                            <SidebarTrigger :size="32" class="p-4" />
                            <Link route="home">
                                <img :src="'/logo.svg'" alt="Logo" class="size-12" />
                            </Link>
                        </div>

                        <h1 class="text-xl text-amber-700 dark:text-amber-400">{{ $t('admin.title') }} {{ pageTitle ? `- ${pageTitle}` : '' }}</h1>

                        <div class="px-5">
                            <UserToolbar />
                        </div>
                    </nav>
                    <div class="py-6 px-4">
                        <slot />
                    </div>
                </div>
            </SidebarProvider>
        </div>
    </main>

    <Toaster position="top-center" rich-colors :theme="theme" />
</template>
