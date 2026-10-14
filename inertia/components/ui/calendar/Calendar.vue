<script setup lang="ts">
import type { CalendarRootEmits, CalendarRootProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { ChevronLeft, ChevronRight } from '@lucide/vue';
import {
    CalendarCell,
    CalendarCellTrigger,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHead,
    CalendarGridRow,
    CalendarHeadCell,
    CalendarHeader,
    CalendarHeading,
    CalendarNext,
    CalendarPrev,
    CalendarRoot,
    useForwardPropsEmits,
} from 'reka-ui';
import { buttonVariants } from '~/components/ui/button';
import { cn } from '~/lib/utils';

const props = withDefaults(defineProps<CalendarRootProps & { class?: HTMLAttributes['class'] }>(), {
    weekStartsOn: 1,
    locale: 'fr-FR',
});
const emits = defineEmits<CalendarRootEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
    <CalendarRoot v-slot="{ grid, weekDays }" data-slot="calendar" :class="cn('p-3', props.class)" v-bind="forwarded">
        <CalendarHeader class="flex items-center justify-between pb-2">
            <CalendarPrev :class="cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }))">
                <ChevronLeft class="size-4" />
            </CalendarPrev>
            <CalendarHeading class="text-sm font-medium" />
            <CalendarNext :class="cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }))">
                <ChevronRight class="size-4" />
            </CalendarNext>
        </CalendarHeader>

        <CalendarGrid v-for="month in grid" :key="month.value.toString()" class="w-full border-collapse select-none space-y-1">
            <CalendarGridHead>
                <CalendarGridRow class="flex">
                    <CalendarHeadCell v-for="weekDay in weekDays" :key="weekDay" class="w-9 text-xs font-normal text-muted-foreground">
                        {{ weekDay }}
                    </CalendarHeadCell>
                </CalendarGridRow>
            </CalendarGridHead>
            <CalendarGridBody>
                <CalendarGridRow v-for="(weekDates, index) in month.rows" :key="`week-${index}`" class="mt-1 flex w-full">
                    <CalendarCell v-for="weekDate in weekDates" :key="weekDate.toString()" :date="weekDate" class="relative size-9 p-0 text-center text-sm">
                        <CalendarCellTrigger
                            :day="weekDate"
                            :month="month.value"
                            class="flex size-9 items-center justify-center rounded-md text-sm font-normal transition-colors hover:bg-accent hover:text-accent-foreground data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground data-[disabled]:opacity-50 data-[outside-view]:text-muted-foreground data-[unavailable]:pointer-events-none data-[unavailable]:text-muted-foreground data-[unavailable]:line-through data-[today]:not-data-[selected]:font-semibold"
                        />
                    </CalendarCell>
                </CalendarGridRow>
            </CalendarGridBody>
        </CalendarGrid>
    </CalendarRoot>
</template>
