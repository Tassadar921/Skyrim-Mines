<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { formatCalendarDate } from '~/lib/date_format';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useI18n } from 'vue-i18n';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { router, useForm } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { getTransmit } from '~/lib/transmit';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { DatePicker } from '~/components/ui/date-picker';
import { TimeInput } from '~/components/ui/time-input';
import { Textarea } from '~/components/ui/textarea';
import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import DeleteButton from '~/components/ui/DeleteButton.vue';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import AgendaMonthGrid from '~/partials/admin/agenda/AgendaMonthGrid.vue';
import AgendaTimeGrid from '~/partials/admin/agenda/AgendaTimeGrid.vue';
import AgendaTakeButtons, { type AgendaTakeMode } from '~/partials/admin/agenda/AgendaTakeButtons.vue';
import { type AgendaEvent, type AgendaView, capitalize, eventDotClass, eventsOnDay, formatDay, formatMinutes, dayOf, MINUTES_PER_DAY } from '~/lib/agenda';
import { ChevronLeft, ChevronRight, Plus, Users, Lock, Maximize2, Minimize2, Repeat, CircleAlert } from '@lucide/vue';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
pageTitle.value = t('admin.agenda.title');

type Filter = 'all' | 'personal' | 'shared';

const props = defineProps<{
    view: AgendaView;
    date: string;
    previousDate: string;
    nextDate: string;
    today: string;
    days: string[];
    events: AgendaEvent[];
    unassignedEvents: AgendaEvent[];
}>();

const VIEWS: AgendaView[] = ['month', 'week', 'day'];
const FILTERS: Filter[] = ['all', 'personal', 'shared'];

function navigate(view: AgendaView, date?: string) {
    // preserveState keeps the fullscreen mode, filter and selected day across periods.
    router.get(urlFor('admin.agenda.index'), date ? { view, date } : { view }, { preserveState: true, preserveScroll: true });
}

const month = computed(() => props.date.slice(0, 7));
const isTodayInRange = computed(() => (props.view === 'month' ? props.today.startsWith(month.value) : props.days.includes(props.today)));

const periodLabel = computed(() => {
    if (props.view === 'month') return capitalize(formatDay(`${month.value}-01`, { month: 'long', year: 'numeric' }));
    if (props.view === 'day') return capitalize(formatDay(props.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    const first = props.days[0];
    const last = props.days[props.days.length - 1];
    return `${formatDay(first, { day: 'numeric', month: 'short' })} – ${formatDay(last, { day: 'numeric', month: 'short', year: 'numeric' })}`;
});

const filter = ref<Filter>('all');
const filteredEvents = computed(() => props.events.filter((event) => filter.value === 'all' || (filter.value === 'shared') === event.isShared));

// Month view: the clicked day's events are detailed below the grid.
function defaultSelectedDay(): string {
    return props.today.startsWith(month.value) ? props.today : `${month.value}-01`;
}

const selectedDay = ref(defaultSelectedDay());
watch(month, () => (selectedDay.value = defaultSelectedDay()));

const selectedDayEvents = computed(() => eventsOnDay(filteredEvents.value, selectedDay.value));

/** Day pre-filled by the "new event" button for the period on screen. */
const defaultCreateDay = computed(() => {
    if (props.view === 'month') return selectedDay.value;
    if (props.view === 'day') return props.date;
    return isTodayInRange.value ? props.today : props.days[0];
});

/** Short "when" of an occurrence for the to-assign banner, e.g. "mer. 4 nov. · 09:00". */
function occurrenceLabel(event: AgendaEvent): string {
    const day = formatDay(dayOf(event.startsAt), { weekday: 'short', day: 'numeric', month: 'short' });
    return `${day} · ${event.allDay ? t('admin.agenda.allDay') : event.startsAt.slice(11, 16)}`;
}

/** Time shown for an event on a given day: "all day", or its bounds with "…" when it continues over another day. */
function timeLabel(event: AgendaEvent, day: string): string {
    if (event.allDay) return t('admin.agenda.allDay');
    const start = day === dayOf(event.startsAt) ? event.startsAt.slice(11, 16) : '…';
    const end = day === dayOf(event.endsAt) ? event.endsAt.slice(11, 16) : '…';
    return `${start} - ${end}`;
}

// Fullscreen: the agenda covers the whole back office (a fixed overlay rather than the browser
// Fullscreen API, so the event dialog — rendered in a portal on <body> — stays visible).
const isFullscreen = ref(false);

watch(isFullscreen, (value) => {
    document.body.style.overflow = value ? 'hidden' : '';
});

function onKeydown(event: KeyboardEvent) {
    // Capture phase: runs before the dialog's own Escape handler, so Escape first closes the dialog only.
    if (event.key === 'Escape' && isFullscreen.value && !dialogOpen.value) isFullscreen.value = false;
}

// Live updates: any owner's change (create, edit, take, release, delete) reloads the events of every open agenda.
let agendaSubscription: ReturnType<ReturnType<typeof getTransmit>['subscription']> | undefined;

onMounted(async () => {
    document.addEventListener('keydown', onKeydown, true);

    agendaSubscription = getTransmit().subscription('agenda');
    await agendaSubscription.create();
    agendaSubscription.onMessage(() => {
        router.reload({ only: ['events', 'unassignedEvents'] });
    });
});
onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown, true);
    document.body.style.overflow = '';
    agendaSubscription?.delete();
});

const dialogOpen = ref(false);
const editingEvent = ref<AgendaEvent | null>(null);

const form = useForm({
    title: '',
    description: '',
    isShared: false,
    allDay: false,
    startsAt: '',
    endsAt: '',
    recursWeekly: false,
    recurrenceEndsOn: '',
    needsAssignee: false,
});

const canChangeVisibility = computed(() => !editingEvent.value || editingEvent.value.isOwner);

function openCreate(day: string, startMinutes = 9 * 60) {
    editingEvent.value = null;
    form.clearErrors();
    form.title = '';
    form.description = '';
    form.isShared = filter.value === 'shared';
    form.allDay = false;
    form.startsAt = `${day}T${formatMinutes(startMinutes)}`;
    form.endsAt = `${day}T${formatMinutes(Math.min(startMinutes + 60, MINUTES_PER_DAY - 1))}`;
    form.recursWeekly = false;
    form.recurrenceEndsOn = '';
    form.needsAssignee = false;
    dialogOpen.value = true;
}

function openEdit(event: AgendaEvent) {
    editingEvent.value = event;
    form.clearErrors();
    form.title = event.title;
    form.description = event.description ?? '';
    form.isShared = event.isShared;
    form.allDay = event.allDay;
    // A weekly event is edited as a whole series, from its first occurrence.
    form.startsAt = event.allDay ? dayOf(event.seriesStartsAt) : event.seriesStartsAt;
    form.endsAt = event.allDay ? dayOf(event.seriesEndsAt) : event.seriesEndsAt;
    form.recursWeekly = event.recursWeekly;
    form.recurrenceEndsOn = event.recurrenceEndsOn ?? '';
    form.needsAssignee = event.needsAssignee;
    dialogOpen.value = true;
}

/** Form bounds are "YYYY-MM-DD" (all-day) or "YYYY-MM-DDTHH:mm"; date and time are edited by separate French-format pickers. */
function setBoundDate(bound: 'startsAt' | 'endsAt', date: string) {
    form[bound] = form.allDay ? date : `${date}T${form[bound].slice(11, 16) || '09:00'}`;
}

function setBoundTime(bound: 'startsAt' | 'endsAt', time: string) {
    form[bound] = `${dayOf(form[bound])}T${time}`;
}

function onAllDayChange(allDay: boolean) {
    form.allDay = allDay;
    form.startsAt = allDay ? dayOf(form.startsAt) : `${dayOf(form.startsAt)}T09:00`;
    form.endsAt = allDay ? dayOf(form.endsAt) : `${dayOf(form.endsAt)}T10:00`;
}

function submit() {
    const options = { preserveScroll: true, preserveState: true, onSuccess: () => (dialogOpen.value = false) };
    form.transform((data) => ({
        ...data,
        recurrenceEndsOn: data.recursWeekly && data.recurrenceEndsOn ? data.recurrenceEndsOn : null,
        needsAssignee: data.isShared && data.needsAssignee,
    }));
    if (editingEvent.value) {
        form.put(urlFor('admin.agenda.update', { id: editingEvent.value.id }), options);
    } else {
        form.post(urlFor('admin.agenda.store'), options);
    }
}

const assigningKey = ref<string | null>(null);

/**
 * "I'll handle it": personal moves the event to the taker's own agenda, shared keeps it shared but no longer to assign.
 * A weekly series is taken for the clicked occurrence only.
 */
function assign(event: AgendaEvent, mode: AgendaTakeMode) {
    assigningKey.value = `${event.occurrenceKey}:${mode}`;
    router.post(
        urlFor('admin.agenda.assign', { id: event.id }),
        { mode, occurrenceDate: event.recursWeekly ? dayOf(event.startsAt) : undefined },
        { preserveScroll: true, preserveState: true, onSuccess: () => (dialogOpen.value = false), onFinish: () => (assigningKey.value = null) },
    );
}

const isReleasing = ref(false);

/** Last-minute hitch: hands the event (or this weekly occurrence) back to the other owners. */
function release(event: AgendaEvent) {
    isReleasing.value = true;
    router.post(
        urlFor('admin.agenda.release', { id: event.id }),
        { occurrenceDate: event.recursWeekly ? dayOf(event.startsAt) : undefined },
        { preserveScroll: true, preserveState: true, onSuccess: () => (dialogOpen.value = false), onFinish: () => (isReleasing.value = false) },
    );
}

function destroy() {
    if (!editingEvent.value) return;
    router.delete(urlFor('admin.agenda.destroy', { id: editingEvent.value.id }), { preserveScroll: true, preserveState: true, onSuccess: () => (dialogOpen.value = false) });
}
</script>

<template>
    <div :class="isFullscreen ? 'fixed inset-0 z-40 flex flex-col gap-3 bg-background p-3 sm:p-4' : 'flex flex-col gap-4'">
        <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="icon" :aria-label="t('admin.agenda.previous')" @click="navigate(view, previousDate)">
                    <ChevronLeft class="size-4" />
                </Button>
                <Button variant="outline" size="icon" :aria-label="t('admin.agenda.next')" @click="navigate(view, nextDate)">
                    <ChevronRight class="size-4" />
                </Button>
                <Button variant="outline" size="sm" :disabled="isTodayInRange" @click="navigate(view)">{{ t('admin.agenda.today') }}</Button>
                <div class="text-base font-medium">{{ periodLabel }}</div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
                <div class="inline-flex rounded-md border p-0.5">
                    <Button v-for="value in VIEWS" :key="value" :variant="view === value ? 'secondary' : 'ghost'" size="sm" class="h-7" @click="navigate(value, date)">
                        {{ t(`admin.agenda.views.${value}`) }}
                    </Button>
                </div>
                <div class="inline-flex rounded-md border p-0.5">
                    <Button v-for="value in FILTERS" :key="value" :variant="filter === value ? 'secondary' : 'ghost'" size="sm" class="h-7" @click="filter = value">
                        <span v-if="value === 'personal'" class="size-2 rounded-full bg-primary" />
                        <span v-else-if="value === 'shared'" class="size-2 rounded-full bg-amber-500" />
                        {{ t(`admin.agenda.filters.${value}`) }}
                    </Button>
                </div>
                <Button size="sm" class="gap-2" @click="openCreate(defaultCreateDay)">
                    <Plus class="size-4" />
                    {{ t('admin.agenda.add') }}
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    :aria-label="isFullscreen ? t('admin.agenda.fullscreen.exit') : t('admin.agenda.fullscreen.enter')"
                    :title="isFullscreen ? t('admin.agenda.fullscreen.exit') : t('admin.agenda.fullscreen.enter')"
                    @click="isFullscreen = !isFullscreen"
                >
                    <component :is="isFullscreen ? Minimize2 : Maximize2" class="size-4" />
                </Button>
            </div>
        </div>

        <div v-if="unassignedEvents.length" class="rounded-md border-2 border-destructive bg-destructive/5 p-3 space-y-2">
            <div class="flex items-center gap-2 text-sm font-medium text-destructive">
                <span class="relative flex size-2.5">
                    <span class="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-60" />
                    <span class="relative inline-flex size-2.5 rounded-full bg-destructive" />
                </span>
                {{ t('admin.agenda.unassigned.title', unassignedEvents.length) }}
            </div>
            <div class="space-y-1.5" :class="isFullscreen ? 'max-h-32 overflow-y-auto' : ''">
                <div v-for="event in unassignedEvents" :key="event.occurrenceKey" class="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md bg-background p-2">
                    <button type="button" class="min-w-0 flex-1 text-left hover:underline" @click="openEdit(event)">
                        <div class="flex items-center gap-1.5 text-sm font-medium">
                            <CircleAlert class="size-3.5 shrink-0 text-destructive" />
                            <span class="truncate">{{ event.title }}</span>
                            <Repeat v-if="event.recursWeekly" class="size-3 shrink-0 text-muted-foreground" />
                        </div>
                        <div class="text-xs text-muted-foreground">{{ occurrenceLabel(event) }} · {{ t('admin.agenda.sharedBy', { name: event.ownerName ?? '—' }) }}</div>
                    </button>
                    <AgendaTakeButtons :event="event" :assigning-key="assigningKey" @take="(mode) => assign(event, mode)" />
                </div>
            </div>
        </div>

        <AgendaTimeGrid
            v-if="view !== 'month'"
            :class="isFullscreen ? 'min-h-0 flex-1' : 'h-[calc(100vh-12rem)] min-h-[480px]'"
            :days="days"
            :events="filteredEvents"
            :today="today"
            @create="openCreate"
            @edit="openEdit"
            @open-day="(day) => navigate('day', day)"
        />

        <template v-else>
            <AgendaMonthGrid
                :class="isFullscreen ? 'min-h-0 flex-1 overflow-y-auto' : ''"
                :days="days"
                :events="filteredEvents"
                :month="month"
                :today="today"
                :selected-day="selectedDay"
                @select="(day) => (selectedDay = day)"
                @create="(day) => openCreate(day)"
                @edit="openEdit"
                @open-day="(day) => navigate('day', day)"
            />

            <div v-if="!isFullscreen" class="rounded-md border p-4 space-y-3">
                <div class="flex items-center justify-between gap-2">
                    <div class="text-sm font-medium">{{ formatCalendarDate(selectedDay) }}</div>
                    <div class="flex items-center gap-2">
                        <Button variant="ghost" size="sm" @click="navigate('day', selectedDay)">{{ t('admin.agenda.views.day') }}</Button>
                        <Button variant="outline" size="sm" class="gap-1" @click="openCreate(selectedDay)">
                            <Plus class="size-4" />
                            {{ t('admin.agenda.add') }}
                        </Button>
                    </div>
                </div>
                <div v-if="selectedDayEvents.length" class="space-y-2">
                    <button
                        v-for="event in selectedDayEvents"
                        :key="event.occurrenceKey"
                        type="button"
                        class="flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors hover:bg-muted/40"
                        @click="openEdit(event)"
                    >
                        <span class="mt-1.5 size-2 shrink-0 rounded-full" :class="eventDotClass(event)" />
                        <div class="min-w-0 flex-1 space-y-0.5">
                            <div class="flex flex-wrap items-center gap-x-2 text-sm">
                                <span class="font-medium">{{ event.title }}</span>
                                <Repeat v-if="event.recursWeekly" class="size-3 text-muted-foreground" :aria-label="t('admin.agenda.fields.recursWeekly')" />
                                <span class="text-xs text-muted-foreground">{{ timeLabel(event, selectedDay) }}</span>
                            </div>
                            <p v-if="event.description" class="whitespace-pre-line text-xs text-muted-foreground">{{ event.description }}</p>
                            <div class="flex items-center gap-1 text-xs text-muted-foreground">
                                <template v-if="event.isShared">
                                    <Users class="size-3" />
                                    {{ t('admin.agenda.sharedBy', { name: event.ownerName ?? '—' }) }}
                                    <span v-if="event.needsAssignee" class="ml-1 rounded bg-destructive px-1.5 py-px font-medium text-white">{{ t('admin.agenda.unassigned.badge') }}</span>
                                    <span v-else-if="event.assigneeName">· {{ t('admin.agenda.unassigned.takenBy', { name: event.assigneeName }) }}</span>
                                </template>
                                <template v-else>
                                    <Lock class="size-3" />
                                    {{ t('admin.agenda.filters.personal') }}
                                </template>
                            </div>
                        </div>
                    </button>
                </div>
                <p v-else class="text-sm text-muted-foreground">{{ t('admin.agenda.noEvents') }}</p>
            </div>
        </template>

        <Dialog v-model:open="dialogOpen">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{{ editingEvent ? t('admin.agenda.edit') : t('admin.agenda.add') }}</DialogTitle>
                </DialogHeader>

                <div class="space-y-4">
                    <div v-if="editingEvent?.needsAssignee" class="space-y-2 rounded-md border-2 border-destructive bg-destructive/5 p-3">
                        <div class="flex items-center gap-1.5 text-sm font-medium text-destructive">
                            <CircleAlert class="size-4" />
                            {{ t('admin.agenda.unassigned.dialogTitle') }}
                        </div>
                        <AgendaTakeButtons :event="editingEvent" :assigning-key="assigningKey" @take="(mode) => assign(editingEvent!, mode)" />
                        <p class="text-xs text-muted-foreground">
                            {{
                                editingEvent.recursWeekly
                                    ? t('admin.agenda.unassigned.hintWeekly', { date: formatDay(dayOf(editingEvent.startsAt), { weekday: 'long', day: 'numeric', month: 'long' }) })
                                    : t('admin.agenda.unassigned.hint')
                            }}
                        </p>
                    </div>
                    <div v-else-if="editingEvent?.canRelease" class="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                        <div class="text-sm">{{ t(editingEvent.recursWeekly ? 'admin.agenda.release.youOccurrence' : 'admin.agenda.release.you') }}</div>
                        <AlertDialog>
                            <AlertDialogTrigger as-child>
                                <Button size="sm" variant="outline" :loading="isReleasing" :disabled="isReleasing">{{ t('admin.agenda.release.button') }}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{{ t('admin.agenda.release.confirm.title') }}</AlertDialogTitle>
                                    <AlertDialogDescription>{{ t('admin.agenda.release.confirm.description', { title: editingEvent.title }) }}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{{ t('admin.agenda.release.confirm.cancel') }}</AlertDialogCancel>
                                    <AlertDialogAction @click="release(editingEvent)">{{ t('admin.agenda.release.confirm.confirm') }}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <p v-else-if="editingEvent?.isShared && editingEvent.assigneeName" class="text-sm text-muted-foreground">
                        {{ t('admin.agenda.unassigned.takenBy', { name: editingEvent.assigneeName }) }}
                    </p>

                    <Input v-model="form.title" :label="t('admin.agenda.fields.title')" maxlength="100" :error="form.errors.title" />

                    <div class="space-y-1.5">
                        <Label for="agendaDescription">{{ t('admin.agenda.fields.description') }}</Label>
                        <Textarea id="agendaDescription" v-model="form.description" maxlength="2000" />
                        <p v-if="form.errors.description" class="text-sm text-destructive">{{ form.errors.description }}</p>
                    </div>

                    <div class="flex items-center gap-2">
                        <Checkbox id="agendaAllDay" :model-value="form.allDay" @update:model-value="(v) => onAllDayChange(!!v)" />
                        <Label for="agendaAllDay" class="cursor-pointer">{{ t('admin.agenda.fields.allDay') }}</Label>
                    </div>

                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div v-for="bound in ['startsAt', 'endsAt'] as const" :key="bound" class="space-y-1">
                            <Label>{{ t(`admin.agenda.fields.${bound}`) }}</Label>
                            <div class="flex flex-wrap items-center gap-2">
                                <DatePicker :model-value="dayOf(form[bound]) || null" class="w-40" @update:model-value="(date) => setBoundDate(bound, date)" />
                                <TimeInput v-if="!form.allDay" :model-value="form[bound].slice(11, 16)" @update:model-value="(time) => setBoundTime(bound, time)" />
                            </div>
                            <p v-if="form.errors[bound]" class="text-sm text-destructive">{{ form.errors[bound] }}</p>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <Checkbox id="agendaRecursWeekly" :model-value="form.recursWeekly" @update:model-value="(v) => (form.recursWeekly = !!v)" />
                            <Label for="agendaRecursWeekly" class="cursor-pointer">{{ t('admin.agenda.fields.recursWeekly') }}</Label>
                        </div>
                        <template v-if="form.recursWeekly">
                            <div class="space-y-1">
                                <Label>{{ t('admin.agenda.fields.recurrenceEndsOn') }}</Label>
                                <div class="flex items-center gap-2">
                                    <DatePicker v-model="form.recurrenceEndsOn" class="w-40" :placeholder="t('admin.agenda.fields.recurrenceNoEnd')" />
                                    <Button v-if="form.recurrenceEndsOn" type="button" variant="ghost" size="sm" @click="form.recurrenceEndsOn = ''">
                                        {{ t('admin.agenda.fields.recurrenceClear') }}
                                    </Button>
                                </div>
                                <p v-if="form.errors.recurrenceEndsOn" class="text-sm text-destructive">{{ form.errors.recurrenceEndsOn }}</p>
                            </div>
                            <p class="text-xs text-muted-foreground">{{ t('admin.agenda.fields.recurrenceHint') }}</p>
                        </template>
                    </div>

                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <Checkbox id="agendaShared" :model-value="form.isShared" :disabled="!canChangeVisibility" @update:model-value="(v) => (form.isShared = !!v)" />
                            <Label for="agendaShared" class="cursor-pointer">{{ t('admin.agenda.fields.isShared') }}</Label>
                        </div>
                        <p class="text-xs text-muted-foreground">
                            {{ canChangeVisibility ? t('admin.agenda.fields.isSharedHint') : t('admin.agenda.fields.isSharedLocked') }}
                        </p>
                    </div>

                    <div v-if="form.isShared" class="space-y-1">
                        <div class="flex items-center gap-2">
                            <Checkbox id="agendaNeedsAssignee" :model-value="form.needsAssignee" @update:model-value="(v) => (form.needsAssignee = !!v)" />
                            <Label for="agendaNeedsAssignee" class="cursor-pointer">{{ t('admin.agenda.fields.needsAssignee') }}</Label>
                        </div>
                        <p class="text-xs text-muted-foreground">{{ t('admin.agenda.fields.needsAssigneeHint') }}</p>
                    </div>

                    <div class="flex items-center gap-2">
                        <Button class="flex-1" :loading="form.processing" :disabled="form.processing" @click="submit">
                            {{ t('admin.agenda.submit') }}
                        </Button>
                        <DeleteButton
                            v-if="editingEvent"
                            :label="t('admin.agenda.delete.label')"
                            :title="t('admin.agenda.delete.title')"
                            :description="t('admin.agenda.delete.description', { title: editingEvent.title })"
                            :cancel-label="t('admin.agenda.delete.cancel')"
                            :confirm-label="t('admin.agenda.delete.confirm')"
                            @confirm="destroy"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    </div>
</template>
