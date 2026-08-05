import { computed } from 'vue';
import { usePage } from '@inertiajs/vue3';
import type { Data } from '@generated/data';

export function useAuth() {
    const page = usePage<Data.SharedProps>();
    const isAdmin = computed(() => page.props.user?.role === 'admin');

    return { isAdmin };
}
