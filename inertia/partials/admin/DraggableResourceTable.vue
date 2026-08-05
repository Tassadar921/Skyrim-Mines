<script setup lang="ts">
import { ref, watch } from 'vue';
import draggable from 'vuedraggable';
import { router } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
import { useAuth } from '~/composables/use_auth';
import { urlFor } from '~/client';
import { Table, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import DeleteButton from '~/components/ui/DeleteButton.vue';
import { Link } from '@adonisjs/inertia/vue';
import { GripVertical, Pencil, Eye } from '@lucide/vue';
import type { Data } from '@generated/data';

const { t } = useI18n();
const { isAdmin } = useAuth();

const props = defineProps<{
    resources: Data.Resource[];
}>();

const items = ref([...props.resources]);
watch(
    () => props.resources,
    (value) => {
        items.value = [...value];
    },
);

function onDragEnd() {
    router.patch(urlFor('admin.resources.reorder'), { items: items.value.map((resource, index) => ({ id: resource.id, order: index })) }, { preserveScroll: true, preserveState: true });
}

function onDelete(id: string) {
    router.delete(urlFor('admin.resources.destroy', { id }), { preserveScroll: true });
}
</script>

<template>
    <div class="rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead class="w-8" />
                    <TableHead>{{ t('admin.resources.table.name') }}</TableHead>
                    <TableHead>{{ t('admin.resources.table.buyPrice') }}</TableHead>
                    <TableHead>{{ t('admin.resources.table.sellPrice') }}</TableHead>
                    <TableHead>{{ t('admin.resources.table.actions') }}</TableHead>
                </TableRow>
            </TableHeader>
            <draggable v-model="items" tag="tbody" item-key="id" handle=".drag-handle" :disabled="!isAdmin" @end="onDragEnd">
                <template #item="{ element: resource }: { element: Data.Resource }">
                    <TableRow>
                        <TableCell :class="isAdmin ? 'drag-handle cursor-grab active:cursor-grabbing' : ''">
                            <GripVertical v-if="isAdmin" class="size-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell class="text-sm font-medium">{{ resource.name }}</TableCell>
                        <TableCell class="text-sm text-muted-foreground">{{ resource.buyPrice }}</TableCell>
                        <TableCell class="text-sm text-muted-foreground">{{ resource.sellPrice }}</TableCell>
                        <TableCell>
                            <div class="flex items-center gap-2">
                                <Link :route="'admin.resources.show'" :params="{ id: resource.id }">
                                    <Button variant="outline" size="sm" class="gap-1">
                                        <component :is="isAdmin ? Pencil : Eye" class="size-4" />
                                        {{ isAdmin ? t('admin.resources.table.edit') : t('admin.resources.table.view') }}
                                    </Button>
                                </Link>
                                <DeleteButton
                                    v-if="isAdmin"
                                    :label="t('admin.resources.delete.label')"
                                    :title="t('admin.resources.delete.title')"
                                    :description="t('admin.resources.delete.description', { name: resource.name })"
                                    :cancel-label="t('admin.resources.delete.cancel')"
                                    :confirm-label="t('admin.resources.delete.confirm')"
                                    @confirm="onDelete(resource.id)"
                                />
                            </div>
                        </TableCell>
                    </TableRow>
                </template>
                <template #footer>
                    <TableRow v-if="!items.length">
                        <TableCell :colspan="5" class="h-24 text-center text-muted-foreground">
                            {{ t('admin.resources.table.empty') }}
                        </TableCell>
                    </TableRow>
                </template>
            </draggable>
        </Table>
    </div>
</template>
