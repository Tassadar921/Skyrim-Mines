<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
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
    organization: { id: string; name: string };
    members: Member[];
    eligibleUsers: EligibleUser[];
}>();

pageTitle.value = `${t('admin.organizations.show.title')} - ${props.organization.name}`;

const name = ref(props.organization.name);
const isSubmitting = ref(false);

function submit() {
    isSubmitting.value = true;
    router.put(
        urlFor('admin.organizations.update', { id: props.organization.id }),
        { name: name.value },
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
    </div>
</template>
