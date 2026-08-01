/*
|--------------------------------------------------------------------------
| Validator file
|--------------------------------------------------------------------------
|
| The validator file is used for configuring global transforms for VineJS.
| The transform below converts all VineJS date outputs from JavaScript
| Date objects to Luxon DateTime instances, so that validated dates are
| ready to use with Lucid models and other parts of the app that expect
| Luxon DateTime.
|
*/

import { DateTime } from 'luxon';
import vine, { VineDate } from '@vinejs/vine';

const fieldMessages: Record<string, Partial<Record<string, string>>> = {
    content: {
        defined: 'Le texte de la traduction est requis',
        string: 'Le texte de la traduction est requis',
        required: 'Le texte de la traduction est requis',
    },
    code: {
        defined: 'Le code du paragraphe est requis',
        string: 'Le code du paragraphe est requis',
        required: 'Le code du paragraphe est requis',
        minLength: 'Le code du paragraphe est requis',
    },
};

const genericMessages: Record<string, string> = {
    defined: 'Ce champ est requis',
    string: 'Ce champ est requis',
    required: 'Ce champ est requis',
    minLength: 'Trop court',
    maxLength: 'Trop long',
    enum: 'Valeur non autorisée',
    uuid: 'Identifiant invalide',
    array: 'Ajoutez au moins un paragraphe',
};

vine.messagesProvider = {
    getMessage(field: string, rule: string, _meta: Record<string, unknown>): string {
        const leaf = field.split('.').pop() ?? field;
        return fieldMessages[leaf]?.[rule] ?? genericMessages[rule] ?? 'Valeur invalide';
    },
};

declare module '@vinejs/vine/types' {
    interface VineGlobalTransforms {
        date: DateTime;
    }
}

VineDate.transform((value) => DateTime.fromJSDate(value));
