<script setup lang="ts">
import { computed } from 'vue';
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { urlFor } from '~/client';
import { Button } from '~/components/ui/button';
import { Link } from '@adonisjs/inertia/vue';
import { Plus } from '@lucide/vue';
import DraggableResourceTable from '~/partials/admin/DraggableResourceTable.vue';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();
pageTitle.value = t('admin.resources.title');

const props = defineProps<{
    resources: Data.Resource[];
}>();

const minerais = computed(() => props.resources.filter((r) => r.type === 'minerai'));
const lingots = computed(() => props.resources.filter((r) => r.type === 'lingot'));
</script>

<template>
    <div class="space-y-10">
        <div v-if="isAdmin" class="flex items-center justify-end">
            <Button as-child class="gap-2">
                <Link :href="urlFor('admin.resources.create')">
                    <Plus class="size-4" />
                    {{ t('admin.resources.new') }}
                </Link>
            </Button>
        </div>

        <div class="space-y-3">
            <h2 class="text-lg font-medium">{{ t('admin.resources.types.minerai') }}</h2>
            <DraggableResourceTable :resources="minerais" />
        </div>

        <div class="space-y-3">
            <h2 class="text-lg font-medium">{{ t('admin.resources.types.lingot') }}</h2>
            <DraggableResourceTable :resources="lingots" />
        </div>
    </div>
</template>
