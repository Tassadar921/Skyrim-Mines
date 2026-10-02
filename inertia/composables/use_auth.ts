import { computed } from 'vue';
import { usePage } from '@inertiajs/vue3';
import type { Data } from '@generated/data';

export function useAuth() {
    const page = usePage<Data.SharedProps>();
    const isAdmin = computed(() => page.props.user?.role === 'admin');
    /** Foremen get full read/write access on every admin section they can see, exactly like owners — except where explicitly noted otherwise (e.g. users' last activity). */
    const isManager = computed(() => page.props.user?.role === 'admin' || page.props.user?.role === 'foreman');

    return { isAdmin, isManager };
}
