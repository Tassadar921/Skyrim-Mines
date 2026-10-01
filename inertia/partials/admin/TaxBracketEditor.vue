<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Plus, Trash2, ChevronDown, ChevronUp } from '@lucide/vue';

type Row = { upperBound: number | null; rate: number };

const props = defineProps<{
    rows: Row[];
    isAdmin: boolean;
    processing: boolean;
    summaryKey: string;
    upperBoundLabel: string;
    beyondLabel: string;
    rateLabel: string;
    addLabel: string;
    saveLabel: string;
}>();

const emit = defineEmits<{
    save: [rows: Row[]];
}>();

const { t } = useI18n();

const editableRows = ref<Row[]>(props.rows.length ? props.rows.map((row) => ({ ...row })) : [{ upperBound: null, rate: 0 }]);
const expanded = ref(false);

const summary = computed(() => t(props.summaryKey, editableRows.value.length));

function addRow() {
    const previousUpperBound = editableRows.value.length > 1 ? editableRows.value[editableRows.value.length - 2].upperBound : 0;
    editableRows.value.splice(editableRows.value.length - 1, 0, { upperBound: previousUpperBound ?? 0, rate: 0 });
}

function removeRow(index: number) {
    if (editableRows.value.length <= 1) return;
    editableRows.value.splice(index, 1);
}

function save() {
    emit(
        'save',
        editableRows.value.map((row, index) => ({ upperBound: index === editableRows.value.length - 1 ? null : row.upperBound, rate: row.rate })),
    );
}
</script>

<template>
    <div class="space-y-4">
        <button type="button" class="flex w-full items-center justify-between text-sm text-muted-foreground hover:text-foreground" @click="expanded = !expanded">
            <span>{{ summary }}</span>
            <span class="flex items-center gap-1">
                {{ expanded ? t('admin.common.collapse') : t('admin.common.expand') }}
                <ChevronUp v-if="expanded" class="size-4" />
                <ChevronDown v-else class="size-4" />
            </span>
        </button>

        <div v-if="expanded" class="space-y-4">
            <div class="space-y-2">
                <div v-for="(row, index) in editableRows" :key="index" class="flex items-end gap-2">
                    <div class="flex-1">
                        <Input
                            v-if="index < editableRows.length - 1"
                            :model-value="row.upperBound ?? 0"
                            type="number"
                            :label="upperBoundLabel"
                            min="0"
                            step="1"
                            :readonly="!isAdmin"
                            @update:model-value="(value) => (row.upperBound = Number(value))"
                        />
                        <div v-else class="pb-2.5 text-xs text-muted-foreground">{{ beyondLabel }}</div>
                    </div>
                    <div class="w-20">
                        <Input :model-value="row.rate" type="number" :label="rateLabel" min="0" :max="100" step="1" :readonly="!isAdmin" @update:model-value="(value) => (row.rate = Number(value))" />
                    </div>
                    <Button v-if="isAdmin && editableRows.length > 1" variant="ghost" size="icon" type="button" class="mb-0.5 shrink-0" @click="removeRow(index)">
                        <Trash2 class="size-4" />
                    </Button>
                </div>
            </div>
            <div v-if="isAdmin" class="flex items-center gap-2">
                <Button variant="outline" size="sm" type="button" class="gap-1" @click="addRow">
                    <Plus class="size-4" />
                    {{ addLabel }}
                </Button>
                <Button size="sm" :loading="processing" :disabled="processing" @click="save">
                    {{ saveLabel }}
                </Button>
            </div>
        </div>
    </div>
</template>
