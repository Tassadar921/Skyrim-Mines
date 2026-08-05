<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useI18n } from 'vue-i18n';
import { useForm } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Link } from '@adonisjs/inertia/vue';
import { ArrowLeft } from '@lucide/vue';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
pageTitle.value = t('admin.resources.create.title');

const form = useForm({
    name: '',
    type: '',
    buyPrice: '',
    sellPrice: '',
});

function submit() {
    form.post(urlFor('admin.resources.store'), {
        onSuccess: () => form.reset(),
    });
}
</script>

<template>
    <div class="space-y-4 max-w-lg">
        <Button variant="outline" class="gap-2" as-child>
            <Link :href="urlFor('admin.resources.index')">
                <ArrowLeft class="size-4" />
                {{ t('admin.resources.create.back') }}
            </Link>
        </Button>

        <div class="rounded-md border p-5 space-y-4">
            <Input v-model="form.name" :label="t('admin.resources.create.fields.name')" :error="form.errors.name" maxlength="100" required />

            <div class="space-y-1">
                <Label>{{ t('admin.resources.create.fields.type') }}</Label>
                <Select v-model="form.type">
                    <SelectTrigger>
                        <SelectValue :placeholder="t('admin.resources.create.fields.typePlaceholder')" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="minerai">{{ t('admin.resources.types.minerai') }}</SelectItem>
                        <SelectItem value="lingot">{{ t('admin.resources.types.lingot') }}</SelectItem>
                    </SelectContent>
                </Select>
                <p v-if="form.errors.type" class="text-sm text-destructive">{{ form.errors.type }}</p>
            </div>

            <Input v-model="form.buyPrice" type="number" :label="t('admin.resources.create.fields.buyPrice')" :error="form.errors.buyPrice" required />
            <Input v-model="form.sellPrice" type="number" :label="t('admin.resources.create.fields.sellPrice')" :error="form.errors.sellPrice" required />

            <Button :loading="form.processing" :disabled="form.processing" @click="submit">
                {{ t('admin.resources.create.submit') }}
            </Button>
        </div>
    </div>
</template>
