import type Castellany from '#models/castellany';
import { BaseTransformer } from '@adonisjs/core/transformers';

export default class CastellanyTransformer extends BaseTransformer<Castellany> {
    toObject() {
        return {
            id: this.resource.id,
            name: this.resource.name,
            commissionRate: this.resource.commissionRate,
            largeOrderFeeRate: this.resource.largeOrderFeeRate,
        };
    }
}
