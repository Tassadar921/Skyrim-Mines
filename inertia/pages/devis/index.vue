<script setup lang="ts">
import { ref } from 'vue';
import { Head, router, Link } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { ChevronDown, ChevronRight, Download } from '@lucide/vue';

type QuoteLine = { resourceName: string; resourceType: string; quantity: number; unitPrice: number; totalPrice: number };
type QuoteRow = {
    id: string;
    number: number;
    requesterName: string;
    totalAmount: number;
    createdAt: string;
    fileUrl: string | null;
    lines: QuoteLine[];
};

const { t } = useI18n();

const props = defineProps<{
    quotes: QuoteRow[];
    meta: { total: number; currentPage: number; lastPage: number; perPage: number };
}>();

const expanded = ref(new Set<string>());

function toggleExpanded(quote: QuoteRow) {
    if (expanded.value.has(quote.id)) {
        expanded.value.delete(quote.id);
    } else {
        expanded.value.add(quote.id);
    }
}

function goToPage(page: number) {
    router.get(urlFor('devis.index'), { page }, { preserveState: true, preserveScroll: true });
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
</script>

<template>
    <Head :title="t('devis.index.title')" />
    <div class="min-h-screen pt-32 pb-24 px-[8%] space-y-10">
        <div class="flex flex-col items-center text-center gap-2">
            <h1 class="font-serif text-4xl font-light text-slate-800 dark:text-slate-100">{{ t('devis.index.title') }}</h1>
            <Badge variant="outline">{{ meta.total }} {{ t('devis.index.table.count', meta.total) }}</Badge>
        </div>

        <div class="max-w-4xl mx-auto space-y-4">
            <div class="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead class="w-8" />
                            <TableHead>{{ t('devis.index.table.number') }}</TableHead>
                            <TableHead>{{ t('devis.index.table.date') }}</TableHead>
                            <TableHead>{{ t('devis.index.table.requester') }}</TableHead>
                            <TableHead>{{ t('devis.index.table.amount') }}</TableHead>
                            <TableHead>{{ t('devis.index.table.actions') }}</TableHead>
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
                                    <TableCell class="text-sm font-medium">{{ quote.totalAmount.toFixed(2) }} s</TableCell>
                                    <TableCell @click.stop>
                                        <Button v-if="quote.fileUrl" as-child variant="outline" size="sm" class="gap-1">
                                            <a :href="quote.fileUrl" target="_blank" rel="noopener">
                                                <Download class="size-4" />
                                                {{ t('devis.index.table.download') }}
                                            </a>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow v-if="expanded.has(quote.id)">
                                    <TableCell />
                                    <TableCell :colspan="5" class="bg-muted/30 p-3">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>{{ t('stocks.table.name') }}</TableHead>
                                                    <TableHead>{{ t('deposit.quantity') }}</TableHead>
                                                    <TableHead>{{ t('stocks.table.sellPrice') }}</TableHead>
                                                    <TableHead>{{ t('devis.show.total') }}</TableHead>
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
                            <TableCell :colspan="6" class="h-24 text-center text-muted-foreground">
                                {{ t('devis.index.table.empty') }}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <div v-if="meta.lastPage > 1" class="flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" :disabled="meta.currentPage <= 1" @click="goToPage(meta.currentPage - 1)">&larr;</Button>
                <div class="text-sm text-muted-foreground">{{ meta.currentPage }} / {{ meta.lastPage }}</div>
                <Button variant="outline" size="sm" :disabled="meta.currentPage >= meta.lastPage" @click="goToPage(meta.currentPage + 1)">&rarr;</Button>
            </div>

            <div class="flex justify-center">
                <Link :href="urlFor('devis.create')" class="text-sm text-slate-500 hover:text-amber-700 hover:dark:text-amber-400 underline">
                    {{ t('devis.title') }}
                </Link>
            </div>
        </div>
    </div>
</template>
