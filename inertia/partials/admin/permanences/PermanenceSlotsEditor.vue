<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { router, useForm } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Plus, X } from '@lucide/vue';
import { Button } from '~/components/ui/button';
import { TimeInput } from '~/components/ui/time-input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { DEFAULT_PERMANENCE_DURATION, PERMANENCE_DURATIONS, addMinutesToTime, formatDuration } from '~/lib/permanence';

/** ISO weekday (1 = Monday … 7 = Sunday), an "HH:mm" start time and its own duration. */
export type PermanenceSlot = { id: string; weekday: number; time: string; durationMinutes: number };

defineProps<{
    slots: PermanenceSlot[];
}>();

const { t } = useI18n();

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];

// Permanences (doléances) are usually held at 18:00.
const DEFAULT_TIME = '18:00';

const form = useForm({ weekday: '1', time: DEFAULT_TIME, durationMinutes: String(DEFAULT_PERMANENCE_DURATION) });

function add() {
    form.transform((data) => ({ weekday: Number(data.weekday), time: data.time, durationMinutes: Number(data.durationMinutes) })).post(urlFor('admin.permanences.settings.slots.store'), {
        preserveScroll: true,
        preserveState: true,
    });
}

// Existing slots: the duration is changed in place and saved right away.
const savingDurationId = ref<string | null>(null);

function updateDuration(slot: PermanenceSlot, value: unknown) {
    savingDurationId.value = slot.id;
    router.put(
        urlFor('admin.permanences.settings.slots.duration', { id: slot.id }),
        { durationMinutes: Number(value) },
        { preserveScroll: true, preserveState: true, onFinish: () => (savingDurationId.value = null) },
    );
}

const deletingId = ref<string | null>(null);

function remove(slot: PermanenceSlot) {
    deletingId.value = slot.id;
    router.delete(urlFor('admin.permanences.settings.slots.destroy', { id: slot.id }), { preserveScroll: true, preserveState: true, onFinish: () => (deletingId.value = null) });
}
</script>

<template>
    <div class="rounded-md border">
        <div class="space-y-0.5 p-4">
            <div class="text-sm font-medium">{{ t('admin.permanences.settings.slots.title') }}</div>
            <p class="text-xs text-muted-foreground">{{ t('admin.permanences.settings.slots.description') }}</p>
        </div>

        <ul v-if="slots.length" class="divide-y border-t">
            <li v-for="slot in slots" :key="slot.id" class="flex items-center justify-between gap-2 px-4 py-2 text-sm">
                <span class="min-w-0 flex-1">
                    <span class="font-medium">{{ t(`admin.permanences.weekdays.${slot.weekday}`) }}</span>
                    · {{ slot.time }} – {{ addMinutesToTime(slot.time, slot.durationMinutes) }}
                </span>
                <Select :model-value="String(slot.durationMinutes)" :disabled="savingDurationId === slot.id" @update:model-value="(value) => updateDuration(slot, value)">
                    <SelectTrigger class="h-8 w-28" :aria-label="t('admin.permanences.settings.slots.duration')">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="minutes in PERMANENCE_DURATIONS" :key="minutes" :value="String(minutes)">{{ formatDuration(minutes, t) }}</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    :aria-label="t('admin.permanences.settings.slots.delete')"
                    :title="t('admin.permanences.settings.slots.delete')"
                    :loading="deletingId === slot.id"
                    :disabled="!!deletingId"
                    @click="remove(slot)"
                >
                    <X class="size-4" />
                </Button>
            </li>
        </ul>
        <p v-else class="border-t px-4 py-3 text-sm text-muted-foreground">{{ t('admin.permanences.settings.slots.empty') }}</p>

        <div class="flex flex-wrap items-end gap-3 border-t p-4">
            <div class="w-40 space-y-1">
                <Label>{{ t('admin.permanences.settings.slots.weekday') }}</Label>
                <Select v-model="form.weekday">
                    <SelectTrigger class="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="weekday in WEEKDAYS" :key="weekday" :value="String(weekday)">{{ t(`admin.permanences.weekdays.${weekday}`) }}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div class="space-y-1">
                <Label>{{ t('admin.permanences.settings.slots.time') }}</Label>
                <TimeInput v-model="form.time" />
                <p v-if="form.errors.time" class="text-sm text-destructive">{{ form.errors.time }}</p>
            </div>
            <div class="w-28 space-y-1">
                <Label>{{ t('admin.permanences.settings.slots.duration') }}</Label>
                <Select v-model="form.durationMinutes">
                    <SelectTrigger class="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="minutes in PERMANENCE_DURATIONS" :key="minutes" :value="String(minutes)">{{ formatDuration(minutes, t) }}</SelectItem>
                    </SelectContent>
                </Select>
                <p v-if="form.errors.durationMinutes" class="text-sm text-destructive">{{ form.errors.durationMinutes }}</p>
            </div>
            <Button class="gap-1" :loading="form.processing" :disabled="form.processing || !form.time" @click="add">
                <Plus class="size-4" />
                {{ t('admin.permanences.settings.slots.add') }}
            </Button>
        </div>
    </div>
</template>
