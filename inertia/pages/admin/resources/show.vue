<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
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
        <div class="flex items-center justify-between">
            <Button variant="outline" class="gap-2" as-child>
                <Link :href="urlFor('admin.resources.index')">
                    <ArrowLeft class="size-4" />
                    {{ t('admin.resources.show.back') }}
                </Link>
            </Button>
            <Button v-if="isAdmin" :loading="isSubmitting" :disabled="isSubmitting" @click="submit">
                {{ t('admin.resources.show.save') }}
            </Button>
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
    </div>
</template>
