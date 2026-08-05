import './css/app.css';
import 'vue-sonner/style.css';
import { client } from '~/client';
import Layout from '~/layouts/default.vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { TuyauProvider } from '@adonisjs/inertia/vue';
import { createSSRApp, type DefineComponent, h } from 'vue';
import { resolvePageComponent } from '@adonisjs/inertia/helpers';
import { createI18nInstance } from '~/i18n';

createInertiaApp({
    resolve: (name: string) => {
        return resolvePageComponent(`./pages/${name}.vue`, import.meta.glob<DefineComponent>('./pages/**/*.vue'), Layout);
    },

    setup({ el, App, props, plugin }): void {
        const i18n = createI18nInstance('fr');

        createSSRApp({
            render: () => h(TuyauProvider, { client }, { default: () => h(App, props) }),
        })
            .use(plugin)
            .use(i18n)
            .mount(el);
    },

    progress: {
        color: '#4B5563',
    },
});
