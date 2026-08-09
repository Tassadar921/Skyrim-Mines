<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { useForm } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Link } from '@adonisjs/inertia/vue';
import { ArrowLeft } from '@lucide/vue';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
pageTitle.value = t('admin.users.create.title');

const props = defineProps<{
    organizations: { id: string; name: string }[];
}>();

const form = useForm({
    discordId: '',
    username: '',
    role: '',
    organizationMode: 'none',
    organizationId: '',
    organizationName: '',
    organizationRole: '',
});

const isClient = computed(() => form.role === 'client' || form.role === 'auditor');

function submit() {
    form.transform((data) => ({
        ...data,
        organizationMode: data.organizationMode === 'none' ? undefined : data.organizationMode,
        organizationId: data.organizationId || undefined,
        organizationName: data.organizationName || undefined,
        organizationRole: data.organizationRole || undefined,
    })).post(urlFor('admin.users.store'), {
        onSuccess: () => form.reset(),
    });
}
</script>

<template>
    <div class="space-y-4 max-w-lg">
        <Button variant="outline" class="gap-2" as-child>
            <Link :href="urlFor('admin.users.index')">
                <ArrowLeft class="size-4" />
                {{ t('admin.users.create.back') }}
            </Link>
        </Button>

        <div class="rounded-md border p-5 space-y-4">
            <Input v-model="form.discordId" :label="t('admin.users.create.fields.discordId')" :error="form.errors.discordId" maxlength="32" required />
            <Input v-model="form.username" :label="t('admin.users.create.fields.username')" :error="form.errors.username" maxlength="50" required />

            <div class="space-y-1">
                <Label>{{ t('admin.users.create.fields.role') }}</Label>
                <Select v-model="form.role">
                    <SelectTrigger>
                        <SelectValue :placeholder="t('admin.users.create.fields.rolePlaceholder')" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">{{ t('admin.users.show.fields.roles.admin') }}</SelectItem>
                        <SelectItem value="auditor">{{ t('admin.users.show.fields.roles.auditor') }}</SelectItem>
                        <SelectItem value="staff">{{ t('admin.users.show.fields.roles.staff') }}</SelectItem>
                        <SelectItem value="contractor">{{ t('admin.users.show.fields.roles.contractor') }}</SelectItem>
                        <SelectItem value="client">{{ t('admin.users.show.fields.roles.client') }}</SelectItem>
                    </SelectContent>
                </Select>
                <p v-if="form.errors.role" class="text-sm text-destructive">{{ form.errors.role }}</p>
            </div>

            <template v-if="isClient">
                <div class="space-y-1 pt-2 border-t">
                    <Label class="pt-3 block">{{ t('admin.users.create.fields.organizationMode') }}</Label>
                    <Select v-model="form.organizationMode">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">{{ t('admin.users.create.fields.organizationModeNone') }}</SelectItem>
                            <SelectItem value="existing">{{ t('admin.users.create.fields.organizationModeExisting') }}</SelectItem>
                            <SelectItem value="new">{{ t('admin.users.create.fields.organizationModeNew') }}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <template v-if="form.organizationMode !== 'none'">
                    <div v-if="form.organizationMode === 'existing'" class="space-y-1">
                        <Label>{{ t('admin.users.create.fields.organization') }}</Label>
                        <Select v-model="form.organizationId">
                            <SelectTrigger>
                                <SelectValue :placeholder="t('admin.users.create.fields.organizationPlaceholder')" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="organization in props.organizations" :key="organization.id" :value="organization.id">
                                    {{ organization.name }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p v-if="form.errors.organizationId" class="text-sm text-destructive">{{ form.errors.organizationId }}</p>
                    </div>

                    <Input v-else v-model="form.organizationName" :label="t('admin.users.create.fields.organizationName')" :error="form.errors.organizationName" maxlength="100" />

                    <div class="space-y-1">
                        <Label>{{ t('admin.users.create.fields.organizationRole') }}</Label>
                        <Select v-model="form.organizationRole">
                            <SelectTrigger>
                                <SelectValue :placeholder="t('admin.users.create.fields.organizationRolePlaceholder')" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="owner">{{ t('organization.roles.owner') }}</SelectItem>
                                <SelectItem value="admin">{{ t('organization.roles.admin') }}</SelectItem>
                                <SelectItem value="staff">{{ t('organization.roles.staff') }}</SelectItem>
                            </SelectContent>
                        </Select>
                        <p v-if="form.errors.organizationRole" class="text-sm text-destructive">{{ form.errors.organizationRole }}</p>
                    </div>
                </template>
            </template>

            <Button :loading="form.processing" :disabled="form.processing" @click="submit">
                {{ t('admin.users.create.submit') }}
            </Button>
        </div>
    </div>
</template>
