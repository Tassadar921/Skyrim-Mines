<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { CalendarClock, Check } from '@lucide/vue';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';

export type PermanenceToday = {
    slotId: string;
    startsAt: string;
    endsAt: string;
    attendees: { id: string; username: string; role: string }[];
    isAttending: boolean;
};

defineProps<{
    permanences: PermanenceToday[];
}>();

const { t } = useI18n();

const savingSlotId = ref<string | null>(null);

/** "I'll be there" / changed plans; owners also get (or lose) the permanence in their agenda, server side. */
function toggleAttendance(permanence: PermanenceToday) {
    savingSlotId.value = permanence.slotId;
    const url = urlFor(permanence.isAttending ? 'permanences.attendance.destroy' : 'permanences.attendance.store', { slotId: permanence.slotId });
    const options = { preserveScroll: true, onFinish: () => (savingSlotId.value = null) };
    if (permanence.isAttending) router.delete(url, options);
    else router.post(url, {}, options);
}
</script>

<template>
    <div class="mx-auto max-w-3xl rounded-md border-2 border-primary/60 bg-primary/5 p-4 space-y-4">
        <div class="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-100">
            <CalendarClock class="size-5 text-primary" />
            {{ t('home.permanence.title') }}
        </div>

        <div v-for="permanence in permanences" :key="permanence.slotId" class="space-y-3 rounded-md bg-background p-3">
            <div class="text-lg font-medium">{{ permanence.startsAt }} – {{ permanence.endsAt }}</div>

            <div class="space-y-1.5">
                <div class="text-xs text-muted-foreground">{{ t('home.permanence.attendees') }}</div>
                <ul v-if="permanence.attendees.length" class="flex flex-wrap gap-1.5">
                    <li v-for="attendee in permanence.attendees" :key="attendee.id">
                        <Badge variant="secondary" class="gap-1">
                            {{ attendee.username }}
                            <span class="font-normal text-muted-foreground">· {{ attendee.role === 'admin' ? t('home.permanence.owner') : t('home.permanence.foreman') }}</span>
                        </Badge>
                    </li>
                </ul>
                <p v-else class="text-sm text-muted-foreground">{{ t('home.permanence.noAttendees') }}</p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
                <Button v-if="!permanence.isAttending" size="sm" class="gap-1" :loading="savingSlotId === permanence.slotId" :disabled="!!savingSlotId" @click="toggleAttendance(permanence)">
                    <Check class="size-4" />
                    {{ t('home.permanence.attend') }}
                </Button>
                <template v-else>
                    <Badge class="gap-1">
                        <Check class="size-3.5" />
                        {{ t('home.permanence.attending') }}
                    </Badge>
                    <Button variant="ghost" size="sm" :loading="savingSlotId === permanence.slotId" :disabled="!!savingSlotId" @click="toggleAttendance(permanence)">
                        {{ t('home.permanence.leave') }}
                    </Button>
                </template>
            </div>
        </div>
    </div>
</template>
