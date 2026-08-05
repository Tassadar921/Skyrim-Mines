<script setup lang="ts">
import { useI18n } from 'vue-i18n';
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
import { Button } from '~/components/ui/button';
import { Ban } from '@lucide/vue';

defineProps<{
    number: number;
    size?: 'sm' | 'default';
}>();

const emit = defineEmits<{
    confirm: [];
}>();

const { t } = useI18n();
</script>

<template>
    <AlertDialog>
        <AlertDialogTrigger as-child>
            <Button variant="destructive" :size="size ?? 'default'" class="gap-1">
                <Ban class="size-4" />
                {{ t('commande.cancel.trigger') }}
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{{ t('commande.cancel.title') }}</AlertDialogTitle>
                <AlertDialogDescription>{{ t('commande.cancel.description', { number: String(number).padStart(5, '0') }) }}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>{{ t('commande.cancel.cancel') }}</AlertDialogCancel>
                <AlertDialogAction @click="emit('confirm')">{{ t('commande.cancel.confirm') }}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>
