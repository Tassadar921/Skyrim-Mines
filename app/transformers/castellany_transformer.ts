import type Castellany from '#models/castellany';
import { BaseTransformer } from '@adonisjs/core/transformers';

export default class CastellanyTransformer extends BaseTransformer<Castellany> {
    toObject() {
        return {
            id: this.resource.id,
            name: this.resource.name,
            commissionAmount: this.resource.commissionAmount,
            largeOrderFeeRate: this.resource.largeOrderFeeRate,
        };
    }
}
