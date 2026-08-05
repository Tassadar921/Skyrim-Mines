import type Material from '#models/material';
import { BaseTransformer } from '@adonisjs/core/transformers';

export default class MaterialTransformer extends BaseTransformer<Material> {
    toObject() {
        return {
            id: this.resource.id,
            name: this.resource.name,
            order: this.resource.order,
            buyPrice: Number(this.resource.buyPrice),
            createdAt: this.resource.createdAt.toISO()!,
            updatedAt: this.resource.updatedAt?.toISO() ?? null,
        };
    }
}
