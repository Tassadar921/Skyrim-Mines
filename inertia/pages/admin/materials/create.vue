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
pageTitle.value = t('admin.materials.create.title');

const form = useForm({
    name: '',
    buyPrice: '',
});

function submit() {
    form.post(urlFor('admin.materials.store'), {
        onSuccess: () => form.reset(),
    });
}
</script>

<template>
    <div class="space-y-4 max-w-lg">
        <Button variant="outline" class="gap-2" as-child>
            <Link :href="urlFor('admin.materials.index')">
                <ArrowLeft class="size-4" />
                {{ t('admin.materials.create.back') }}
            </Link>
        </Button>

        <div class="rounded-md border p-5 space-y-4">
            <Input v-model="form.name" :label="t('admin.materials.create.fields.name')" :error="form.errors.name" maxlength="100" required />
            <Input v-model="form.buyPrice" type="number" :label="t('admin.materials.create.fields.buyPrice')" :error="form.errors.buyPrice" required />

            <Button :loading="form.processing" :disabled="form.processing" @click="submit">
                {{ t('admin.materials.create.submit') }}
            </Button>
        </div>
    </div>
</template>
