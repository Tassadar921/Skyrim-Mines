<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { CircleAlert, Plus, Repeat } from '@lucide/vue';
import { type AgendaEvent, eventsOnDay, eventClasses, eventDotClass, dayOf } from '~/lib/agenda';

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const MAX_EVENTS_PER_CELL = 3;

const props = defineProps<{
    days: string[];
    events: AgendaEvent[];
    month: string;
    today: string;
    selectedDay: string;
}>();

const emit = defineEmits<{
    select: [day: string];
    create: [day: string];
    edit: [event: AgendaEvent];
    openDay: [day: string];
}>();

const { t } = useI18n();

const eventsByDay = computed(() => new Map(props.days.map((day) => [day, eventsOnDay(props.events, day)])));
</script>

<template>
    <div class="flex flex-col rounded-md border overflow-hidden">
        <div class="grid grid-cols-7 border-b bg-muted/40">
            <div v-for="weekday in WEEKDAYS" :key="weekday" class="px-2 py-1.5 text-xs font-medium text-muted-foreground">{{ t(`admin.agenda.weekdays.${weekday}`) }}</div>
        </div>
        <div class="grid flex-1 grid-cols-7 auto-rows-fr">
            <div
                v-for="day in days"
                :key="day"
                role="button"
                tabindex="0"
                class="group min-h-16 sm:min-h-28 border-b border-r p-1 text-left transition-colors hover:bg-muted/40 [&:nth-child(7n)]:border-r-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                :class="[selectedDay === day ? 'bg-muted/60' : '', day.startsWith(month) ? '' : 'bg-muted/20 text-muted-foreground']"
                @click="emit('select', day)"
                @dblclick="emit('create', day)"
                @keydown.enter="emit('select', day)"
            >
                <div class="flex items-center justify-between">
                    <button
                        type="button"
                        class="inline-flex size-6 items-center justify-center rounded-full text-xs hover:ring-1 hover:ring-border"
                        :class="day === today ? 'bg-primary text-primary-foreground font-medium' : ''"
                        @click.stop="emit('openDay', day)"
                    >
                        {{ Number(day.slice(8, 10)) }}
                    </button>
                    <button
                        type="button"
                        class="hidden size-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground sm:group-hover:inline-flex"
                        :aria-label="t('admin.agenda.add')"
                        @click.stop="emit('create', day)"
                    >
                        <Plus class="size-3.5" />
                    </button>
                </div>

                <div class="mt-1 hidden space-y-0.5 sm:block">
                    <button
                        v-for="event in eventsByDay.get(day)?.slice(0, MAX_EVENTS_PER_CELL)"
                        :key="event.occurrenceKey"
                        type="button"
                        class="block w-full truncate rounded px-1 py-0.5 text-left text-xs"
                        :class="eventClasses(event)"
                        :title="event.title"
                        @click.stop="emit('edit', event)"
                    >
                        <span v-if="!event.allDay && dayOf(event.startsAt) === day" class="font-medium">{{ event.startsAt.slice(11, 16) }}</span>
                        <CircleAlert v-if="event.needsAssignee" class="inline size-3 align-[-2px]" />
                        <Repeat v-if="event.recursWeekly" class="inline size-3 align-[-2px]" />
                        {{ event.title }}
                    </button>
                    <button
                        v-if="(eventsByDay.get(day)?.length ?? 0) > MAX_EVENTS_PER_CELL"
                        type="button"
                        class="px-1 text-xs text-muted-foreground hover:text-foreground"
                        @click.stop="emit('openDay', day)"
                    >
                        {{ t('admin.agenda.more', (eventsByDay.get(day)?.length ?? 0) - MAX_EVENTS_PER_CELL) }}
                    </button>
                </div>

                <div class="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                    <span v-for="event in eventsByDay.get(day)" :key="event.occurrenceKey" class="size-1.5 rounded-full" :class="eventDotClass(event)" />
                </div>
            </div>
        </div>
    </div>
</template>
