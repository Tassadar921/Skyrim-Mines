import type User from '#models/user';
import { BaseTransformer } from '@adonisjs/core/transformers';

export default class UserTransformer extends BaseTransformer<User> {
    toObject() {
        return {
            id: this.resource.id,
            email: this.resource.email,
            username: this.resource.username,
            role: this.resource.role,
            enabled: this.resource.enabled ?? false,
            acceptedTermsAt: this.resource.acceptedTermsAt?.toISO() ?? null,
            createdAt: this.resource.createdAt.toISO()!,
            updatedAt: this.resource.updatedAt?.toISO() ?? null,
        };
    }
}
