<script setup lang="ts">
import { computed, ref } from 'vue';
import { Head, router, useForm, usePage } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Badge } from '~/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import DeleteButton from '~/components/ui/DeleteButton.vue';
import { Plus, ArrowUpCircle, ArrowDownCircle } from '@lucide/vue';
import type { Data } from '@generated/data';

type Member = Data.User;
type EligibleUser = { id: string; username: string };

const { t } = useI18n();
const page = usePage<Data.SharedProps>();

const props = defineProps<{
    organization: { id: string; name: string };
    members: Member[];
    eligibleUsers: EligibleUser[];
}>();

const currentUserId = computed(() => page.props.user?.id);
const isOwner = computed(() => page.props.user?.organizationRole === 'owner');

const open = ref(false);

const form = useForm({
    mode: 'new',
    userId: '',
    discordId: '',
    username: '',
    role: 'staff',
});

function submitAddMember() {
    form.transform((data) =>
        data.mode === 'existing' ? { mode: data.mode, userId: data.userId, role: data.role } : { mode: data.mode, discordId: data.discordId, username: data.username, role: data.role },
    ).post(urlFor('organization.members.store'), {
        preserveScroll: true,
        onSuccess: () => {
            form.reset();
            open.value = false;
        },
    });
}

function canRemove(member: Member): boolean {
    if (member.id === currentUserId.value || member.organizationRole === 'owner') return false;
    return isOwner.value || member.organizationRole === 'staff';
}

function canChangeRole(member: Member): boolean {
    return isOwner.value && member.id !== currentUserId.value && member.organizationRole !== 'owner';
}

function removeMember(id: string) {
    router.delete(urlFor('organization.members.destroy', { id }), { preserveScroll: true });
}

function toggleRole(member: Member) {
    const nextRole = member.organizationRole === 'admin' ? 'staff' : 'admin';
    router.patch(urlFor('organization.members.updateRole', { id: member.id }), { role: nextRole }, { preserveScroll: true });
}
</script>

<template>
    <Head :title="t('organization.title')" />
    <div class="min-h-screen pt-32 pb-24 px-[8%] space-y-10">
        <div class="flex flex-col items-center text-center gap-2">
            <h1 class="font-serif text-4xl font-light text-slate-800 dark:text-slate-100">{{ t('organization.title') }}</h1>
            <p class="text-slate-500 dark:text-slate-400">{{ props.organization.name }}</p>
        </div>

        <div class="max-w-3xl mx-auto space-y-6">
            <div class="flex items-center justify-between">
                <Badge variant="outline">{{ props.members.length }} {{ t('organization.members.count', props.members.length) }}</Badge>

                <Dialog v-model:open="open">
                    <DialogTrigger as-child>
                        <Button class="gap-2">
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
                                <Select v-model="form.mode">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">{{ t('organization.members.modeNew') }}</SelectItem>
                                        <SelectItem value="existing">{{ t('organization.members.modeExisting') }}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div v-if="form.mode === 'existing'" class="space-y-1">
                                <Label>{{ t('organization.members.existingUser') }}</Label>
                                <Select v-model="form.userId">
                                    <SelectTrigger>
                                        <SelectValue :placeholder="t('organization.members.existingUserPlaceholder')" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem v-for="eligibleUser in props.eligibleUsers" :key="eligibleUser.id" :value="eligibleUser.id">
                                            {{ eligibleUser.username }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p v-if="form.errors.userId" class="text-sm text-destructive">{{ form.errors.userId }}</p>
                            </div>

                            <template v-else>
                                <Input v-model="form.discordId" :label="t('admin.users.create.fields.discordId')" :error="form.errors.discordId" maxlength="32" required />
                                <Input v-model="form.username" :label="t('admin.users.create.fields.username')" :error="form.errors.username" maxlength="50" required />
                            </template>

                            <div v-if="isOwner" class="space-y-1">
                                <Label>{{ t('admin.users.create.fields.organizationRole') }}</Label>
                                <Select v-model="form.role">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="staff">{{ t('organization.roles.staff') }}</SelectItem>
                                        <SelectItem value="admin">{{ t('organization.roles.admin') }}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p v-if="form.errors.role" class="text-sm text-destructive">{{ form.errors.role }}</p>
                            </div>

                            <Button class="w-full" :loading="form.processing" :disabled="form.processing" @click="submitAddMember">
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
                                    <Badge :variant="member.organizationRole === 'owner' ? 'default' : 'secondary'">
                                        {{ t(`organization.roles.${member.organizationRole}`) }}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div class="flex items-center gap-2">
                                        <Button v-if="canChangeRole(member)" variant="outline" size="sm" class="gap-1" @click="toggleRole(member)">
                                            <ArrowUpCircle v-if="member.organizationRole === 'staff'" class="size-4" />
                                            <ArrowDownCircle v-else class="size-4" />
                                            {{ member.organizationRole === 'staff' ? t('organization.members.promote') : t('organization.members.demote') }}
                                        </Button>
                                        <DeleteButton
                                            v-if="canRemove(member)"
                                            :label="t('organization.members.remove')"
                                            :title="t('organization.members.removeConfirm.title')"
                                            :description="t('organization.members.removeConfirm.description', { username: member.username })"
                                            :cancel-label="t('organization.members.removeConfirm.cancel')"
                                            :confirm-label="t('organization.members.removeConfirm.confirm')"
                                            @confirm="removeMember(member.id)"
                                        />
                                    </div>
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
