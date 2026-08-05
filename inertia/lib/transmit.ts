import { Transmit } from '@adonisjs/transmit-client';

let instance: Transmit | undefined;

export function getTransmit(): Transmit {
    if (!instance) {
        instance = new Transmit({ baseUrl: window.location.origin });
    }
    return instance;
}
