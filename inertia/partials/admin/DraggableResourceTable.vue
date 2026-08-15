<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import draggable from 'vuedraggable';
import { router } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
import { useAuth } from '~/composables/use_auth';
import { urlFor } from '~/client';
import { Table, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import DeleteButton from '~/components/ui/DeleteButton.vue';
import { Link } from '@adonisjs/inertia/vue';
import { GripVertical, Pencil, Eye, ArrowUp, ArrowDown, ArrowUpDown } from '@lucide/vue';
import type { Data } from '@generated/data';

const { t } = useI18n();
const { isAdmin } = useAuth();

const props = defineProps<{
    resources: Data.Resource[];
    meta: { total: number; currentPage: number; lastPage: number; perPage: number };
    sort: string;
    dir: string;
    isDefaultView: boolean;
}>();

const emit = defineEmits<{
    sort: [column: string];
    page: [page: number];
}>();

const draggingEnabled = computed(() => props.isDefaultView && isAdmin.value);

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

function sortIcon(column: string) {
    if (props.sort !== column) return ArrowUpDown;
    return props.dir === 'asc' ? ArrowUp : ArrowDown;
}
</script>

<template>
    <div class="space-y-3">
        <div class="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead v-if="isDefaultView" class="w-8" />
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="emit('sort', 'name')">
                                {{ t('admin.resources.table.name') }}
                                <component :is="sortIcon('name')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>{{ t('admin.resources.table.buyPrice') }}</TableHead>
                        <TableHead>{{ t('admin.resources.table.sellPrice') }}</TableHead>
                        <TableHead>{{ t('admin.resources.table.actions') }}</TableHead>
                    </TableRow>
                </TableHeader>
                <draggable v-model="items" tag="tbody" item-key="id" handle=".drag-handle" :disabled="!draggingEnabled" @end="onDragEnd">
                    <template #item="{ element: resource }: { element: Data.Resource }">
                        <TableRow>
                            <TableCell v-if="isDefaultView" :class="draggingEnabled ? 'drag-handle cursor-grab active:cursor-grabbing' : ''">
                                <GripVertical v-if="draggingEnabled" class="size-4 text-muted-foreground" />
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
                            <TableCell :colspan="isDefaultView ? 5 : 4" class="h-24 text-center text-muted-foreground">
                                {{ t('admin.resources.table.empty') }}
                            </TableCell>
                        </TableRow>
                    </template>
                </draggable>
            </Table>
        </div>

        <div class="flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" :disabled="meta.currentPage <= 1" @click="emit('page', meta.currentPage - 1)">&larr;</Button>
            <div class="text-sm text-muted-foreground">{{ meta.currentPage }} / {{ meta.lastPage }}</div>
            <Button variant="outline" size="sm" :disabled="meta.currentPage >= meta.lastPage" @click="emit('page', meta.currentPage + 1)">&rarr;</Button>
        </div>
    </div>
</template>
