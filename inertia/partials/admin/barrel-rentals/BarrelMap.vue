<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { router, useForm } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { ImageUp, Map as MapIcon } from '@lucide/vue';
import { Button } from '~/components/ui/button';
import DeleteButton from '~/components/ui/DeleteButton.vue';

defineProps<{
    /** Public path of the mine map, null when none was uploaded. */
    url: string | null;
    canManage: boolean;
}>();

const { t } = useI18n();

const fileInputRef = ref<HTMLInputElement | null>(null);
const form = useForm<{ map: File | null }>({ map: null });

/** Picking a file uploads it right away, replacing the current map. */
function onFileChange(event: Event) {
    form.map = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (!form.map) return;

    form.post(urlFor('admin.barrelRentals.map.update'), {
        preserveScroll: true,
        onFinish: () => {
            form.reset();
            if (fileInputRef.value) fileInputRef.value.value = '';
        },
    });
}

const isRemoving = ref(false);

function remove() {
    isRemoving.value = true;
    router.delete(urlFor('admin.barrelRentals.map.destroy'), { preserveScroll: true, onFinish: () => (isRemoving.value = false) });
}
</script>

<template>
    <div v-if="url || canManage" class="rounded-md border p-3 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2 text-sm font-medium">
                <MapIcon class="size-4 text-muted-foreground" />
                {{ t('admin.barrelRentals.map.title') }}
            </div>
            <div v-if="canManage" class="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" class="gap-1" type="button" :loading="form.processing" :disabled="form.processing" @click="fileInputRef?.click()">
                    <ImageUp class="size-4" />
                    {{ url ? t('admin.barrelRentals.map.replace') : t('admin.barrelRentals.map.upload') }}
                </Button>
                <DeleteButton
                    v-if="url"
                    :label="t('admin.barrelRentals.map.delete.label')"
                    :title="t('admin.barrelRentals.map.delete.title')"
                    :description="t('admin.barrelRentals.map.delete.description')"
                    :cancel-label="t('admin.barrelRentals.map.delete.cancel')"
                    :confirm-label="t('admin.barrelRentals.map.delete.confirm')"
                    :loading="isRemoving"
                    @confirm="remove"
                />
                <input ref="fileInputRef" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" class="hidden" @change="onFileChange" />
            </div>
        </div>

        <a v-if="url" :href="url" target="_blank" rel="noopener" :title="t('admin.barrelRentals.map.openFull')" class="block">
            <img :src="url" :alt="t('admin.barrelRentals.map.title')" class="mx-auto max-h-[75vh] w-full rounded-md bg-muted/30 object-contain" />
        </a>
        <p v-else class="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{{ t('admin.barrelRentals.map.empty') }}</p>

        <p v-if="form.errors.map" class="text-xs text-destructive">{{ form.errors.map }}</p>
        <p v-if="canManage" class="text-xs text-muted-foreground">{{ t('admin.barrelRentals.map.hint') }}</p>
    </div>
</template>
