<script setup lang="ts">
import { Head } from '@inertiajs/vue3';

const props = defineProps({
    title: {
        type: String,
        required: true,
    },
});
</script>

<template>
    <Head :title="props.title" />
    <h1>{{ props.title }}</h1>
</template>
