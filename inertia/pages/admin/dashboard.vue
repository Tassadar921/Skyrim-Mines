<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useI18n } from 'vue-i18n';

defineOptions({ layout: AdminLayout });
const { t } = useI18n();

const { pageTitle } = useAdminLayout();
pageTitle.value = t('admin.dashboard.title');
</script>

<template>
    <div></div>
</template>
