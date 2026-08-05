<script setup lang="ts">
import { useTheme } from '~/lib/use_theme';
import { useI18n } from 'vue-i18n';
import { Moon, Sun } from '@lucide/vue';

const { theme, toggleTheme } = useTheme();
const { t } = useI18n();
</script>

<template>
    <button @click="toggleTheme" class="px-3 py-2.5 rounded-md" :aria-label="theme === 'dark' ? t('layout.theme.enableLight') : t('layout.theme.enableDark')">
        <span class="h-6 text-gray-400 dark:text-white" v-if="theme === 'dark'"><Moon aria-hidden="true" /></span>
        <span class="h-6 text-gray-400 dark:text-white" v-else><Sun aria-hidden="true" /></span>
    </button>
</template>
