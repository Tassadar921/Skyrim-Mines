import { ref } from 'vue';

const pageTitle = ref('');

export function useAdminLayout() {
    return { pageTitle };
}
