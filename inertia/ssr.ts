// vue-i18n references __VUE_PROD_DEVTOOLS__ which Vite doesn't replace in externalized SSR modules
(globalThis as any).__VUE_PROD_DEVTOOLS__ = false;

import { client } from '~/client';
import Layout from '~/layouts/default.vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { TuyauProvider } from '@adonisjs/inertia/vue';
import { renderToString } from '@vue/server-renderer';
import { createSSRApp, h, type DefineComponent } from 'vue';
import { resolvePageComponent } from '@adonisjs/inertia/helpers';
import { createI18nInstance } from '~/i18n';

export default function render(page: any) {
    const i18n = createI18nInstance('fr');

    return createInertiaApp({
        page,
        render: renderToString,

        resolve: (name: string): Promise<DefineComponent> => {
            return resolvePageComponent(`./pages/${name}.vue`, import.meta.glob<DefineComponent>('./pages/**/*.vue', { eager: true }), Layout);
        },

        setup: ({ App, props, plugin }) => {
            return createSSRApp({
                render: () => h(TuyauProvider, { client }, { default: () => h(App, props) }),
            })
                .use(plugin)
                .use(i18n);
        },
    });
}
