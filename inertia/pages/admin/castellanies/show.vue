<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import DeleteButton from '~/components/ui/DeleteButton.vue';
import { Link } from '@adonisjs/inertia/vue';
import { ArrowLeft } from '@lucide/vue';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();

const props = defineProps<{
    castellany: { id: string; name: string; commissionAmount: number; largeOrderFeeRate: number };
}>();

pageTitle.value = `${t('admin.castellanies.show.title')} - ${props.castellany.name}`;

const name = ref(props.castellany.name);
const commissionAmount = ref(String(props.castellany.commissionAmount));
const largeOrderFeeRate = ref(String(props.castellany.largeOrderFeeRate));
const isSubmitting = ref(false);

function submit() {
    isSubmitting.value = true;
    router.put(
        urlFor('admin.castellanies.update', { id: props.castellany.id }),
        { name: name.value, commissionAmount: commissionAmount.value, largeOrderFeeRate: largeOrderFeeRate.value },
        { onFinish: () => (isSubmitting.value = false) },
    );
}

function destroyCastellany() {
    router.delete(urlFor('admin.castellanies.destroy', { id: props.castellany.id }));
}
</script>

<template>
    <div class="space-y-4 max-w-lg">
        <div class="flex items-center justify-between">
            <Button variant="outline" class="gap-2" as-child>
                <Link :href="urlFor('admin.castellanies.index')">
                    <ArrowLeft class="size-4" />
                    {{ t('admin.castellanies.show.back') }}
                </Link>
            </Button>
            <div v-if="isAdmin" class="flex items-center gap-2">
                <Button :loading="isSubmitting" :disabled="isSubmitting" @click="submit">
                    {{ t('admin.castellanies.show.save') }}
                </Button>
                <DeleteButton
                    :label="t('admin.castellanies.show.delete')"
                    :title="t('admin.castellanies.show.deleteConfirm.title')"
                    :description="t('admin.castellanies.show.deleteConfirm.description', { name: props.castellany.name })"
                    :cancel-label="t('admin.castellanies.show.deleteConfirm.cancel')"
                    :confirm-label="t('admin.castellanies.show.deleteConfirm.confirm')"
                    @confirm="destroyCastellany"
                />
            </div>
        </div>

        <div class="rounded-md border p-5 space-y-4">
            <Input v-model="name" :label="t('admin.castellanies.create.fields.name')" maxlength="100" required :readonly="!isAdmin" />
            <Input v-model="commissionAmount" type="number" :label="t('admin.castellanies.create.fields.commissionAmount')" min="0" step="1" required :readonly="!isAdmin" />
            <Input v-model="largeOrderFeeRate" type="number" :label="t('admin.castellanies.create.fields.largeOrderFeeRate')" min="0" :max="100" step="1" required :readonly="!isAdmin" />
        </div>
    </div>
</template>
