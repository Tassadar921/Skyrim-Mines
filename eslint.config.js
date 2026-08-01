import { configApp } from '@adonisjs/eslint-config';

export default configApp({
    rules: {
        semi: ['error', 'always'],
        '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
    },
});
