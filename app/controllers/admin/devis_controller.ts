import { type HttpContext } from '@adonisjs/core/http';
import QuoteRepository from '#repositories/quote_repository';
import { indexQuoteValidator } from '#validators/admin/quotes';

const PER_PAGE = 20;

export default class DevisController {
    constructor(private readonly quoteRepository: QuoteRepository = new QuoteRepository()) {}

    public async index({ inertia, request }: HttpContext) {
        const { page, sort, dir, search } = await request.validateUsing(indexQuoteValidator);

        const currentSort = sort ?? 'createdAt';
        const currentDir = dir ?? 'desc';
        const currentPage = page ?? 1;

        const quotes = await this.quoteRepository.paginate({
            page: currentPage,
            perPage: PER_PAGE,
            sort: currentSort,
            dir: currentDir,
            search,
        });

        return inertia.render('admin/devis/index', {
            quotes: quotes.all().map((quote) => ({
                id: quote.id,
                number: quote.number,
                requesterName: quote.requesterName,
                organizationName: quote.organizationName,
                totalAmount: Number(quote.totalAmount),
                createdAt: quote.createdAt.toISO()!,
                fileUrl: quote.file?.path ?? null,
                lines: quote.lines.map((line) => ({
                    resourceName: line.resourceName,
                    resourceType: line.resourceType,
                    quantity: line.quantity,
                    unitPrice: Number(line.unitPrice),
                    totalPrice: Number(line.totalPrice),
                })),
            })),
            meta: {
                total: quotes.total,
                currentPage: quotes.currentPage,
                lastPage: quotes.lastPage,
                perPage: quotes.perPage,
            },
            filters: { search: search ?? '', sort: currentSort, dir: currentDir },
        });
    }
}
