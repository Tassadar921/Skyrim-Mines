import type { Component } from 'vue';
import type { useI18n } from 'vue-i18n';
import type { urlFor } from '~/client';
import { BarChart2, Home, Users, Pickaxe, Package, Barrel, HandCoins, History, Building2, ShoppingCart, Truck, Landmark, Boxes, Receipt, Settings } from '@lucide/vue';

type RouteName = Parameters<typeof urlFor>[0];

export type MenuItem = {
    title: string;
    route: RouteName;
    icon: Component;
    exact?: boolean;
};

/** Sections hidden from the "foreman" role (contremaître): resources, materials, barrel breakdown, buybacks history, castellanies. Undefined means every role with admin access sees it. */
type MenuItemDef = MenuItem & { hiddenForRoles?: string[] };

const FOREMAN_RESTRICTED = ['foreman'];

export const getItems = (t: ReturnType<typeof useI18n>['t'], role: string | undefined): MenuItem[] => {
    const items: MenuItemDef[] = [
        { title: t('admin.layout.menu.dashboard'), route: 'admin.dashboard', icon: BarChart2, exact: true },
        { title: t('admin.layout.menu.users'), route: 'admin.users.index', icon: Users },
        { title: t('admin.layout.menu.organizations'), route: 'admin.organizations.index', icon: Building2 },
        { title: t('admin.layout.menu.resources'), route: 'admin.resources.index', icon: Pickaxe, hiddenForRoles: FOREMAN_RESTRICTED },
        { title: t('admin.layout.menu.materials'), route: 'admin.materials.index', icon: Package, hiddenForRoles: FOREMAN_RESTRICTED },
        { title: t('admin.layout.menu.stocks'), route: 'admin.stocks.index', icon: Boxes },
        { title: t('admin.layout.menu.barrel'), route: 'admin.barrel.index', icon: Barrel, hiddenForRoles: FOREMAN_RESTRICTED },
        { title: t('admin.layout.menu.barrelRentals'), route: 'admin.barrelRentals.index', icon: HandCoins },
        { title: t('admin.layout.menu.buybacks'), route: 'admin.buybacks.index', icon: History, hiddenForRoles: FOREMAN_RESTRICTED },
        { title: t('admin.layout.menu.expenses'), route: 'admin.expenses.index', icon: Receipt },
        { title: t('admin.layout.menu.commandes'), route: 'admin.commandes.index', icon: ShoppingCart },
        { title: t('admin.layout.menu.livraisons'), route: 'admin.livraisons.index', icon: Truck },
        { title: t('admin.layout.menu.castellanies'), route: 'admin.castellanies.index', icon: Landmark, hiddenForRoles: FOREMAN_RESTRICTED },
    ];

    return items.filter((item) => !item.hiddenForRoles || !role || !item.hiddenForRoles.includes(role));
};

export const getFooterItems = (t: ReturnType<typeof useI18n>['t'], role: string | undefined): MenuItem[] => {
    const items: MenuItemDef[] = [
        { title: t('admin.layout.menu.siteSettings'), route: 'admin.siteSettings.index', icon: Settings, hiddenForRoles: FOREMAN_RESTRICTED },
        { title: t('admin.layout.menu.home'), route: 'home', icon: Home },
    ];

    return items.filter((item) => !item.hiddenForRoles || !role || !item.hiddenForRoles.includes(role));
};
