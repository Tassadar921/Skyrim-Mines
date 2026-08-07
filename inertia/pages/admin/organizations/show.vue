<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { computed, reactive, ref } from 'vue';
import { router, useForm } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Badge } from '~/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import DeleteButton from '~/components/ui/DeleteButton.vue';
import { Link } from '@adonisjs/inertia/vue';
import { ArrowLeft, Plus } from '@lucide/vue';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();

type Member = Data.User;
type EligibleUser = { id: string; username: string };

const props = defineProps<{
    organization: { id: string; name: string; castellanyId: string | null };
    members: Member[];
    eligibleUsers: EligibleUser[];
    resources: Data.Resource[];
    customSellPrices: Record<string, number>;
    castellanies: { id: string; name: string }[];
}>();

pageTitle.value = `${t('admin.organizations.show.title')} - ${props.organization.name}`;

const NO_CASTELLANY = 'none';

const name = ref(props.organization.name);
const castellanyId = ref(props.organization.castellanyId ?? NO_CASTELLANY);
const isSubmitting = ref(false);

function submit() {
    isSubmitting.value = true;
    router.put(
        urlFor('admin.organizations.update', { id: props.organization.id }),
        { name: name.value, castellanyId: castellanyId.value === NO_CASTELLANY ? undefined : castellanyId.value },
        {
            onFinish: () => {
                isSubmitting.value = false;
            },
        },
    );
}

function destroyOrganization() {
    router.delete(urlFor('admin.organizations.destroy', { id: props.organization.id }));
}

const open = ref(false);

const memberForm = useForm({
    mode: 'new',
    userId: '',
    discordId: '',
    username: '',
    role: 'staff',
});

function submitAddMember() {
    memberForm
        .transform((data) =>
            data.mode === 'existing' ? { mode: data.mode, userId: data.userId, role: data.role } : { mode: data.mode, discordId: data.discordId, username: data.username, role: data.role },
        )
        .post(urlFor('admin.organizations.members.store', { id: props.organization.id }), {
            preserveScroll: true,
            onSuccess: () => {
                memberForm.reset();
                open.value = false;
            },
        });
}

function removeMember(memberId: string) {
    router.delete(urlFor('admin.organizations.members.destroy', { id: props.organization.id, memberId }), { preserveScroll: true });
}

function changeMemberRole(memberId: string, role: string) {
    router.patch(urlFor('admin.organizations.members.updateRole', { id: props.organization.id, memberId }), { role }, { preserveScroll: true });
}

const minerais = computed(() => props.resources.filter((resource) => resource.type === 'minerai'));
const lingots = computed(() => props.resources.filter((resource) => resource.type === 'lingot'));

function buildCustomPriceInputs(resources: Data.Resource[]): Record<string, string> {
    return Object.fromEntries(resources.map((resource) => [resource.id, props.customSellPrices[resource.id] !== undefined ? String(props.customSellPrices[resource.id]) : '']));
}

const customPriceInputs = reactive<Record<string, string>>(buildCustomPriceInputs(props.resources));

function hasCustomPrice(resourceId: string): boolean {
    return props.customSellPrices[resourceId] !== undefined;
}

function saveResourcePrice(resourceId: string) {
    const value = customPriceInputs[resourceId];
    if (value === '' || value === null || Number.isNaN(Number(value))) return;

    router.put(urlFor('admin.organizations.resourcePrices.update', { id: props.organization.id, resourceId }), { sellPrice: Number(value) }, { preserveScroll: true });
}

function resetResourcePrice(resourceId: string) {
    router.delete(urlFor('admin.organizations.resourcePrices.destroy', { id: props.organization.id, resourceId }), {
        preserveScroll: true,
        onSuccess: () => {
            customPriceInputs[resourceId] = '';
        },
    });
}
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <Button variant="outline" class="gap-2" as-child>
                <Link :href="urlFor('admin.organizations.index')">
                    <ArrowLeft class="size-4" />
                    {{ t('admin.organizations.show.back') }}
                </Link>
            </Button>
            <div v-if="isAdmin" class="flex items-center gap-2">
                <Button :loading="isSubmitting" :disabled="isSubmitting" @click="submit">
                    {{ t('admin.organizations.show.save') }}
                </Button>
                <DeleteButton
                    :label="t('admin.organizations.show.delete')"
                    :title="t('admin.organizations.show.deleteConfirm.title')"
                    :description="t('admin.organizations.show.deleteConfirm.description', { name: props.organization.name })"
                    :cancel-label="t('admin.organizations.show.deleteConfirm.cancel')"
                    :confirm-label="t('admin.organizations.show.deleteConfirm.confirm')"
                    @confirm="destroyOrganization"
                />
            </div>
        </div>

        <div class="rounded-md border p-5 space-y-4 max-w-lg">
            <Input v-model="name" :label="t('admin.organizations.create.fields.name')" maxlength="100" required :readonly="!isAdmin" />

            <div class="space-y-1">
                <Label>{{ t('admin.organizations.create.fields.castellany') }}</Label>
                <Select v-model="castellanyId" :disabled="!isAdmin">
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem :value="NO_CASTELLANY">{{ t('admin.organizations.create.fields.castellanyNone') }}</SelectItem>
                        <SelectItem v-for="castellany in props.castellanies" :key="castellany.id" :value="castellany.id">{{ castellany.name }}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div class="space-y-3">
            <div class="flex items-center justify-between">
                <Badge variant="outline">{{ props.members.length }} {{ t('organization.members.count', props.members.length) }}</Badge>

                <Dialog v-if="isAdmin" v-model:open="open">
                    <DialogTrigger as-child>
                        <Button size="sm" class="gap-2">
                            <Plus class="size-4" />
                            {{ t('organization.members.add') }}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{{ t('organization.members.add') }}</DialogTitle>
                        </DialogHeader>

                        <div class="space-y-4">
                            <div class="space-y-1">
                                <Label>{{ t('organization.members.mode') }}</Label>
                                <Select v-model="memberForm.mode">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">{{ t('organization.members.modeNew') }}</SelectItem>
                                        <SelectItem value="existing">{{ t('organization.members.modeExisting') }}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div v-if="memberForm.mode === 'existing'" class="space-y-1">
                                <Label>{{ t('organization.members.existingUser') }}</Label>
                                <Select v-model="memberForm.userId">
                                    <SelectTrigger>
                                        <SelectValue :placeholder="t('organization.members.existingUserPlaceholder')" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem v-for="eligibleUser in props.eligibleUsers" :key="eligibleUser.id" :value="eligibleUser.id">
                                            {{ eligibleUser.username }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p v-if="memberForm.errors.userId" class="text-sm text-destructive">{{ memberForm.errors.userId }}</p>
                            </div>

                            <template v-else>
                                <Input v-model="memberForm.discordId" :label="t('admin.users.create.fields.discordId')" :error="memberForm.errors.discordId" maxlength="32" required />
                                <Input v-model="memberForm.username" :label="t('admin.users.create.fields.username')" :error="memberForm.errors.username" maxlength="50" required />
                            </template>

                            <div class="space-y-1">
                                <Label>{{ t('admin.users.create.fields.organizationRole') }}</Label>
                                <Select v-model="memberForm.role">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="staff">{{ t('organization.roles.staff') }}</SelectItem>
                                        <SelectItem value="admin">{{ t('organization.roles.admin') }}</SelectItem>
                                        <SelectItem value="owner">{{ t('organization.roles.owner') }}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p v-if="memberForm.errors.role" class="text-sm text-destructive">{{ memberForm.errors.role }}</p>
                            </div>

                            <Button class="w-full" :loading="memberForm.processing" :disabled="memberForm.processing" @click="submitAddMember">
                                {{ t('organization.members.submit') }}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div class="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{{ t('organization.members.table.username') }}</TableHead>
                            <TableHead>{{ t('organization.members.table.role') }}</TableHead>
                            <TableHead>{{ t('organization.members.table.actions') }}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <template v-if="props.members.length">
                            <TableRow v-for="member in props.members" :key="member.id">
                                <TableCell class="text-sm font-medium">{{ member.username }}</TableCell>
                                <TableCell>
                                    <Select v-if="isAdmin" :model-value="member.organizationRole ?? undefined" @update:model-value="(value) => changeMemberRole(member.id, String(value))">
                                        <SelectTrigger class="w-36">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="staff">{{ t('organization.roles.staff') }}</SelectItem>
                                            <SelectItem value="admin">{{ t('organization.roles.admin') }}</SelectItem>
                                            <SelectItem value="owner">{{ t('organization.roles.owner') }}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Badge v-else variant="secondary">{{ t(`organization.roles.${member.organizationRole}`) }}</Badge>
                                </TableCell>
                                <TableCell>
                                    <DeleteButton
                                        v-if="isAdmin"
                                        :label="t('organization.members.remove')"
                                        :title="t('organization.members.removeConfirm.title')"
                                        :description="t('organization.members.removeConfirm.description', { username: member.username })"
                                        :cancel-label="t('organization.members.removeConfirm.cancel')"
                                        :confirm-label="t('organization.members.removeConfirm.confirm')"
                                        @confirm="removeMember(member.id)"
                                    />
                                </TableCell>
                            </TableRow>
                        </template>
                        <TableRow v-else>
                            <TableCell :colspan="3" class="h-24 text-center text-muted-foreground">
                                {{ t('organization.members.empty') }}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>

        <div class="space-y-3">
            <div class="space-y-1">
                <h2 class="text-lg font-medium">{{ t('admin.organizations.resourcePrices.title') }}</h2>
                <p class="text-sm text-muted-foreground">{{ t('admin.organizations.resourcePrices.description') }}</p>
            </div>

            <div
                v-for="group in [
                    { label: t('admin.resources.types.minerai'), items: minerais },
                    { label: t('admin.resources.types.lingot'), items: lingots },
                ]"
                :key="group.label"
                class="space-y-2"
            >
                <h3 class="text-sm font-medium text-muted-foreground">{{ group.label }}</h3>
                <div class="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{{ t('admin.organizations.resourcePrices.table.resource') }}</TableHead>
                                <TableHead>{{ t('admin.organizations.resourcePrices.table.standardPrice') }}</TableHead>
                                <TableHead>{{ t('admin.organizations.resourcePrices.table.customPrice') }}</TableHead>
                                <TableHead>{{ t('admin.organizations.resourcePrices.table.actions') }}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <template v-if="group.items.length">
                                <TableRow v-for="resource in group.items" :key="resource.id">
                                    <TableCell class="text-sm font-medium">{{ resource.name }}</TableCell>
                                    <TableCell class="text-sm text-muted-foreground">{{ resource.sellPrice.toFixed(2) }} s</TableCell>
                                    <TableCell>
                                        <Input v-model="customPriceInputs[resource.id]" type="number" min="0" step="0.01" class="w-28" :readonly="!isAdmin" />
                                    </TableCell>
                                    <TableCell>
                                        <div v-if="isAdmin" class="flex items-center gap-2">
                                            <Button size="sm" variant="outline" @click="saveResourcePrice(resource.id)">
                                                {{ t('admin.organizations.resourcePrices.save') }}
                                            </Button>
                                            <DeleteButton
                                                v-if="hasCustomPrice(resource.id)"
                                                :label="t('admin.organizations.resourcePrices.reset')"
                                                :title="t('admin.organizations.resourcePrices.resetConfirm.title')"
                                                :description="t('admin.organizations.resourcePrices.resetConfirm.description', { name: resource.name })"
                                                :cancel-label="t('admin.organizations.resourcePrices.resetConfirm.cancel')"
                                                :confirm-label="t('admin.organizations.resourcePrices.resetConfirm.confirm')"
                                                @confirm="resetResourcePrice(resource.id)"
                                            />
                                        </div>
                                        <Badge v-else-if="hasCustomPrice(resource.id)" variant="secondary">{{ t('admin.organizations.resourcePrices.customApplied') }}</Badge>
                                    </TableCell>
                                </TableRow>
                            </template>
                            <TableRow v-else>
                                <TableCell :colspan="4" class="h-24 text-center text-muted-foreground">
                                    {{ t('admin.organizations.resourcePrices.empty') }}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    </div>
</template>
