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
    materials: Data.Material[];
}>();

const items = ref([...props.materials]);
watch(
    () => props.materials,
    (value) => {
        items.value = [...value];
    },
);

function onDragEnd() {
    router.patch(urlFor('admin.materials.reorder'), { items: items.value.map((material, index) => ({ id: material.id, order: index })) }, { preserveScroll: true, preserveState: true });
}

function onDelete(id: string) {
    router.delete(urlFor('admin.materials.destroy', { id }), { preserveScroll: true });
}
</script>

<template>
    <div class="rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead class="w-8" />
                    <TableHead>{{ t('admin.materials.table.name') }}</TableHead>
                    <TableHead>{{ t('admin.materials.table.buyPrice') }}</TableHead>
                    <TableHead>{{ t('admin.materials.table.actions') }}</TableHead>
                </TableRow>
            </TableHeader>
            <draggable v-model="items" tag="tbody" item-key="id" handle=".drag-handle" :disabled="!isAdmin" @end="onDragEnd">
                <template #item="{ element: material }: { element: Data.Material }">
                    <TableRow>
                        <TableCell :class="isAdmin ? 'drag-handle cursor-grab active:cursor-grabbing' : ''">
                            <GripVertical v-if="isAdmin" class="size-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell class="text-sm font-medium">{{ material.name }}</TableCell>
                        <TableCell class="text-sm text-muted-foreground">{{ material.buyPrice }}</TableCell>
                        <TableCell>
                            <div class="flex items-center gap-2">
                                <Link :route="'admin.materials.show'" :params="{ id: material.id }">
                                    <Button variant="outline" size="sm" class="gap-1">
                                        <component :is="isAdmin ? Pencil : Eye" class="size-4" />
                                        {{ isAdmin ? t('admin.materials.table.edit') : t('admin.materials.table.view') }}
                                    </Button>
                                </Link>
                                <DeleteButton
                                    v-if="isAdmin"
                                    :label="t('admin.materials.delete.label')"
                                    :title="t('admin.materials.delete.title')"
                                    :description="t('admin.materials.delete.description', { name: material.name })"
                                    :cancel-label="t('admin.materials.delete.cancel')"
                                    :confirm-label="t('admin.materials.delete.confirm')"
                                    @confirm="onDelete(material.id)"
                                />
                            </div>
                        </TableCell>
                    </TableRow>
                </template>
                <template #footer>
                    <TableRow v-if="!items.length">
                        <TableCell :colspan="4" class="h-24 text-center text-muted-foreground">
                            {{ t('admin.materials.table.empty') }}
                        </TableCell>
                    </TableRow>
                </template>
            </draggable>
        </Table>
    </div>
</template>
