<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Link } from '@adonisjs/inertia/vue';
import { ArrowLeft } from '@lucide/vue';
import QuantityStepper from '~/partials/stocks/QuantityStepper.vue';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();

type IngredientLine = { id: string; name: string; buyPrice: number; quantity: number };

const props = defineProps<{
    resource: Data.Resource;
    materials: IngredientLine[];
    ingredientResources: IngredientLine[];
}>();

const lingotLabel = computed(() => t('admin.resources.recipe.lingotLabel', { name: props.resource.name }));

pageTitle.value = `${t('admin.resources.recipe.title')} - ${lingotLabel.value}`;

function buildQuantities(items: IngredientLine[]): Record<string, number> {
    return Object.fromEntries(items.map((item) => [item.id, item.quantity]));
}

const materialQuantities = reactive<Record<string, number>>(buildQuantities(props.materials));
const resourceQuantities = reactive<Record<string, number>>(buildQuantities(props.ingredientResources));

const manufacturingCost = computed(
    () =>
        props.materials.reduce((sum, item) => sum + item.buyPrice * (materialQuantities[item.id] ?? 0), 0) +
        props.ingredientResources.reduce((sum, item) => sum + item.buyPrice * (resourceQuantities[item.id] ?? 0), 0),
);

const estimatedProfit = computed(() => props.resource.sellPrice - manufacturingCost.value);

const isSubmitting = ref(false);

function submit() {
    isSubmitting.value = true;
    router.put(
        urlFor('admin.resources.recipe.update', { id: props.resource.id }),
        {
            materials: props.materials.map((item) => ({ materialId: item.id, quantity: materialQuantities[item.id] ?? 0 })),
            resources: props.ingredientResources.map((item) => ({ resourceId: item.id, quantity: resourceQuantities[item.id] ?? 0 })),
        },
        { preserveScroll: true, onFinish: () => (isSubmitting.value = false) },
    );
}
</script>

<template>
    <div class="space-y-6 max-w-3xl">
        <div class="flex items-center justify-between">
            <Button variant="outline" class="gap-2" as-child>
                <Link :route="'admin.resources.show'" :params="{ id: resource.id }">
                    <ArrowLeft class="size-4" />
                    {{ t('admin.resources.recipe.back') }}
                </Link>
            </Button>
            <Button v-if="isAdmin" :loading="isSubmitting" :disabled="isSubmitting" @click="submit">
                {{ t('admin.resources.recipe.save') }}
            </Button>
        </div>

        <p class="text-sm text-muted-foreground">{{ t('admin.resources.recipe.description', { name: lingotLabel }) }}</p>

        <div class="space-y-3">
            <h2 class="text-lg font-medium">{{ t('admin.materials.title') }}</h2>
            <div class="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{{ t('admin.resources.table.name') }}</TableHead>
                            <TableHead>{{ t('admin.resources.table.buyPrice') }}</TableHead>
                            <TableHead>{{ t('admin.resources.recipe.quantity') }}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <template v-if="materials.length">
                            <TableRow v-for="material in materials" :key="material.id">
                                <TableCell class="text-sm font-medium">{{ material.name }}</TableCell>
                                <TableCell class="text-sm text-muted-foreground">{{ material.buyPrice }}</TableCell>
                                <TableCell>
                                    <QuantityStepper
                                        :model-value="materialQuantities[material.id] ?? 0"
                                        :disabled="!isAdmin"
                                        @update:model-value="(value) => (materialQuantities[material.id] = value)"
                                    />
                                </TableCell>
                            </TableRow>
                        </template>
                        <TableRow v-else>
                            <TableCell :colspan="3" class="h-24 text-center text-muted-foreground">{{ t('admin.materials.table.empty') }}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>

        <div class="space-y-3">
            <h2 class="text-lg font-medium">{{ t('admin.resources.types.minerai') }}</h2>
            <div class="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{{ t('admin.resources.table.name') }}</TableHead>
                            <TableHead>{{ t('admin.resources.table.buyPrice') }}</TableHead>
                            <TableHead>{{ t('admin.resources.recipe.quantity') }}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <template v-if="ingredientResources.length">
                            <TableRow v-for="resource in ingredientResources" :key="resource.id">
                                <TableCell class="text-sm font-medium">{{ resource.name }}</TableCell>
                                <TableCell class="text-sm text-muted-foreground">{{ resource.buyPrice }}</TableCell>
                                <TableCell>
                                    <QuantityStepper
                                        :model-value="resourceQuantities[resource.id] ?? 0"
                                        :disabled="!isAdmin"
                                        @update:model-value="(value) => (resourceQuantities[resource.id] = value)"
                                    />
                                </TableCell>
                            </TableRow>
                        </template>
                        <TableRow v-else>
                            <TableCell :colspan="3" class="h-24 text-center text-muted-foreground">{{ t('admin.resources.table.empty') }}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>

        <div class="rounded-md border p-4 space-y-2">
            <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">{{ t('admin.resources.recipe.manufacturingCost') }}</span>
                <span class="font-medium">{{ manufacturingCost.toFixed(2) }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">{{ t('admin.resources.recipe.sellPrice') }}</span>
                <span class="font-medium">{{ resource.sellPrice.toFixed(2) }}</span>
            </div>
            <div class="flex items-center justify-between text-lg">
                <span class="text-muted-foreground">{{ t('admin.resources.recipe.estimatedProfit') }}</span>
                <span class="font-medium">{{ estimatedProfit.toFixed(2) }}</span>
            </div>
        </div>
    </div>
</template>
