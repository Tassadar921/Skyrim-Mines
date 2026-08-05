<script setup lang="ts">
import { computed } from 'vue';
import { Head, Link } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Download } from '@lucide/vue';

type QuoteLine = { resourceName: string; resourceType: string; quantity: number; unitPrice: number; totalPrice: number };
type Quote = {
    id: string;
    number: number;
    organizationName: string | null;
    requesterName: string;
    totalAmount: number;
    createdAt: string;
    fileUrl: string | null;
    lines: QuoteLine[];
};

const { t } = useI18n();

const props = defineProps<{
    quote: Quote;
}>();

const formattedNumber = String(props.quote.number).padStart(5, '0');

const lineSections = computed(() =>
    [
        { type: 'minerai', label: t('devis.sections.minerais'), lines: props.quote.lines.filter((line) => line.resourceType === 'minerai') },
        { type: 'lingot', label: t('devis.sections.lingots'), lines: props.quote.lines.filter((line) => line.resourceType === 'lingot') },
    ].filter((section) => section.lines.length),
);
</script>

<template>
    <Head :title="`${t('devis.title')} n° ${formattedNumber}`" />
    <div class="min-h-screen pt-32 pb-24 px-[8%] space-y-10">
        <div class="flex flex-col items-center text-center gap-2">
            <h1 class="font-serif text-4xl font-light text-slate-800 dark:text-slate-100">{{ t('devis.show.title') }}</h1>
            <p class="text-slate-500 dark:text-slate-400">{{ t('devis.show.number', { number: formattedNumber }) }}</p>
        </div>

        <div class="max-w-3xl mx-auto space-y-6">
            <div class="flex flex-col items-center gap-4 rounded-md border p-6 text-center">
                <p class="text-slate-600 dark:text-slate-300">{{ t('devis.show.ready') }}</p>
                <Button v-if="quote.fileUrl" as-child class="gap-2">
                    <a :href="quote.fileUrl" target="_blank" rel="noopener">
                        <Download class="size-4" />
                        {{ t('devis.show.download') }}
                    </a>
                </Button>
            </div>

            <div class="rounded-md border">
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
                        <template v-for="section in lineSections" :key="section.type">
                            <TableRow>
                                <TableCell :colspan="4" class="text-xs font-semibold uppercase text-muted-foreground bg-muted/30">{{ section.label }}</TableCell>
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
            </div>

            <div class="flex items-center justify-end gap-2 text-lg">
                <span class="text-slate-600 dark:text-slate-300">{{ t('devis.show.total') }}</span>
                <span class="font-medium text-slate-800 dark:text-slate-100">{{ quote.totalAmount.toFixed(2) }} s</span>
            </div>

            <div class="flex justify-center">
                <Link :href="urlFor('devis.create')" class="text-sm text-slate-500 hover:text-amber-700 hover:dark:text-amber-400 underline">
                    {{ t('devis.show.newQuote') }}
                </Link>
            </div>
        </div>
    </div>
</template>
