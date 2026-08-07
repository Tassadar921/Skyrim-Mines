import type { Component } from 'vue';
import type { useI18n } from 'vue-i18n';
import type { urlFor } from '~/client';
import { BarChart2, Home, Users, Pickaxe, Package, History, Building2, FileText, ShoppingCart, Truck, BadgeCheck, Landmark } from '@lucide/vue';

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
    { title: t('admin.layout.menu.organizations'), route: 'admin.organizations.index', icon: Building2 },
    { title: t('admin.layout.menu.licenses'), route: 'admin.licenses.index', icon: BadgeCheck },
    { title: t('admin.layout.menu.resources'), route: 'admin.resources.index', icon: Pickaxe },
    { title: t('admin.layout.menu.materials'), route: 'admin.materials.index', icon: Package },
    { title: t('admin.layout.menu.buybacks'), route: 'admin.buybacks.index', icon: History },
    { title: t('admin.layout.menu.devis'), route: 'admin.devis.index', icon: FileText },
    { title: t('admin.layout.menu.commandes'), route: 'admin.commandes.index', icon: ShoppingCart },
    { title: t('admin.layout.menu.livraisons'), route: 'admin.livraisons.index', icon: Truck },
    { title: t('admin.layout.menu.castellanies'), route: 'admin.castellanies.index', icon: Landmark },
];

export const getFooterItems = (t: ReturnType<typeof useI18n>['t']): MenuItem[] => [{ title: t('admin.layout.menu.home'), route: 'home', icon: Home }];
