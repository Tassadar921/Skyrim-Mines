import { LicensePaymentSchema } from '#database/schema';
import { belongsTo } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import LicenseSubscriber from '#models/license_subscriber';

export default class LicensePayment extends LicensePaymentSchema {
    @belongsTo(() => LicenseSubscriber, { foreignKey: 'subscriberId' })
    declare subscriber: BelongsTo<typeof LicenseSubscriber>;
}
