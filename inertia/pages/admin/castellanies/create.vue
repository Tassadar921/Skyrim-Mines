<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useI18n } from 'vue-i18n';
import { useForm } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Link } from '@adonisjs/inertia/vue';
import { ArrowLeft } from '@lucide/vue';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
pageTitle.value = t('admin.castellanies.create.title');

const form = useForm({
    name: '',
    commissionRate: '0',
    largeOrderFeeRate: '0',
});

function submit() {
    form.post(urlFor('admin.castellanies.store'), {
        onSuccess: () => form.reset(),
    });
}
</script>

<template>
    <div class="space-y-4 max-w-lg">
        <Button variant="outline" class="gap-2" as-child>
            <Link :href="urlFor('admin.castellanies.index')">
                <ArrowLeft class="size-4" />
                {{ t('admin.castellanies.create.back') }}
            </Link>
        </Button>

        <div class="rounded-md border p-5 space-y-4">
            <Input v-model="form.name" :label="t('admin.castellanies.create.fields.name')" :error="form.errors.name" maxlength="100" required />
            <Input v-model="form.commissionRate" type="number" :label="t('admin.castellanies.create.fields.commissionRate')" :error="form.errors.commissionRate" min="0" :max="100" step="1" required />
            <Input
                v-model="form.largeOrderFeeRate"
                type="number"
                :label="t('admin.castellanies.create.fields.largeOrderFeeRate')"
                :error="form.errors.largeOrderFeeRate"
                min="0"
                :max="100"
                step="1"
                required
            />

            <Button :loading="form.processing" :disabled="form.processing" @click="submit">
                {{ t('admin.castellanies.create.submit') }}
            </Button>
        </div>
    </div>
</template>
