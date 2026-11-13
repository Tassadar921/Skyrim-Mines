<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ChevronDown, ChevronRight } from '@lucide/vue';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import type { ResourceBuyback } from '~/partials/admin/permanences/PermanenceBuybackTable.vue';

const props = defineProps<{
    label: string;
    rows: ResourceBuyback[];
}>();

const { t } = useI18n();

/** "Yes" as soon as at least one resource of the kind is bought back. */
const isBuyingBack = computed(() => props.rows.some((row) => row.enabled));

// Per-resource detail stays folded by default so the summary stays short.
const isExpanded = ref(false);
</script>

<template>
    <div class="space-y-2">
        <div class="flex items-center justify-between gap-4">
            <span class="text-sm">{{ label }}</span>
            <div class="flex items-center gap-2">
                <Badge :variant="isBuyingBack ? 'default' : 'secondary'">{{ isBuyingBack ? t('admin.permanences.summary.yes') : t('admin.permanences.summary.no') }}</Badge>
                <Button v-if="rows.length" variant="ghost" size="sm" class="h-7 gap-1 px-2 text-xs" :aria-expanded="isExpanded" @click="isExpanded = !isExpanded">
                    <component :is="isExpanded ? ChevronDown : ChevronRight" class="size-3.5" />
                    {{ isExpanded ? t('admin.permanences.summary.hideDetail') : t('admin.permanences.summary.showDetail') }}
                </Button>
            </div>
        </div>
        <ul v-if="isExpanded" class="grid grid-cols-1 gap-x-6 gap-y-1 rounded-md bg-muted/40 p-3 sm:grid-cols-2">
            <li v-for="row in rows" :key="row.resourceId" class="flex items-center justify-between gap-2 text-sm">
                <span :class="row.enabled ? '' : 'text-muted-foreground'">{{ row.name }}</span>
                <span class="text-xs" :class="row.enabled ? 'font-medium text-green-600' : 'text-muted-foreground'">
                    {{ row.enabled ? t('admin.permanences.summary.yes') : t('admin.permanences.summary.no') }}
                </span>
            </li>
        </ul>
    </div>
</template>
