import app from '@adonisjs/core/services/app';
import { defineConfig, formatters, loaders } from '@adonisjs/i18n';

export const supportedLocales = ['fr'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

const i18nConfig = defineConfig({
    defaultLocale: 'fr',
    supportedLocales: [...supportedLocales],
    formatter: formatters.icu(),
    loaders: [
        loaders.fs({
            location: app.languageFilesPath(),
        }),
    ],
});

export default i18nConfig;
