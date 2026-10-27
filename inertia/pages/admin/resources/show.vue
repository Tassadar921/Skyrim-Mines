<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Checkbox } from '~/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Link } from '@adonisjs/inertia/vue';
import { ArrowLeft } from '@lucide/vue';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();

const props = defineProps<{
    resource: Data.Resource;
}>();

pageTitle.value = `${t('admin.resources.show.title')} - ${props.resource.name}`;

const name = ref(props.resource.name);
const type = ref(props.resource.type);
const buyPrice = ref(String(props.resource.buyPrice));
const sellPrice = ref(String(props.resource.sellPrice));
const buybackSplitEnabled = ref(props.resource.buybackSplitEnabled);
const minerShare = ref(String(props.resource.minerShare ?? props.resource.buyPrice));
const sharedShare = ref(String(props.resource.sharedShare ?? 0));

const toCents = (value: string) => Math.round(Number(value || 0) * 100);
const buybackSplitTotal = computed(() => (toCents(minerShare.value) + toCents(sharedShare.value)) / 100);
const buybackSplitMismatch = computed(() => buybackSplitEnabled.value && toCents(minerShare.value) + toCents(sharedShare.value) !== toCents(buyPrice.value));
const isSubmitting = ref(false);

function submit() {
    isSubmitting.value = true;
    router.put(
        urlFor('admin.resources.update', { id: props.resource.id }),
        {
            name: name.value,
            type: type.value,
            buyPrice: buyPrice.value,
            sellPrice: sellPrice.value,
            buybackSplitEnabled: buybackSplitEnabled.value,
            ...(buybackSplitEnabled.value ? { minerShare: minerShare.value, sharedShare: sharedShare.value } : {}),
        },
        {
            onFinish: () => {
                isSubmitting.value = false;
            },
        },
    );
}
</script>

<template>
    <div class="space-y-4 max-w-lg">
        <div class="flex flex-wrap items-center justify-between gap-2">
            <Button variant="outline" class="gap-2" as-child>
                <Link :href="urlFor('admin.resources.index')">
                    <ArrowLeft class="size-4" />
                    {{ t('admin.resources.show.back') }}
                </Link>
            </Button>
            <div class="flex items-center gap-2">
                <Button v-if="resource.type === 'lingot'" variant="outline" as-child>
                    <Link :route="'admin.resources.recipe.edit'" :params="{ id: resource.id }">
                        {{ t('admin.resources.recipe.title') }}
                    </Link>
                </Button>
                <Button v-if="isAdmin" :loading="isSubmitting" :disabled="isSubmitting || buybackSplitMismatch" @click="submit">
                    {{ t('admin.resources.show.save') }}
                </Button>
            </div>
        </div>

        <div class="rounded-md border p-5 space-y-4">
            <Input v-model="name" :label="t('admin.resources.create.fields.name')" maxlength="100" required :readonly="!isAdmin" />

            <div class="space-y-1">
                <Label>{{ t('admin.resources.create.fields.type') }}</Label>
                <Select v-model="type" :disabled="!isAdmin">
                    <SelectTrigger>
                        <SelectValue :placeholder="t('admin.resources.create.fields.typePlaceholder')" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="minerai">{{ t('admin.resources.types.minerai') }}</SelectItem>
                        <SelectItem value="lingot">{{ t('admin.resources.types.lingot') }}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Input v-model="buyPrice" type="number" :label="t('admin.resources.create.fields.buyPrice')" required :readonly="!isAdmin" />
            <Input v-model="sellPrice" type="number" :label="t('admin.resources.create.fields.sellPrice')" required :readonly="!isAdmin" />
        </div>

        <div class="rounded-md border p-5 space-y-4">
            <div class="space-y-1">
                <div class="text-sm font-medium">{{ t('admin.resources.show.buybackSplit.title') }}</div>
                <p class="text-xs text-muted-foreground">{{ t('admin.resources.show.buybackSplit.hint') }}</p>
            </div>

            <div class="flex items-center gap-2">
                <Checkbox id="buybackSplitEnabled" :disabled="!isAdmin" :model-value="buybackSplitEnabled" @update:model-value="(v) => (buybackSplitEnabled = !!v)" />
                <Label for="buybackSplitEnabled" class="cursor-pointer">{{ t('admin.resources.show.buybackSplit.enabled') }}</Label>
            </div>

            <template v-if="buybackSplitEnabled">
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input v-model="minerShare" type="number" min="0" step="0.01" :label="t('admin.resources.show.buybackSplit.minerShare')" :readonly="!isAdmin" />
                    <Input v-model="sharedShare" type="number" min="0" step="0.01" :label="t('admin.resources.show.buybackSplit.sharedShare')" :readonly="!isAdmin" />
                </div>
                <p class="text-xs" :class="buybackSplitMismatch ? 'text-destructive' : 'text-muted-foreground'">
                    {{ t('admin.resources.show.buybackSplit.total', { total: buybackSplitTotal.toFixed(2), buyPrice: Number(buyPrice || 0).toFixed(2) }) }}
                    <template v-if="buybackSplitMismatch">— {{ t('admin.resources.show.buybackSplit.mismatch') }}</template>
                </p>
            </template>
        </div>
    </div>
</template>
