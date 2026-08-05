<script setup lang="ts">
import { usePage, router } from '@inertiajs/vue3';
import { Link } from '@adonisjs/inertia/vue';
import { urlFor } from '~/client';
import Theme from '~/partials/layout/theme.vue';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import { UserCheck, FileText, ShoppingCart, LogOut } from '@lucide/vue';
import type { Data } from '@generated/data';

const page = usePage<Data.SharedProps>();

const logout = () => {
    router.delete(urlFor('auth.logout'));
};
</script>

<template>
    <div class="flex gap-3 items-center">
        <Theme />
        <DropdownMenu v-if="page.props.user">
            <DropdownMenuTrigger as-child>
                <button class="p-2" :aria-label="$t('layout.nav.account')"><UserCheck aria-hidden="true" /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-56" align="end">
                <DropdownMenuLabel class="font-normal">
                    <div class="font-medium">{{ page.props.user.username }}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="gap-2 cursor-pointer" as-child>
                    <Link :href="urlFor('devis.index')">
                        <FileText class="size-4" aria-hidden="true" />
                        {{ $t('devis.index.navLink') }}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem class="gap-2 cursor-pointer" as-child>
                    <Link :href="urlFor('commandes.index')">
                        <ShoppingCart class="size-4" aria-hidden="true" />
                        {{ $t('commande.index.navLink') }}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="gap-2 cursor-pointer" @click="logout">
                    <LogOut class="size-4" aria-hidden="true" />
                    {{ $t('admin.layout.logout') }}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        <slot v-if="!page.props.user" name="unauthenticated" />
    </div>
</template>
