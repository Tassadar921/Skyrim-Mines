<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Switch } from '~/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

export type ResourceBuyback = { resourceId: string; name: string; enabled: boolean };

const props = defineProps<{
    title: string;
    description: string;
    /** Header of the first column, e.g. "Minerais". */
    resourceLabel: string;
    emptyLabel: string;
    rows: ResourceBuyback[];
}>();

const { t } = useI18n();

// Applied right away on toggle, per resource or for every row at once from the header toggle;
// the server's values win again once the page props come back.
const enabled = reactive<Record<string, boolean>>({});
const isSaving = ref(false);
watch(
    () => props.rows,
    (rows) => rows.forEach((row) => (enabled[row.resourceId] = row.enabled)),
    { immediate: true, deep: true },
);

const enabledCount = computed(() => props.rows.filter((row) => enabled[row.resourceId]).length);
const allEnabled = computed(() => props.rows.length > 0 && enabledCount.value === props.rows.length);

function update(resourceIds: string[], value: boolean) {
    resourceIds.forEach((id) => (enabled[id] = value));
    isSaving.value = true;
    router.put(
        urlFor('admin.permanences.settings.buyback'),
        { resourceIds, enabled: value },
        {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => (isSaving.value = false),
            onError: () => props.rows.forEach((row) => (enabled[row.resourceId] = row.enabled)),
        },
    );
}

function updateAll(value: boolean) {
    update(
        props.rows.map((row) => row.resourceId),
        value,
    );
}
</script>

<template>
    <div class="rounded-md border">
        <div class="space-y-0.5 p-4">
            <div class="text-sm font-medium">{{ title }}</div>
            <p class="text-xs text-muted-foreground">{{ description }}</p>
        </div>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{{ resourceLabel }}</TableHead>
                    <TableHead class="w-48">
                        <div class="flex items-center justify-end gap-3">
                            <span>{{ t('admin.permanences.settings.buyback.buyback') }}</span>
                            <span class="text-xs font-normal text-muted-foreground">{{ t('admin.permanences.settings.buyback.count', { count: enabledCount, total: rows.length }) }}</span>
                            <Switch
                                :model-value="allEnabled"
                                :disabled="isSaving || !rows.length"
                                :aria-label="t('admin.permanences.settings.buyback.all')"
                                :title="t('admin.permanences.settings.buyback.all')"
                                @update:model-value="(value) => updateAll(!!value)"
                            />
                        </div>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <template v-if="rows.length">
                    <TableRow v-for="row in rows" :key="row.resourceId">
                        <TableCell class="text-sm font-medium">{{ row.name }}</TableCell>
                        <TableCell>
                            <div class="flex justify-end">
                                <Switch
                                    :model-value="enabled[row.resourceId]"
                                    :disabled="isSaving"
                                    :aria-label="`${t('admin.permanences.settings.buyback.buyback')} ${row.name}`"
                                    @update:model-value="(value) => update([row.resourceId], !!value)"
                                />
                            </div>
                        </TableCell>
                    </TableRow>
                </template>
                <TableRow v-else>
                    <TableCell :colspan="2" class="h-16 text-center text-muted-foreground">{{ emptyLabel }}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </div>
</template>
