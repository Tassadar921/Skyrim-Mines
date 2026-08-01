<script setup lang="ts">
import { ref } from 'vue';
import { Head, router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
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
import { Mail, Save, Trash2, Download } from '@lucide/vue';
import UserRoleEnum from '#types/enum/user_role_enum';
import type { Data } from '@generated/data';

const props = defineProps<{
    user: Data.User;
}>();

const username = ref(props.user.username);
const isSubmitting = ref(false);
const isSendingReset = ref(false);
const isAdmin = props.user.role === UserRoleEnum.ADMIN;

function deleteAccount() {
    router.delete(urlFor('profile.destroy'));
}

function submit() {
    isSubmitting.value = true;
    router.put(
        urlFor('profile.update'),
        { username: username.value },
        {
            onFinish: () => {
                isSubmitting.value = false;
            },
        }
    );
}

function sendPasswordReset() {
    isSendingReset.value = true;
    router.post(
        urlFor('profile.passwordReset'),
        {},
        {
            onFinish: () => {
                isSendingReset.value = false;
            },
        }
    );
}
</script>

<template>
    <Head :title="$t('profile.title')">
        <meta name="robots" content="noindex" />
    </Head>
    <div class="min-h-screen pt-32 pb-24 px-[8%]">
        <div class="max-w-lg mx-auto space-y-10">
            <h1 class="font-serif text-3xl font-light text-slate-800 dark:text-slate-100">
                {{ $t('profile.title') }}
            </h1>

            <div class="space-y-6">
                <div class="space-y-2">
                    <Label for="username">{{ $t('profile.username') }}</Label>
                    <div class="flex gap-3">
                        <Input id="username" v-model="username" type="text" class="flex-1" />
                        <Button :disabled="isSubmitting || username === user.username" class="gap-2 shrink-0" @click="submit">
                            <Save class="size-4" />
                            {{ $t('profile.save') }}
                        </Button>
                    </div>
                </div>

                <div class="space-y-2">
                    <Label for="email">{{ $t('profile.email') }}</Label>
                    <Input id="email" :model-value="user.email" type="email" :readonly="true" />
                </div>

                <div class="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-1 text-sm text-slate-500 dark:text-slate-400">
                    <div>
                        {{ $t('profile.memberSince') }} :
                        <span class="text-slate-700 dark:text-slate-300">{{ new Date(user.createdAt).toLocaleDateString(undefined, { timeZone: 'UTC' }) }}</span>
                    </div>
                    <div v-if="user.updatedAt">
                        {{ $t('profile.lastUpdate') }} :
                        <span class="text-slate-700 dark:text-slate-300">{{ new Date(user.updatedAt).toLocaleDateString(undefined, { timeZone: 'UTC' }) }}</span>
                    </div>
                </div>

                <div class="pt-2">
                    <Button variant="outline" :disabled="isSendingReset" class="gap-2" @click="sendPasswordReset">
                        <Mail class="size-4" />
                        {{ isSendingReset ? $t('profile.resetPasswordSending') : $t('profile.resetPassword') }}
                    </Button>
                </div>

                <div class="pt-2">
                    <a :href="urlFor('profile.export')">
                        <Button variant="outline" class="gap-2">
                            <Download class="size-4" />
                            {{ $t('profile.exportData') }}
                        </Button>
                    </a>
                </div>

                <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <AlertDialog>
                        <AlertDialogTrigger as-child>
                            <Button variant="destructive" :disabled="isAdmin" class="gap-2">
                                <Trash2 class="size-4" />
                                {{ $t('profile.deleteAccount') }}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{{ $t('profile.deleteAccountConfirm.title') }}</AlertDialogTitle>
                                <AlertDialogDescription>{{ $t('profile.deleteAccountConfirm.description') }}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{{ $t('profile.deleteAccountConfirm.cancel') }}</AlertDialogCancel>
                                <AlertDialogAction variant="destructive" @click="deleteAccount">
                                    {{ $t('profile.deleteAccountConfirm.confirm') }}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    </div>
</template>
