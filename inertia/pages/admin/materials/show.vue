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
import { Link } from '@adonisjs/inertia/vue';
import { ArrowLeft } from '@lucide/vue';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();

const props = defineProps<{
    material: Data.Material;
}>();

pageTitle.value = `${t('admin.materials.show.title')} - ${props.material.name}`;

const name = ref(props.material.name);
const buyPrice = ref(String(props.material.buyPrice));
const isSubmitting = ref(false);

function submit() {
    isSubmitting.value = true;
    router.put(
        urlFor('admin.materials.update', { id: props.material.id }),
        {
            name: name.value,
            buyPrice: buyPrice.value,
        },
        {
            onFinish: () => {
                isSubmitting.value = false;
            },
        },
    );
}
</script>

<template>
    <div class="space-y-4 max-w-lg">
        <div class="flex items-center justify-between">
            <Button variant="outline" class="gap-2" as-child>
                <Link :href="urlFor('admin.materials.index')">
                    <ArrowLeft class="size-4" />
                    {{ t('admin.materials.show.back') }}
                </Link>
            </Button>
            <Button v-if="isAdmin" :loading="isSubmitting" :disabled="isSubmitting" @click="submit">
                {{ t('admin.materials.show.save') }}
            </Button>
        </div>

        <div class="rounded-md border p-5 space-y-4">
            <Input v-model="name" :label="t('admin.materials.create.fields.name')" maxlength="100" required :readonly="!isAdmin" />
            <Input v-model="buyPrice" type="number" :label="t('admin.materials.create.fields.buyPrice')" required :readonly="!isAdmin" />
        </div>
    </div>
</template>
