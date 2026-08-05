import { ref, onMounted } from 'vue';

const theme = ref<'light' | 'dark'>('light');

export function useTheme() {
    const setTheme = (value: 'light' | 'dark'): void => {
        theme.value = value;
        localStorage.setItem('theme', value);

        if (value === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const toggleTheme = (): void => {
        setTheme(theme.value === 'dark' ? 'light' : 'dark');
    };

    onMounted((): void => {
        const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;

        if (saved) {
            setTheme(saved);
        } else {
            const prefersDark: boolean = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }
    });

    return { theme, toggleTheme };
}
