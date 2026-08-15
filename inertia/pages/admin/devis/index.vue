<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronDown, ChevronRight, Download, FilterX } from '@lucide/vue';

defineOptions({ layout: AdminLayout });

type QuoteLine = { resourceName: string; resourceType: string; quantity: number; unitPrice: number; totalPrice: number };
type QuoteRow = {
    id: string;
    number: number;
    requesterName: string;
    organizationName: string | null;
    totalAmount: number;
    createdAt: string;
    fileUrl: string | null;
    lines: QuoteLine[];
};

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
pageTitle.value = t('admin.devis.title');

const props = defineProps<{
    quotes: QuoteRow[];
    meta: { total: number; currentPage: number; lastPage: number; perPage: number };
    filters: { search: string; sort: string; dir: string };
}>();

const searchValue = ref(props.filters.search);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const expanded = ref(new Set<string>());

function toggleExpanded(quote: QuoteRow) {
    if (expanded.value.has(quote.id)) {
        expanded.value.delete(quote.id);
    } else {
        expanded.value.add(quote.id);
    }
}

function navigate(overrides: Record<string, string | number | undefined>) {
    const params: Record<string, string | number | undefined> = {
        search: searchValue.value || undefined,
        sort: props.filters.sort,
        dir: props.filters.dir,
        page: 1,
        ...overrides,
    };
    const clean: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') clean[k] = v;
    }
    router.get(urlFor('admin.devis.index'), clean, { preserveState: true, preserveScroll: true });
}

function onSearchInput(value: string | number) {
    searchValue.value = String(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        navigate({ search: searchValue.value || undefined, page: 1 });
    }, 300);
}

function onSort(column: string) {
    if (props.filters.sort === column) {
        navigate({ sort: column, dir: props.filters.dir === 'asc' ? 'desc' : 'asc', page: 1 });
    } else {
        navigate({ sort: column, dir: 'asc', page: 1 });
    }
}

function sortIcon(column: string) {
    if (props.filters.sort !== column) return ArrowUpDown;
    return props.filters.dir === 'asc' ? ArrowUp : ArrowDown;
}

function formatNumber(number: number): string {
    return String(number).padStart(5, '0');
}

function lineSections(quote: QuoteRow): { type: string; label: string; lines: QuoteLine[] }[] {
    return [
        { type: 'minerai', label: t('devis.sections.minerais'), lines: quote.lines.filter((line) => line.resourceType === 'minerai') },
        { type: 'lingot', label: t('devis.sections.lingots'), lines: quote.lines.filter((line) => line.resourceType === 'lingot') },
    ].filter((section) => section.lines.length);
}

const hasActiveFilters = computed(() => !!props.filters.search || !!props.filters.sort || props.meta.currentPage !== 1);

function resetFilters() {
    searchValue.value = '';
    router.get(urlFor('admin.devis.index'), {}, { preserveState: true, preserveScroll: true });
}
</script>

<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <Badge variant="outline">{{ meta.total }} {{ t('admin.devis.table.count', meta.total) }}</Badge>
        </div>

        <div class="flex items-center gap-2">
            <Input :placeholder="t('admin.devis.table.search')" :model-value="searchValue" class="max-w-sm" @update:model-value="onSearchInput" />
            <Button variant="ghost" size="sm" class="gap-1" :disabled="!hasActiveFilters" @click="resetFilters">
                <FilterX class="size-4" />
                {{ t('admin.common.resetFilters') }}
            </Button>
        </div>

        <div class="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead class="w-8" />
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('number')">
                                {{ t('admin.devis.table.number') }}
                                <component :is="sortIcon('number')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('createdAt')">
                                {{ t('admin.devis.table.date') }}
                                <component :is="sortIcon('createdAt')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('requesterName')">
                                {{ t('admin.devis.table.requester') }}
                                <component :is="sortIcon('requesterName')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('organizationName')">
                                {{ t('admin.devis.table.organization') }}
                                <component :is="sortIcon('organizationName')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('totalAmount')">
                                {{ t('admin.devis.table.amount') }}
                                <component :is="sortIcon('totalAmount')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>{{ t('admin.devis.table.actions') }}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="quotes.length">
                        <template v-for="quote in quotes" :key="quote.id">
                            <TableRow class="cursor-pointer" @click="toggleExpanded(quote)">
                                <TableCell>
                                    <ChevronDown v-if="expanded.has(quote.id)" class="size-4 text-muted-foreground" />
                                    <ChevronRight v-else class="size-4 text-muted-foreground" />
                                </TableCell>
                                <TableCell class="text-sm font-medium">{{ formatNumber(quote.number) }}</TableCell>
                                <TableCell class="text-sm text-muted-foreground">{{ new Date(quote.createdAt).toLocaleString('fr-FR', { timeZone: 'UTC' }) }}</TableCell>
                                <TableCell class="text-sm font-medium">{{ quote.requesterName }}</TableCell>
                                <TableCell class="text-sm text-muted-foreground">
                                    <span v-if="quote.organizationName">{{ quote.organizationName }}</span>
                                    <span v-else class="italic">{{ t('admin.devis.table.noOrganization') }}</span>
                                </TableCell>
                                <TableCell class="text-sm font-medium">{{ quote.totalAmount.toFixed(2) }} s</TableCell>
                                <TableCell @click.stop>
                                    <Button v-if="quote.fileUrl" as-child variant="outline" size="sm" class="gap-1">
                                        <a :href="quote.fileUrl" target="_blank" rel="noopener">
                                            <Download class="size-4" />
                                            {{ t('admin.devis.table.download') }}
                                        </a>
                                    </Button>
                                </TableCell>
                            </TableRow>
                            <TableRow v-if="expanded.has(quote.id)">
                                <TableCell />
                                <TableCell :colspan="6" class="bg-muted/30 p-3">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{{ t('admin.devis.detail.resource') }}</TableHead>
                                                <TableHead>{{ t('admin.devis.detail.quantity') }}</TableHead>
                                                <TableHead>{{ t('admin.devis.detail.unitPrice') }}</TableHead>
                                                <TableHead>{{ t('admin.devis.detail.total') }}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <template v-for="section in lineSections(quote)" :key="section.type">
                                                <TableRow>
                                                    <TableCell :colspan="4" class="text-xs font-semibold uppercase text-muted-foreground">{{ section.label }}</TableCell>
                                                </TableRow>
                                                <TableRow v-for="line in section.lines" :key="line.resourceName">
                                                    <TableCell class="text-sm font-medium">{{ line.resourceName }}</TableCell>
                                                    <TableCell class="text-sm text-muted-foreground">{{ line.quantity }}</TableCell>
                                                    <TableCell class="text-sm text-muted-foreground">{{ line.unitPrice.toFixed(2) }} s</TableCell>
                                                    <TableCell class="text-sm font-medium">{{ line.totalPrice.toFixed(2) }} s</TableCell>
                                                </TableRow>
                                            </template>
                                        </TableBody>
                                    </Table>
                                </TableCell>
                            </TableRow>
                        </template>
                    </template>
                    <TableRow v-else>
                        <TableCell :colspan="7" class="h-24 text-center text-muted-foreground">
                            {{ t('admin.devis.table.empty') }}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>

        <div class="flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" :disabled="meta.currentPage <= 1" @click="navigate({ page: meta.currentPage - 1 })">&larr;</Button>
            <div class="text-sm text-muted-foreground">{{ meta.currentPage }} / {{ meta.lastPage }}</div>
            <Button variant="outline" size="sm" :disabled="meta.currentPage >= meta.lastPage" @click="navigate({ page: meta.currentPage + 1 })">&rarr;</Button>
        </div>
    </div>
</template>
