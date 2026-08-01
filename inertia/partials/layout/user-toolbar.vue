<script setup lang="ts">
import { usePage, router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import Theme from '~/partials/layout/theme.vue';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import { UserCheck, LogOut, UserCog } from '@lucide/vue';
import { Link } from '@adonisjs/inertia/vue';
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
                    <div class="text-xs text-muted-foreground">{{ page.props.user.email }}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem as-child class="cursor-pointer">
                        <Link :route="'profile.show'" class="gap-2">
                            <UserCog class="size-4" aria-hidden="true" />
                            {{ $t('profile.dropdown') }}
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
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
