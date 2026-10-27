import type Resource from '#models/resource';
import { BaseTransformer } from '@adonisjs/core/transformers';

export default class ResourceTransformer extends BaseTransformer<Resource> {
    toObject() {
        return {
            id: this.resource.id,
            name: this.resource.name,
            type: this.resource.type,
            order: this.resource.order,
            buyPrice: Number(this.resource.buyPrice),
            sellPrice: Number(this.resource.sellPrice),
            buybackSplitEnabled: this.resource.buybackSplitEnabled,
            minerShare: this.resource.minerShare === null ? null : Number(this.resource.minerShare),
            sharedShare: this.resource.sharedShare === null ? null : Number(this.resource.sharedShare),
            createdAt: this.resource.createdAt.toISO()!,
            updatedAt: this.resource.updatedAt?.toISO() ?? null,
        };
    }
}
