<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { router, useForm, usePage } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import type { AcceptableValue } from 'reka-ui';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });
const { t } = useI18n();
const { isAdmin } = useAuth();
const page = usePage<Data.SharedProps>();

const { pageTitle } = useAdminLayout();
pageTitle.value = t('admin.siteSettings.title');

const props = defineProps<{
    taxSystem: 'flat' | 'progressive';
}>();

const taxSystemValue = ref(props.taxSystem);
const isSubmittingTaxSystem = ref(false);

function onTaxSystemChange(value: AcceptableValue) {
    taxSystemValue.value = value as 'flat' | 'progressive';
    isSubmittingTaxSystem.value = true;
    router.put(urlFor('admin.siteSettings.updateTaxSystem'), { taxSystem: taxSystemValue.value }, { preserveScroll: true, onFinish: () => (isSubmittingTaxSystem.value = false) });
}

const logoInputRef = ref<HTMLInputElement | null>(null);
const logoForm = useForm<{ logo: File | null }>({ logo: null });
const isRemovingLogo = ref(false);

function onLogoChange(event: Event) {
    const target = event.target as HTMLInputElement;
    logoForm.logo = target.files?.[0] ?? null;
    if (!logoForm.logo) return;

    logoForm.post(urlFor('admin.siteSettings.updateLogo'), {
        preserveScroll: true,
        onFinish: () => {
            logoForm.reset();
            if (logoInputRef.value) logoInputRef.value.value = '';
        },
    });
}

function removeLogo() {
    isRemovingLogo.value = true;
    router.delete(urlFor('admin.siteSettings.destroyLogo'), { preserveScroll: true, onFinish: () => (isRemovingLogo.value = false) });
}

const subtitleInput = ref(page.props.subtitle ?? '');
const isSubmittingSubtitle = ref(false);

function submitSubtitle() {
    isSubmittingSubtitle.value = true;
    router.put(urlFor('admin.siteSettings.updateSubtitle'), { subtitle: subtitleInput.value }, { preserveScroll: true, onFinish: () => (isSubmittingSubtitle.value = false) });
}
</script>

<template>
    <div class="space-y-4 max-w-2xl">
        <p class="text-sm text-muted-foreground">{{ t('admin.siteSettings.description') }}</p>

        <div class="rounded-md border p-5 space-y-4">
            <div class="text-sm font-medium">{{ t('admin.siteSettings.logo.title') }}</div>
            <div class="flex items-center gap-4">
                <img :src="page.props.logoUrl" alt="Logo" class="size-16 rounded border bg-muted/30 object-contain p-1" />
                <div v-if="isAdmin" class="space-y-1">
                    <div class="flex gap-2">
                        <Button variant="outline" size="sm" type="button" :loading="logoForm.processing" :disabled="logoForm.processing" @click="logoInputRef?.click()">
                            {{ t('admin.siteSettings.logo.upload') }}
                        </Button>
                        <Button variant="ghost" size="sm" type="button" :loading="isRemovingLogo" :disabled="isRemovingLogo" @click="removeLogo">
                            {{ t('admin.siteSettings.logo.reset') }}
                        </Button>
                    </div>
                    <p class="text-xs text-muted-foreground">{{ t('admin.siteSettings.logo.hint') }}</p>
                    <p v-if="logoForm.errors.logo" class="text-xs text-destructive">{{ logoForm.errors.logo }}</p>
                    <input ref="logoInputRef" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" class="hidden" @change="onLogoChange" />
                </div>
            </div>
        </div>

        <div class="rounded-md border p-5 space-y-4">
            <div class="text-sm font-medium">{{ t('admin.siteSettings.subtitle.title') }}</div>
            <Input v-model="subtitleInput" :label="t('admin.siteSettings.subtitle.field')" maxlength="255" :readonly="!isAdmin" />
            <p class="text-xs text-muted-foreground">{{ t('admin.siteSettings.subtitle.hint') }}</p>
            <Button v-if="isAdmin" size="sm" :loading="isSubmittingSubtitle" :disabled="isSubmittingSubtitle" @click="submitSubtitle">
                {{ t('admin.siteSettings.subtitle.save') }}
            </Button>
        </div>

        <div class="rounded-md border p-5 space-y-4">
            <div class="text-sm font-medium">{{ t('admin.siteSettings.taxSystem.title') }}</div>
            <p class="text-xs text-muted-foreground">{{ t('admin.siteSettings.taxSystem.hint') }}</p>
            <Select :model-value="taxSystemValue" :disabled="!isAdmin || isSubmittingTaxSystem" @update:model-value="onTaxSystemChange">
                <SelectTrigger class="max-w-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="flat">{{ t('admin.siteSettings.taxSystem.flat') }}</SelectItem>
                    <SelectItem value="progressive">{{ t('admin.siteSettings.taxSystem.progressive') }}</SelectItem>
                </SelectContent>
            </Select>
        </div>
    </div>
</template>
