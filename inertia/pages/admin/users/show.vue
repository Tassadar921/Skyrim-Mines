<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { router, useForm } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Checkbox } from '~/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import DeleteButton from '~/components/ui/DeleteButton.vue';
import { Link } from '@adonisjs/inertia/vue';
import { ArrowLeft, UserCircle } from '@lucide/vue';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();

const props = defineProps<{
    targetUser: Data.User & { avatarUrl: string | null };
}>();

pageTitle.value = `${t('admin.users.show.title')} - ${props.targetUser.username}`;

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
            <div v-if="isAdmin" class="flex items-center gap-4">
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
                <div v-if="isAdmin" class="space-y-1">
                    <Button variant="outline" size="sm" type="button" :loading="avatarForm.processing" :disabled="avatarForm.processing" @click="avatarInputRef?.click()">
                        {{ t('admin.users.show.avatar.upload') }}
                    </Button>
                    <p class="text-xs text-muted-foreground">{{ t('admin.users.show.avatar.hint') }}</p>
                    <p v-if="avatarForm.errors.avatar" class="text-xs text-destructive">{{ avatarForm.errors.avatar }}</p>
                    <input ref="avatarInputRef" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" class="hidden" @change="onAvatarChange" />
                </div>
            </div>
        </div>

        <div class="rounded-md border p-5 space-y-4">
            <div class="space-y-1">
                <Label for="username">{{ $t('admin.users.show.fields.username') }}</Label>
                <Input id="username" v-model="username" type="text" maxlength="50" :readonly="!isAdmin" />
                <p class="text-xs text-muted-foreground text-right">{{ username.length }}/50</p>
            </div>

            <div class="space-y-1">
                <Label>{{ $t('admin.users.show.fields.role') }}</Label>
                <Select v-model="role" :disabled="!isAdmin">
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">{{ $t('admin.users.show.fields.roles.admin') }}</SelectItem>
                        <SelectItem value="auditor">{{ $t('admin.users.show.fields.roles.auditor') }}</SelectItem>
                        <SelectItem value="staff">{{ $t('admin.users.show.fields.roles.staff') }}</SelectItem>
                        <SelectItem value="contractor">{{ $t('admin.users.show.fields.roles.contractor') }}</SelectItem>
                        <SelectItem value="client">{{ $t('admin.users.show.fields.roles.client') }}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div class="flex items-center gap-2">
                <Checkbox id="enabled" :disabled="!isAdmin" :model-value="enabled" @update:model-value="(v) => (enabled = !!v)" />
                <Label for="enabled" class="cursor-pointer">{{ $t('admin.users.show.fields.enabled') }}</Label>
            </div>
        </div>

        <div class="text-xs text-muted-foreground space-y-0.5 px-1">
            <div>{{ $t('admin.users.show.fields.balance') }} : {{ targetUser.balance.toFixed(2) }} s</div>
            <div>
                {{ $t('admin.users.show.fields.id') }} :
                <span class="font-mono">{{ targetUser.id }}</span>
            </div>
            <div>{{ $t('admin.users.show.fields.createdAt') }} : {{ new Date(targetUser.createdAt).toLocaleString(undefined, { timeZone: 'UTC' }) }}</div>
            <div v-if="targetUser.updatedAt">{{ $t('admin.users.show.fields.updatedAt') }} : {{ new Date(targetUser.updatedAt).toLocaleString(undefined, { timeZone: 'UTC' }) }}</div>
        </div>
    </div>
</template>
