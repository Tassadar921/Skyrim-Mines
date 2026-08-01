<script setup lang="ts">
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
} from '~/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import { Button } from '~/components/ui/button';
import { Trash2 } from '@lucide/vue';

defineProps<{
    label: string;
    title: string;
    description: string;
    cancelLabel: string;
    confirmLabel: string;
    disabled?: boolean;
    disabledTooltip?: string;
    loading?: boolean;
}>();

const emit = defineEmits<{
    confirm: [];
}>();
</script>

<template>
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger as-child>
                <span>
                    <AlertDialog>
                        <AlertDialogTrigger as-child>
                            <Button variant="destructive" size="sm" class="gap-1" :disabled="disabled">
                                <Trash2 class="size-4" />
                                {{ label }}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{{ title }}</AlertDialogTitle>
                                <AlertDialogDescription>{{ description }}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{{ cancelLabel }}</AlertDialogCancel>
                                <AlertDialogAction :disabled="loading" @click="emit('confirm')">
                                    {{ confirmLabel }}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </span>
            </TooltipTrigger>
            <TooltipContent v-if="disabled && disabledTooltip">
                {{ disabledTooltip }}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
</template>
