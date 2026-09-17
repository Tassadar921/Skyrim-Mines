import type User from '#models/user';
import { BaseTransformer } from '@adonisjs/core/transformers';

export default class UserTransformer extends BaseTransformer<User> {
    toObject() {
        return {
            id: this.resource.id,
            username: this.resource.username,
            role: this.resource.role,
            enabled: this.resource.enabled ?? false,
            balance: Number(this.resource.balance),
            organizationId: this.resource.organizationId,
            organizationRole: this.resource.organizationRole,
            createdAt: this.resource.createdAt.toISO()!,
            updatedAt: this.resource.updatedAt?.toISO() ?? null,
        };
    }
}
