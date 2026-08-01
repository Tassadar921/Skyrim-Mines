import { createI18n } from 'vue-i18n';
import fr from './lang/fr.json';

export function createI18nInstance(locale: string) {
    return createI18n({
        legacy: false,
        globalInjection: true,
        locale,
        fallbackLocale: 'fr',
        messages: { fr },
    });
}

export function makeTitle(pageTitle: string | null, appName: string): string {
    return pageTitle ? `${pageTitle} - ${appName}` : appName;
}
