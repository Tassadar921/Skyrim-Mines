<script setup lang="ts">
import { computed } from 'vue';
import { Head } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import type { Data } from '@generated/data';

const { t } = useI18n();

const props = defineProps<{
    resources: Data.Resource[];
}>();

const minerais = computed(() => props.resources.filter((r) => r.type === 'minerai'));
const lingots = computed(() => props.resources.filter((r) => r.type === 'lingot'));
</script>

<template>
    <Head :title="t('tarifs.title')" />
    <div class="min-h-screen pt-32 pb-24 px-[8%] space-y-16">
        <div class="flex flex-col items-center text-center gap-6">
            <h1 class="font-serif text-4xl font-light text-slate-800 dark:text-slate-100">{{ t('tarifs.title') }}</h1>
        </div>

        <div class="max-w-3xl mx-auto space-y-10">
            <div class="space-y-3">
                <h2 class="font-serif text-2xl font-light text-slate-800 dark:text-slate-100">{{ t('admin.resources.types.minerai') }}</h2>
                <div class="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{{ t('admin.resources.table.name') }}</TableHead>
                                <TableHead>{{ t('admin.resources.table.buyPrice') }}</TableHead>
                                <TableHead>{{ t('admin.resources.table.sellPrice') }}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <template v-if="minerais.length">
                                <TableRow v-for="resource in minerais" :key="resource.id">
                                    <TableCell class="text-sm font-medium">{{ resource.name }}</TableCell>
                                    <TableCell class="text-sm text-muted-foreground">{{ resource.buyPrice }}</TableCell>
                                    <TableCell class="text-sm text-muted-foreground">{{ resource.sellPrice }}</TableCell>
                                </TableRow>
                            </template>
                            <TableRow v-else>
                                <TableCell :colspan="3" class="h-24 text-center text-muted-foreground">
                                    {{ t('admin.resources.table.empty') }}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div class="space-y-3">
                <h2 class="font-serif text-2xl font-light text-slate-800 dark:text-slate-100">{{ t('admin.resources.types.lingot') }}</h2>
                <div class="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{{ t('admin.resources.table.name') }}</TableHead>
                                <TableHead>{{ t('admin.resources.table.buyPrice') }}</TableHead>
                                <TableHead>{{ t('admin.resources.table.sellPrice') }}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <template v-if="lingots.length">
                                <TableRow v-for="resource in lingots" :key="resource.id">
                                    <TableCell class="text-sm font-medium">{{ resource.name }}</TableCell>
                                    <TableCell class="text-sm text-muted-foreground">{{ resource.buyPrice }}</TableCell>
                                    <TableCell class="text-sm text-muted-foreground">{{ resource.sellPrice }}</TableCell>
                                </TableRow>
                            </template>
                            <TableRow v-else>
                                <TableCell :colspan="3" class="h-24 text-center text-muted-foreground">
                                    {{ t('admin.resources.table.empty') }}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    </div>
</template>
