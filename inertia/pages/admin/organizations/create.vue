<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useI18n } from 'vue-i18n';
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
pageTitle.value = t('admin.organizations.create.title');

const props = defineProps<{
    castellanies: { id: string; name: string }[];
}>();

const NO_CASTELLANY = 'none';

const form = useForm({
    name: '',
    castellanyId: NO_CASTELLANY,
});

function submit() {
    form.transform((data) => ({ ...data, castellanyId: data.castellanyId === NO_CASTELLANY ? undefined : data.castellanyId })).post(urlFor('admin.organizations.store'), {
        onSuccess: () => form.reset(),
    });
}
</script>

<template>
    <div class="space-y-4 max-w-lg">
        <Button variant="outline" class="gap-2" as-child>
            <Link :href="urlFor('admin.organizations.index')">
                <ArrowLeft class="size-4" />
                {{ t('admin.organizations.create.back') }}
            </Link>
        </Button>

        <div class="rounded-md border p-5 space-y-4">
            <Input v-model="form.name" :label="t('admin.organizations.create.fields.name')" :error="form.errors.name" maxlength="100" required />

            <div class="space-y-1">
                <Label>{{ t('admin.organizations.create.fields.castellany') }}</Label>
                <Select v-model="form.castellanyId">
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem :value="NO_CASTELLANY">{{ t('admin.organizations.create.fields.castellanyNone') }}</SelectItem>
                        <SelectItem v-for="castellany in props.castellanies" :key="castellany.id" :value="castellany.id">{{ castellany.name }}</SelectItem>
                    </SelectContent>
                </Select>
                <p v-if="form.errors.castellanyId" class="text-sm text-destructive">{{ form.errors.castellanyId }}</p>
            </div>

            <Button :loading="form.processing" :disabled="form.processing" @click="submit">
                {{ t('admin.organizations.create.submit') }}
            </Button>
        </div>
    </div>
</template>
