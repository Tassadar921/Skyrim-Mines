<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Hand } from '@lucide/vue';
import { Button } from '~/components/ui/button';
import { type AgendaEvent, formatDay } from '~/lib/agenda';

export type AgendaTakeMode = 'personal' | 'shared';

const props = defineProps<{
    event: AgendaEvent;
    /** `${occurrenceKey}:${mode}` of the take in progress, if any. */
    assigningKey: string | null;
}>();

const emit = defineEmits<{
    take: [mode: AgendaTakeMode];
}>();

const { t } = useI18n();

function isLoading(mode: AgendaTakeMode): boolean {
    return props.assigningKey === `${props.event.occurrenceKey}:${mode}`;
}
</script>

<template>
    <p v-if="!event.canTake" class="text-xs text-muted-foreground">
        {{ t('admin.agenda.unassigned.takeableFrom', { date: formatDay(event.takeableFrom ?? event.startsAt.slice(0, 10), { weekday: 'long', day: 'numeric', month: 'long' }) }) }}
    </p>
    <!-- A weekly series is taken one occurrence at a time and stays shared: next week may be someone else's. -->
    <div v-else-if="event.recursWeekly" class="flex flex-wrap gap-1.5">
        <Button size="sm" class="gap-1" :loading="isLoading('shared')" :disabled="!!assigningKey" @click="emit('take', 'shared')">
            <Hand class="size-3.5" />
            {{ t('admin.agenda.unassigned.takeOccurrence') }}
        </Button>
    </div>
    <div v-else class="flex flex-wrap gap-1.5">
        <Button size="sm" class="gap-1" :loading="isLoading('personal')" :disabled="!!assigningKey" @click="emit('take', 'personal')">
            <Hand class="size-3.5" />
            {{ t('admin.agenda.unassigned.takePersonal') }}
        </Button>
        <Button size="sm" variant="outline" :loading="isLoading('shared')" :disabled="!!assigningKey" @click="emit('take', 'shared')">
            {{ t('admin.agenda.unassigned.takeShared') }}
        </Button>
    </div>
</template>
