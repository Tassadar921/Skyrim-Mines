<script setup lang="ts">
import { computed } from 'vue';
import { Head } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
import { UserCircle } from '@lucide/vue';

type Member = { id: string; username: string; avatarUrl: string | null };

const { t } = useI18n();

const props = defineProps<{
    owners: Member[];
    employees: Member[];
    extras: Member[];
}>();

const groups = computed(() => [
    { key: 'owners', title: t('organigramme.owners'), members: props.owners },
    { key: 'employees', title: t('organigramme.employees'), members: props.employees },
    { key: 'extras', title: t('organigramme.extras'), members: props.extras },
]);
</script>

<template>
    <Head :title="t('organigramme.title')" />
    <div class="min-h-screen pt-32 pb-24 px-[8%] space-y-16">
        <div class="flex flex-col items-center text-center gap-6">
            <h1 class="font-serif text-4xl font-light text-slate-800 dark:text-slate-100">{{ t('organigramme.title') }}</h1>
        </div>

        <div class="max-w-5xl mx-auto space-y-14">
            <div v-for="group in groups" v-show="group.members.length" :key="group.key" class="space-y-6">
                <h2 class="font-serif text-2xl font-light text-slate-800 dark:text-slate-100 text-center">{{ group.title }}</h2>
                <div class="flex flex-wrap justify-center gap-8">
                    <div v-for="member in group.members" :key="member.id" class="flex flex-col items-center gap-2 w-28">
                        <img v-if="member.avatarUrl" :src="member.avatarUrl" :alt="member.username" class="size-24 rounded-full object-cover border border-amber-400/30" />
                        <div v-else class="flex size-24 items-center justify-center rounded-full bg-muted border border-amber-400/30">
                            <UserCircle class="size-10 text-slate-400" />
                        </div>
                        <span class="text-sm text-slate-700 dark:text-slate-300 text-center">{{ member.username }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
