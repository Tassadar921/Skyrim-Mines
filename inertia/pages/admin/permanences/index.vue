<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { ref, watch } from 'vue';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import { Switch } from '~/components/ui/switch';
import { Label } from '~/components/ui/label';
import PermanenceBuybackTable, { type ResourceBuyback } from '~/partials/admin/permanences/PermanenceBuybackTable.vue';
import PermanenceBuybackSummary from '~/partials/admin/permanences/PermanenceBuybackSummary.vue';
import PermanenceSlotsEditor, { type PermanenceSlot } from '~/partials/admin/permanences/PermanenceSlotsEditor.vue';
import { Badge } from '~/components/ui/badge';
import { addMinutesToTime } from '~/lib/permanence';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { isAdmin } = useAuth();
const { pageTitle } = useAdminLayout();
pageTitle.value = t('admin.permanences.title');

type PermanenceSettings = { isRecruiting: boolean; buyback: { ores: ResourceBuyback[]; ingots: ResourceBuyback[] }; slots: PermanenceSlot[] };

const props = defineProps<{
    settings: PermanenceSettings;
}>();

// Applied right away on toggle; the server's value wins again once the page props come back.
const isRecruiting = ref(props.settings.isRecruiting);
const isSavingRecruiting = ref(false);
watch(
    () => props.settings.isRecruiting,
    (value) => (isRecruiting.value = value),
);

function updateRecruiting(value: boolean) {
    isRecruiting.value = value;
    isSavingRecruiting.value = true;
    router.put(
        urlFor('admin.permanences.settings.recruiting'),
        { isRecruiting: value },
        { preserveScroll: true, preserveState: true, onFinish: () => (isSavingRecruiting.value = false), onError: () => (isRecruiting.value = props.settings.isRecruiting) },
    );
}
</script>

<template>
    <Tabs default-value="permanences">
        <TabsList>
            <TabsTrigger value="permanences">{{ t('admin.permanences.tabs.permanences') }}</TabsTrigger>
            <!-- Settings are seen and changed by owners only. -->
            <TabsTrigger v-if="isAdmin" value="settings">{{ t('admin.permanences.tabs.settings') }}</TabsTrigger>
        </TabsList>

        <TabsContent value="permanences" class="space-y-4">
            <div class="max-w-2xl rounded-md border divide-y">
                <div class="flex items-start justify-between gap-4 p-4">
                    <span class="text-sm">{{ t('admin.permanences.summary.slots') }}</span>
                    <div v-if="settings.slots.length" class="flex flex-wrap justify-end gap-1.5">
                        <Badge v-for="slot in settings.slots" :key="slot.id" variant="outline">
                            {{ t(`admin.permanences.weekdays.${slot.weekday}`) }} · {{ slot.time }} – {{ addMinutesToTime(slot.time, slot.durationMinutes) }}
                        </Badge>
                    </div>
                    <span v-else class="text-sm text-muted-foreground">{{ t('admin.permanences.summary.noSlots') }}</span>
                </div>
                <div class="flex items-center justify-between gap-4 p-4">
                    <span class="text-sm">{{ t('admin.permanences.summary.recruiting') }}</span>
                    <Badge :variant="settings.isRecruiting ? 'default' : 'secondary'">
                        {{ settings.isRecruiting ? t('admin.permanences.summary.recruitingOpen') : t('admin.permanences.summary.recruitingClosed') }}
                    </Badge>
                </div>
                <div class="p-4">
                    <PermanenceBuybackSummary :label="t('admin.permanences.summary.oresBuyback')" :rows="settings.buyback.ores" />
                </div>
                <div class="p-4">
                    <PermanenceBuybackSummary :label="t('admin.permanences.summary.ingotsBuyback')" :rows="settings.buyback.ingots" />
                </div>
            </div>
        </TabsContent>

        <TabsContent v-if="isAdmin" value="settings" class="space-y-4">
            <div class="rounded-md border divide-y">
                <div class="flex items-center justify-between gap-4 p-4">
                    <div class="space-y-0.5">
                        <Label for="permanencesRecruiting" class="cursor-pointer">{{ t('admin.permanences.settings.recruiting.label') }}</Label>
                        <p class="text-xs text-muted-foreground">{{ t('admin.permanences.settings.recruiting.description') }}</p>
                    </div>
                    <Switch id="permanencesRecruiting" :model-value="isRecruiting" :disabled="isSavingRecruiting" @update:model-value="(value) => updateRecruiting(!!value)" />
                </div>
            </div>

            <PermanenceSlotsEditor :slots="settings.slots" />
            <PermanenceBuybackTable
                :title="t('admin.permanences.settings.buyback.ores.title')"
                :description="t('admin.permanences.settings.buyback.ores.description')"
                :resource-label="t('admin.permanences.settings.buyback.ores.resource')"
                :empty-label="t('admin.permanences.settings.buyback.ores.empty')"
                :rows="settings.buyback.ores"
            />
            <PermanenceBuybackTable
                :title="t('admin.permanences.settings.buyback.ingots.title')"
                :description="t('admin.permanences.settings.buyback.ingots.description')"
                :resource-label="t('admin.permanences.settings.buyback.ingots.resource')"
                :empty-label="t('admin.permanences.settings.buyback.ingots.empty')"
                :rows="settings.buyback.ingots"
            />
        </TabsContent>
    </Tabs>
</template>
