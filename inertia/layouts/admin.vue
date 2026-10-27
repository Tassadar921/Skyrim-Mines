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
import { getItems, getFooterItems, type MenuItem } from '~/lib/admin_menu';
import { urlFor } from '~/client';
import { useI18n } from 'vue-i18n';
import { useTheme } from '~/lib/use_theme';

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
const items = getItems(t, page.props.user?.role);
const footerItems = getFooterItems(t, page.props.user?.role);

watch(
    () => page.props.flash,
    (flash) => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    },
    { immediate: true, deep: true },
);
</script>

<template>
    <Head :title="pageTitle || t('admin.title')" />
    <main>
        <div class="font-sans antialiased overflow-x-hidden">
            <SidebarProvider>
                <Sidebar>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>{{ page.props.user?.username }}</SidebarGroupLabel>
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
                <div class="min-h-screen flex flex-col w-full min-w-0">
                    <nav class="flex items-center justify-between gap-2 border-b w-full h-16 sm:h-20 py-3 sm:py-5">
                        <div class="flex items-center shrink-0 px-2 sm:px-5">
                            <SidebarTrigger :size="32" class="p-4" />
                        </div>

                        <h1 class="min-w-0 truncate text-center text-base sm:text-xl text-amber-700 dark:text-amber-400">
                            <span v-if="pageTitle" class="hidden sm:inline">{{ $t('admin.title') }} -</span>
                            {{ pageTitle || $t('admin.title') }}
                        </h1>

                        <div class="shrink-0 px-2 sm:px-5">
                            <UserToolbar />
                        </div>
                    </nav>
                    <div class="py-4 px-3 sm:py-6 sm:px-4">
                        <slot />
                    </div>
                </div>
            </SidebarProvider>
        </div>
    </main>

    <Toaster position="top-center" rich-colors :theme="theme" />
</template>
