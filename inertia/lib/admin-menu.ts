import type { Component } from 'vue';
import type { useI18n } from 'vue-i18n';
import type { urlFor } from '~/client';
import { BarChart2, Home, Users } from '@lucide/vue';

type RouteName = Parameters<typeof urlFor>[0];

export type MenuItem = {
    title: string;
    route: RouteName;
    icon: Component;
    exact?: boolean;
};

export const getItems = (t: ReturnType<typeof useI18n>['t']): MenuItem[] => [
    { title: t('admin.layout.menu.dashboard'), route: 'admin.dashboard', icon: BarChart2, exact: true },
    { title: t('admin.layout.menu.users'), route: 'admin.users.index', icon: Users },
];

export const getFooterItems = (t: ReturnType<typeof useI18n>['t']): MenuItem[] => [{ title: t('admin.layout.menu.home'), route: 'home', icon: Home }];
