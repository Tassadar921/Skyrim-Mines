<script setup lang="ts">
import { useForm } from '@inertiajs/vue3';
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useI18n } from 'vue-i18n';
import { urlFor } from '~/client';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
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
import { ShieldOff } from '@lucide/vue';

defineOptions({ layout: AdminLayout });
const { t } = useI18n();

const { pageTitle } = useAdminLayout();
pageTitle.value = t('admin.dashboard.title');

const form = useForm({
    gracePeriodDays: '30',
    note: '',
});

function invalidateTerms() {
    form.post(urlFor('admin.terms.invalidate'));
}
</script>

<template>
    <div class="space-y-6">
        <div class="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-center justify-between gap-4">
            <div class="space-y-0.5">
                <p class="text-sm font-medium">{{ t('admin.dashboard.invalidateTerms') }}</p>
                <p class="text-xs text-muted-foreground">{{ t('admin.dashboard.invalidateTermsConfirm.description') }}</p>
            </div>
            <AlertDialog>
                <AlertDialogTrigger as-child>
                    <Button variant="destructive" size="sm" class="shrink-0 gap-2">
                        <ShieldOff class="size-4" />
                        {{ t('admin.dashboard.invalidateTerms') }}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{{ t('admin.dashboard.invalidateTermsConfirm.title') }}</AlertDialogTitle>
                        <AlertDialogDescription>{{ t('admin.dashboard.invalidateTermsConfirm.description') }}</AlertDialogDescription>
                    </AlertDialogHeader>

                    <div class="space-y-4 py-2">
                        <div class="space-y-1.5">
                            <Label for="gracePeriodDays">{{ t('admin.dashboard.invalidateTermsConfirm.gracePeriodDays') }}</Label>
                            <Input id="gracePeriodDays" v-model="form.gracePeriodDays" type="number" :error="form.errors.gracePeriodDays" />
                            <p class="text-xs text-muted-foreground">{{ t('admin.dashboard.invalidateTermsConfirm.gracePeriodDaysHint') }}</p>
                        </div>
                        <div class="space-y-1.5">
                            <Label for="invalidateNote">{{ t('admin.dashboard.invalidateTermsConfirm.note') }}</Label>
                            <Input id="invalidateNote" v-model="form.note" type="text" :placeholder="t('admin.dashboard.invalidateTermsConfirm.notePlaceholder')" :error="form.errors.note" />
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>{{ t('admin.dashboard.invalidateTermsConfirm.cancel') }}</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" @click="invalidateTerms">
                            {{ t('admin.dashboard.invalidateTermsConfirm.confirm') }}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    </div>
</template>
