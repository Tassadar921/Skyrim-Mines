import { QuoteSchema } from '#database/schema';
import { belongsTo, hasMany } from '@adonisjs/lucid/orm';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import File from '#models/file';
import QuoteLine from '#models/quote_line';

export default class Quote extends QuoteSchema {
    @belongsTo(() => File, { foreignKey: 'fileId' })
    declare file: BelongsTo<typeof File>;

    @hasMany(() => QuoteLine, { foreignKey: 'quoteId' })
    declare lines: HasMany<typeof QuoteLine>;
}
