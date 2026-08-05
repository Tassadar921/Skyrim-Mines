import type Organization from '#models/organization';
import { BaseTransformer } from '@adonisjs/core/transformers';

export default class OrganizationTransformer extends BaseTransformer<Organization> {
    toObject() {
        return {
            id: this.resource.id,
            name: this.resource.name,
        };
    }
}
