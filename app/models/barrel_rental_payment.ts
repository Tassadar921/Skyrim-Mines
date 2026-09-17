import { BarrelRentalPaymentSchema } from '#database/schema';
import { belongsTo } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import BarrelRental from '#models/barrel_rental';

export default class BarrelRentalPayment extends BarrelRentalPaymentSchema {
    @belongsTo(() => BarrelRental, { foreignKey: 'rentalId' })
    declare rental: BelongsTo<typeof BarrelRental>;
}
