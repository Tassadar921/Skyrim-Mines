import { registry } from '@generated/registry';
import { createTuyau } from '@tuyau/core/client';

export const client = createTuyau({
    baseUrl: '/',
    registry,
    timeout: false,
});

export const urlFor = client.urlFor;
