<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { urlFor } from '~/client';
import { Button } from '~/components/ui/button';
import { Link } from '@adonisjs/inertia/vue';
import { Plus } from '@lucide/vue';
import DraggableMaterialTable from '~/partials/admin/DraggableMaterialTable.vue';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();
pageTitle.value = t('admin.materials.title');

defineProps<{
    materials: Data.Material[];
}>();
</script>

<template>
    <div class="space-y-10">
        <div v-if="isAdmin" class="flex items-center justify-end">
            <Button as-child class="gap-2">
                <Link :href="urlFor('admin.materials.create')">
                    <Plus class="size-4" />
                    {{ t('admin.materials.new') }}
                </Link>
            </Button>
        </div>

        <DraggableMaterialTable :materials="materials" />
    </div>
</template>
