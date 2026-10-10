<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { computed, reactive, ref, watch } from 'vue';
import { router, useForm } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Checkbox } from '~/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import QuantityStepper from '~/partials/stocks/QuantityStepper.vue';
import DeleteButton from '~/components/ui/DeleteButton.vue';
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
} from '~/components/ui/alert-dialog';
import { Link } from '@adonisjs/inertia/vue';
import { ArrowLeft, UserCircle, HandCoins } from '@lucide/vue';
import { canHaveBalance } from '~/lib/user_balance';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin, isManager } = useAuth();

type BarrelEntry = { resourceId: string; resourceName: string; resourceType: string; quantity: number };

const props = defineProps<{
    targetUser: Data.User & { avatarUrl: string | null };
    barrelEntries: BarrelEntry[];
}>();

pageTitle.value = `${t('admin.users.show.title')} - ${props.targetUser.username}`;

const ALL_ROLES = ['admin', 'auditor', 'foreman', 'staff', 'former_staff', 'contractor', 'client'] as const;
const FOREMAN_ASSIGNABLE_ROLES = ['staff', 'former_staff', 'contractor', 'client'] as const;
// A foreman can only manage (edit/delete) accounts whose current role they're also allowed to assign —
// owner and foreman accounts stay reserved for owners.
const canManageTarget = computed(() => isAdmin.value || (isManager.value && (FOREMAN_ASSIGNABLE_ROLES as readonly string[]).includes(props.targetUser.role)));
// When the select is disabled (foreman viewing an account they can't manage), keep every role
// listed so the current value still renders correctly instead of showing blank.
const assignableRoles = computed(() => (isAdmin.value || !canManageTarget.value ? ALL_ROLES : FOREMAN_ASSIGNABLE_ROLES));

const username = ref(props.targetUser.username);
const role = ref(props.targetUser.role);
const enabled = ref(props.targetUser.enabled);
const isSubmitting = ref(false);

function submit() {
    isSubmitting.value = true;
    router.put(
        urlFor('admin.users.update', { id: props.targetUser.id }),
        { username: username.value, role: role.value, enabled: enabled.value },
        {
            onFinish: () => {
                isSubmitting.value = false;
            },
        },
    );
}

function destroyUser() {
    router.delete(urlFor('admin.users.destroy', { id: props.targetUser.id }));
}

const balance = ref(props.targetUser.balance);
const isSubmittingBalance = ref(false);

function submitBalance() {
    isSubmittingBalance.value = true;
    router.put(
        urlFor('admin.users.updateBalance', { id: props.targetUser.id }),
        { balance: balance.value },
        {
            preserveScroll: true,
            onFinish: () => {
                isSubmittingBalance.value = false;
            },
        },
    );
}

function payBalance() {
    isSubmittingBalance.value = true;
    router.put(
        urlFor('admin.users.updateBalance', { id: props.targetUser.id }),
        { balance: 0 },
        {
            preserveScroll: true,
            onSuccess: () => {
                balance.value = 0;
            },
            onFinish: () => {
                isSubmittingBalance.value = false;
            },
        },
    );
}

const avatarInputRef = ref<HTMLInputElement | null>(null);
const avatarForm = useForm<{ avatar: File | null }>({ avatar: null });

function onAvatarChange(event: Event) {
    const target = event.target as HTMLInputElement;
    avatarForm.avatar = target.files?.[0] ?? null;
    if (!avatarForm.avatar) return;

    avatarForm.post(urlFor('admin.users.updateAvatar', { id: props.targetUser.id }), {
        preserveScroll: true,
        onFinish: () => {
            avatarForm.reset();
            if (avatarInputRef.value) avatarInputRef.value.value = '';
        },
    });
}

const isRemovingAvatar = ref(false);

function removeAvatar() {
    isRemovingAvatar.value = true;
    router.delete(urlFor('admin.users.destroyAvatar', { id: props.targetUser.id }), { preserveScroll: true, onFinish: () => (isRemovingAvatar.value = false) });
}

function toBarrelQuantityMap(entries: BarrelEntry[]): Record<string, number> {
    return Object.fromEntries(entries.map((entry) => [entry.resourceId, entry.quantity]));
}

const barrelQuantities = reactive<Record<string, number>>(toBarrelQuantityMap(props.barrelEntries));

watch(
    () => props.barrelEntries,
    (entries) => {
        Object.assign(barrelQuantities, toBarrelQuantityMap(entries));
    },
);

const mineraiEntries = computed(() => props.barrelEntries.filter((entry) => entry.resourceType === 'minerai'));
const lingotEntries = computed(() => props.barrelEntries.filter((entry) => entry.resourceType === 'lingot'));

const barrelDebounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

function updateBarrelQuantity(entry: BarrelEntry, value: number) {
    const quantity = Math.max(0, Math.round(value));
    barrelQuantities[entry.resourceId] = quantity;

    if (barrelDebounceTimers[entry.resourceId]) clearTimeout(barrelDebounceTimers[entry.resourceId]);
    barrelDebounceTimers[entry.resourceId] = setTimeout(() => {
        router.patch(urlFor('admin.barrel.update'), { userId: props.targetUser.id, resourceId: entry.resourceId, quantity }, { preserveScroll: true, preserveState: true });
    }, 500);
}
</script>

<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <Button variant="outline" class="gap-2" as-child>
                <Link :href="urlFor('admin.users.index')">
                    <ArrowLeft class="size-4" />
                    {{ $t('admin.users.show.back') }}
                </Link>
            </Button>
            <div v-if="canManageTarget" class="flex items-center gap-4">
                <DeleteButton
                    :label="t('admin.users.show.delete')"
                    :title="t('admin.users.show.deleteConfirm.title')"
                    :description="t('admin.users.show.deleteConfirm.description', { username: props.targetUser.username })"
                    :cancel-label="t('admin.users.show.deleteConfirm.cancel')"
                    :confirm-label="t('admin.users.show.deleteConfirm.confirm')"
                    @confirm="destroyUser"
                />
                <Button :loading="isSubmitting" :disabled="isSubmitting" @click="submit">
                    {{ $t('admin.users.show.save') }}
                </Button>
            </div>
        </div>

        <div class="rounded-md border p-5">
            <Label>{{ t('admin.users.show.avatar.title') }}</Label>
            <div class="mt-2 flex items-center gap-4">
                <img v-if="targetUser.avatarUrl" :src="targetUser.avatarUrl" :alt="targetUser.username" class="size-16 rounded-full object-cover" />
                <div v-else class="flex size-16 items-center justify-center rounded-full bg-muted">
                    <UserCircle class="size-8 text-muted-foreground" />
                </div>
                <div v-if="canManageTarget" class="space-y-1">
                    <div class="flex gap-2">
                        <Button variant="outline" size="sm" type="button" :loading="avatarForm.processing" :disabled="avatarForm.processing" @click="avatarInputRef?.click()">
                            {{ t('admin.users.show.avatar.upload') }}
                        </Button>
                        <Button v-if="targetUser.avatarUrl" variant="ghost" size="sm" type="button" :loading="isRemovingAvatar" :disabled="isRemovingAvatar" @click="removeAvatar">
                            {{ t('admin.users.show.avatar.remove') }}
                        </Button>
                    </div>
                    <p class="text-xs text-muted-foreground">{{ t('admin.users.show.avatar.hint') }}</p>
                    <p v-if="avatarForm.errors.avatar" class="text-xs text-destructive">{{ avatarForm.errors.avatar }}</p>
                    <input ref="avatarInputRef" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" class="hidden" @change="onAvatarChange" />
                </div>
            </div>
        </div>

        <div class="rounded-md border p-5 space-y-4">
            <div class="space-y-1">
                <Label for="username">{{ $t('admin.users.show.fields.username') }}</Label>
                <Input id="username" v-model="username" type="text" maxlength="50" :readonly="!canManageTarget" />
                <p class="text-xs text-muted-foreground text-right">{{ username.length }}/50</p>
            </div>

            <div class="space-y-1">
                <Label>{{ $t('admin.users.show.fields.role') }}</Label>
                <Select v-model="role" :disabled="!canManageTarget">
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="roleOption in assignableRoles" :key="roleOption" :value="roleOption">{{ $t(`admin.users.show.fields.roles.${roleOption}`) }}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div class="flex items-center gap-2">
                <Checkbox id="enabled" :disabled="!canManageTarget" :model-value="enabled" @update:model-value="(v) => (enabled = !!v)" />
                <Label for="enabled" class="cursor-pointer">{{ $t('admin.users.show.fields.enabled') }}</Label>
            </div>
        </div>

        <div v-if="canHaveBalance(targetUser.role)" class="rounded-md border p-5 space-y-1">
            <Label for="balance">{{ $t('admin.users.show.fields.balance') }}</Label>
            <div class="flex items-center gap-2">
                <div class="w-40">
                    <Input id="balance" v-model.number="balance" type="number" step="0.01" min="0" :readonly="!canManageTarget" />
                </div>
                <Button v-if="canManageTarget" size="sm" :loading="isSubmittingBalance" :disabled="isSubmittingBalance" @click="submitBalance">
                    {{ $t('admin.users.show.balance.save') }}
                </Button>
                <AlertDialog v-if="canManageTarget">
                    <AlertDialogTrigger as-child>
                        <Button variant="outline" size="sm" class="gap-1" :disabled="isSubmittingBalance || balance <= 0">
                            <HandCoins class="size-4" />
                            {{ t('admin.users.show.balance.pay') }}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{{ t('admin.users.show.balance.payConfirm.title') }}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {{ t('admin.users.show.balance.payConfirm.description', { username: props.targetUser.username, amount: balance.toFixed(2) }) }}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{{ t('admin.users.show.balance.payConfirm.cancel') }}</AlertDialogCancel>
                            <AlertDialogAction @click="payBalance">{{ t('admin.users.show.balance.payConfirm.confirm') }}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>

        <div class="rounded-md border p-5 space-y-4">
            <Label>{{ t('admin.barrel.title') }}</Label>

            <div class="space-y-2">
                <h3 class="text-sm font-medium text-muted-foreground">{{ t('admin.resources.types.minerai') }}</h3>
                <div class="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{{ t('admin.barrel.table.resource') }}</TableHead>
                                <TableHead>{{ t('admin.barrel.table.quantity') }}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <template v-if="mineraiEntries.length">
                                <TableRow v-for="entry in mineraiEntries" :key="entry.resourceId">
                                    <TableCell class="text-sm font-medium">{{ entry.resourceName }}</TableCell>
                                    <TableCell>
                                        <QuantityStepper v-if="isAdmin" :model-value="barrelQuantities[entry.resourceId] ?? 0" @update:model-value="(value) => updateBarrelQuantity(entry, value)" />
                                        <span v-else class="text-sm">{{ barrelQuantities[entry.resourceId] ?? 0 }}</span>
                                    </TableCell>
                                </TableRow>
                            </template>
                            <TableRow v-else>
                                <TableCell :colspan="2" class="h-24 text-center text-muted-foreground">
                                    {{ t('admin.barrel.table.empty') }}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div class="space-y-2">
                <h3 class="text-sm font-medium text-muted-foreground">{{ t('admin.resources.types.lingot') }}</h3>
                <div class="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{{ t('admin.barrel.table.resource') }}</TableHead>
                                <TableHead>{{ t('admin.barrel.table.quantity') }}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <template v-if="lingotEntries.length">
                                <TableRow v-for="entry in lingotEntries" :key="entry.resourceId">
                                    <TableCell class="text-sm font-medium">{{ entry.resourceName }}</TableCell>
                                    <TableCell>
                                        <QuantityStepper v-if="isAdmin" :model-value="barrelQuantities[entry.resourceId] ?? 0" @update:model-value="(value) => updateBarrelQuantity(entry, value)" />
                                        <span v-else class="text-sm">{{ barrelQuantities[entry.resourceId] ?? 0 }}</span>
                                    </TableCell>
                                </TableRow>
                            </template>
                            <TableRow v-else>
                                <TableCell :colspan="2" class="h-24 text-center text-muted-foreground">
                                    {{ t('admin.barrel.table.empty') }}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>

        <div class="text-xs text-muted-foreground space-y-0.5 px-1">
            <div>
                {{ $t('admin.users.show.fields.id') }} :
                <span class="font-mono">{{ targetUser.id }}</span>
            </div>
            <div>{{ $t('admin.users.show.fields.createdAt') }} : {{ new Date(targetUser.createdAt).toLocaleString(undefined, { timeZone: 'UTC' }) }}</div>
            <div v-if="targetUser.updatedAt">{{ $t('admin.users.show.fields.updatedAt') }} : {{ new Date(targetUser.updatedAt).toLocaleString(undefined, { timeZone: 'UTC' }) }}</div>
            <div v-if="isAdmin">
                {{ $t('admin.users.show.fields.lastActivity') }} :
                {{ targetUser.lastActivity ? new Date(targetUser.lastActivity).toLocaleString(undefined, { timeZone: 'UTC' }) : $t('admin.users.table.never') }}
            </div>
        </div>
    </div>
</template>
