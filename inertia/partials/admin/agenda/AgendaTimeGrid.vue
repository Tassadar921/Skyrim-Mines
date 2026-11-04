<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { CircleAlert, Repeat } from '@lucide/vue';
import { type AgendaEvent, MINUTES_PER_DAY, capitalize, dayOf, eventBorderClass, eventClasses, eventsOnDay, formatDay, formatMinutes, minutesOf, parisNow } from '~/lib/agenda';

const HOUR_HEIGHT = 48;
const MIN_EVENT_MINUTES = 20;
const DEFAULT_SCROLL_HOUR = 7;
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

const props = defineProps<{
    days: string[];
    events: AgendaEvent[];
    today: string;
}>();

const emit = defineEmits<{
    create: [day: string, minutes: number];
    edit: [event: AgendaEvent];
    openDay: [day: string];
}>();

const { t } = useI18n();

type PositionedEvent = { event: AgendaEvent; start: number; end: number; lane: number; lanes: number };

/**
 * Lays out a day's timed events side by side: overlapping events form a cluster whose width is split
 * into lanes, each event taking the first lane free at its start. Multi-day events are clipped to the day.
 */
function layoutDay(day: string): PositionedEvent[] {
    const segments = eventsOnDay(props.events, day)
        .filter((event) => !event.allDay)
        .map((event) => {
            const start = dayOf(event.startsAt) === day ? minutesOf(event.startsAt) : 0;
            const end = dayOf(event.endsAt) === day ? minutesOf(event.endsAt) : MINUTES_PER_DAY;
            return { event, start, end: Math.min(MINUTES_PER_DAY, Math.max(end, start + MIN_EVENT_MINUTES)) };
        })
        .sort((a, b) => a.start - b.start || b.end - a.end);

    const positioned: PositionedEvent[] = [];
    let cluster: Omit<PositionedEvent, 'lanes'>[] = [];
    let laneEnds: number[] = [];
    let clusterEnd = -1;

    const flush = () => {
        positioned.push(...cluster.map((segment) => ({ ...segment, lanes: laneEnds.length })));
        cluster = [];
        laneEnds = [];
        clusterEnd = -1;
    };

    for (const segment of segments) {
        if (cluster.length && segment.start >= clusterEnd) flush();
        let lane = laneEnds.findIndex((end) => end <= segment.start);
        if (lane === -1) {
            lane = laneEnds.length;
            laneEnds.push(segment.end);
        } else {
            laneEnds[lane] = segment.end;
        }
        cluster.push({ ...segment, lane });
        clusterEnd = Math.max(clusterEnd, segment.end);
    }
    flush();

    return positioned;
}

const columns = computed(() =>
    props.days.map((day) => ({
        day,
        allDayEvents: eventsOnDay(props.events, day).filter((event) => event.allDay),
        timedEvents: layoutDay(day),
    })),
);

const hasAllDayEvents = computed(() => columns.value.some((column) => column.allDayEvents.length));
const isSingleDay = computed(() => props.days.length === 1);
const gridTemplate = computed(() => ({ gridTemplateColumns: `3.5rem repeat(${props.days.length}, minmax(0, 1fr))` }));

function eventStyle(positioned: PositionedEvent) {
    return {
        top: `${(positioned.start / 60) * HOUR_HEIGHT}px`,
        height: `${((positioned.end - positioned.start) / 60) * HOUR_HEIGHT - 2}px`,
        left: `calc(${(positioned.lane / positioned.lanes) * 100}% + 2px)`,
        width: `calc(${100 / positioned.lanes}% - 4px)`,
    };
}

/** Clicked position snapped to the half hour. */
function onColumnClick(day: string, mouseEvent: MouseEvent) {
    const target = mouseEvent.currentTarget as HTMLElement;
    const offset = mouseEvent.clientY - target.getBoundingClientRect().top;
    const minutes = Math.floor((offset / HOUR_HEIGHT) * 2) * 30;
    emit('create', day, Math.min(Math.max(minutes, 0), MINUTES_PER_DAY - 30));
}

// "Now" line, only computed client-side (SSR has no meaningful clock for the viewer).
const now = ref<{ day: string; minutes: number } | null>(null);
let nowTimer: ReturnType<typeof setInterval> | null = null;

const scrollContainer = ref<HTMLElement | null>(null);

function scrollToWorkingHours() {
    if (!scrollContainer.value) return;
    const showsNow = now.value && props.days.includes(now.value.day);
    const hour = showsNow ? Math.max(0, Math.floor(now.value!.minutes / 60) - 1) : DEFAULT_SCROLL_HOUR;
    scrollContainer.value.scrollTop = hour * HOUR_HEIGHT;
}

onMounted(() => {
    now.value = parisNow();
    nowTimer = setInterval(() => (now.value = parisNow()), 60_000);
    scrollToWorkingHours();
});

onBeforeUnmount(() => {
    if (nowTimer) clearInterval(nowTimer);
});

watch(
    () => props.days.join(),
    () => nextTick(scrollToWorkingHours),
);
</script>

<template>
    <div class="flex min-h-0 flex-col overflow-x-auto rounded-md border">
        <div class="flex min-h-0 flex-1 flex-col" :class="isSingleDay ? '' : 'min-w-[720px]'">
            <div class="grid border-b bg-muted/40 overflow-y-hidden [scrollbar-gutter:stable]" :style="gridTemplate">
                <div />
                <button
                    v-for="column in columns"
                    :key="column.day"
                    type="button"
                    class="flex items-center justify-center gap-1.5 border-l px-1 py-2 text-xs transition-colors"
                    :class="isSingleDay ? 'cursor-default' : 'hover:bg-muted'"
                    :disabled="isSingleDay"
                    @click="emit('openDay', column.day)"
                >
                    <span class="text-muted-foreground">{{ capitalize(formatDay(column.day, { weekday: isSingleDay ? 'long' : 'short' })) }}</span>
                    <span class="inline-flex size-6 items-center justify-center rounded-full font-medium" :class="column.day === today ? 'bg-primary text-primary-foreground' : ''">
                        {{ Number(column.day.slice(8, 10)) }}
                    </span>
                </button>
            </div>

            <div v-if="hasAllDayEvents" class="grid border-b overflow-y-hidden [scrollbar-gutter:stable]" :style="gridTemplate">
                <div class="px-1 py-1 text-right text-[10px] leading-5 text-muted-foreground">{{ t('admin.agenda.allDayRow') }}</div>
                <div v-for="column in columns" :key="column.day" class="space-y-0.5 border-l p-0.5">
                    <button
                        v-for="event in column.allDayEvents"
                        :key="event.occurrenceKey"
                        type="button"
                        class="block w-full truncate rounded px-1 py-0.5 text-left text-xs"
                        :class="eventClasses(event)"
                        :title="event.title"
                        @click="emit('edit', event)"
                    >
                        <CircleAlert v-if="event.needsAssignee" class="inline size-3 align-[-2px]" />
                        <Repeat v-if="event.recursWeekly" class="inline size-3 align-[-2px]" />
                        {{ event.title }}
                    </button>
                </div>
            </div>

            <div ref="scrollContainer" class="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
                <div class="relative grid" :style="gridTemplate">
                    <div>
                        <div v-for="hour in HOURS" :key="hour" class="relative pr-2 text-right" :style="{ height: `${HOUR_HEIGHT}px` }">
                            <span v-if="hour > 0" class="absolute -top-2 right-2 text-[10px] text-muted-foreground">{{ formatMinutes(hour * 60) }}</span>
                        </div>
                    </div>

                    <div
                        v-for="column in columns"
                        :key="column.day"
                        class="relative cursor-pointer border-l"
                        :class="column.day === today ? 'bg-primary/[0.03]' : ''"
                        :style="{ height: `${HOUR_HEIGHT * 24}px` }"
                        @click="onColumnClick(column.day, $event)"
                    >
                        <div v-for="hour in HOURS" :key="hour" class="border-t border-border/60" :class="hour === 0 ? 'border-t-0' : ''" :style="{ height: `${HOUR_HEIGHT}px` }">
                            <div class="border-b border-dashed border-border/30" :style="{ height: `${HOUR_HEIGHT / 2}px` }" />
                        </div>

                        <button
                            v-for="positioned in column.timedEvents"
                            :key="positioned.event.occurrenceKey"
                            type="button"
                            class="absolute overflow-hidden rounded border-l-2 px-1.5 py-0.5 text-left text-xs shadow-xs"
                            :class="[eventClasses(positioned.event), eventBorderClass(positioned.event)]"
                            :style="eventStyle(positioned)"
                            :title="`${formatMinutes(positioned.start)} - ${formatMinutes(positioned.end)} · ${positioned.event.title}`"
                            @click.stop="emit('edit', positioned.event)"
                        >
                            <div class="truncate font-medium">
                                <CircleAlert v-if="positioned.event.needsAssignee" class="inline size-3 align-[-2px]" />
                                <Repeat v-if="positioned.event.recursWeekly" class="inline size-3 align-[-2px]" />
                                {{ positioned.event.title }}
                            </div>
                            <div v-if="positioned.end - positioned.start >= 45" class="truncate opacity-80">{{ formatMinutes(positioned.start) }} - {{ formatMinutes(positioned.end) }}</div>
                            <div v-if="isSingleDay && positioned.event.description && positioned.end - positioned.start >= 90" class="mt-0.5 line-clamp-3 whitespace-pre-line opacity-80">
                                {{ positioned.event.description }}
                            </div>
                        </button>

                        <div v-if="now && now.day === column.day" class="pointer-events-none absolute inset-x-0 z-10" :style="{ top: `${(now.minutes / 60) * HOUR_HEIGHT}px` }">
                            <div class="relative h-0.5 bg-destructive">
                                <span class="absolute -left-1 -top-[3px] size-2 rounded-full bg-destructive" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
