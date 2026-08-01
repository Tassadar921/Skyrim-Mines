<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Checkbox } from '~/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Link } from '@adonisjs/inertia/vue';
import { Mail, ArrowLeft, Download } from '@lucide/vue';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();

const props = defineProps<{
    user: Data.User;
}>();

pageTitle.value = `${t('admin.users.show.title')} - ${props.user.username}`;

const username = ref(props.user.username);
const role = ref(props.user.role);
const enabled = ref(props.user.enabled);
const isSubmitting = ref(false);

function submit() {
    isSubmitting.value = true;
    router.put(
        urlFor('admin.users.update', { id: props.user.id }),
        { username: username.value, role: role.value, enabled: enabled.value },
        {
            onFinish: () => {
                isSubmitting.value = false;
            },
        }
    );
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
            <div class="flex items-center gap-4">
                <a :href="urlFor('admin.users.export', { id: props.user.id })">
                    <Button variant="outline" size="sm" class="gap-2">
                        <Download class="size-4" />
                        {{ $t('admin.users.show.export') }}
                    </Button>
                </a>
                <Button variant="outline" size="sm" class="gap-2" disabled>
                    <Mail class="size-4" />
                    {{ $t('admin.users.show.resetPassword') }}
                </Button>
                <Button :loading="isSubmitting" :disabled="isSubmitting" @click="submit">
                    {{ $t('admin.users.show.save') }}
                </Button>
            </div>
        </div>

        <div class="rounded-md border p-5 space-y-4">
            <div class="space-y-1">
                <Label for="username">{{ $t('admin.users.show.fields.username') }}</Label>
                <Input id="username" v-model="username" type="text" maxlength="50" />
                <p class="text-xs text-muted-foreground text-right">{{ username.length }}/50</p>
            </div>

            <div class="space-y-1">
                <Label for="email">{{ $t('admin.users.show.fields.email') }}</Label>
                <Input id="email" :model-value="user.email" type="email" :readonly="true" />
            </div>

            <div class="space-y-1">
                <Label>{{ $t('admin.users.show.fields.role') }}</Label>
                <Select v-model="role">
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">{{ $t('admin.users.show.fields.roles.admin') }}</SelectItem>
                        <SelectItem value="user">{{ $t('admin.users.show.fields.roles.user') }}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div class="flex items-center gap-2">
                <Checkbox id="enabled" :model-value="enabled" @update:model-value="(v) => (enabled = !!v)" />
                <Label for="enabled" class="cursor-pointer">{{ $t('admin.users.show.fields.enabled') }}</Label>
            </div>

            <div class="flex items-center gap-2 opacity-60">
                <Checkbox id="terms" :model-value="!!user.acceptedTermsAt" disabled />
                <Label for="terms">{{ $t('admin.users.show.fields.acceptedTerms') }}</Label>
                <span v-if="user.acceptedTermsAt" class="text-xs text-muted-foreground">
                    {{ new Date(user.acceptedTermsAt).toLocaleDateString('fr', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }) }}
                </span>
            </div>
        </div>

        <div class="text-xs text-muted-foreground space-y-0.5 px-1">
            <div>
                {{ $t('admin.users.show.fields.id') }} :
                <span class="font-mono">{{ user.id }}</span>
            </div>
            <div>{{ $t('admin.users.show.fields.createdAt') }} : {{ new Date(user.createdAt).toLocaleString(undefined, { timeZone: 'UTC' }) }}</div>
            <div v-if="user.updatedAt">{{ $t('admin.users.show.fields.updatedAt') }} : {{ new Date(user.updatedAt).toLocaleString(undefined, { timeZone: 'UTC' }) }}</div>
        </div>
    </div>
</template>
