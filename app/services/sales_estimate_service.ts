import DeliveryRepository from '#repositories/delivery_repository';
import ResourceRepository from '#repositories/resource_repository';
import ResourceRecipeLineRepository from '#repositories/resource_recipe_line_repository';
import SalesEstimateRepository from '#repositories/sales_estimate_repository';
import RecurringOrderRepository from '#repositories/recurring_order_repository';
import ResourceTypeEnum from '#types/enum/resource_type_enum';
import { SALES_ESTIMATE_HISTORY_WEEKS, expandToOreNeeds, roundQuantity, trimmedMean } from '#helpers/sales_estimate_helper';

/** Forecasts next week's sales once a week is recorded (closed) on the dashboard. */
export default class SalesEstimateService {
    constructor(
        private readonly deliveryRepository: DeliveryRepository = new DeliveryRepository(),
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly resourceRecipeLineRepository: ResourceRecipeLineRepository = new ResourceRecipeLineRepository(),
        private readonly salesEstimateRepository: SalesEstimateRepository = new SalesEstimateRepository(),
        private readonly recurringOrderRepository: RecurringOrderRepository = new RecurringOrderRepository(),
    ) {}

    /**
     * Estimates week `closedWeek + 1` from the last complete weeks up to `closedWeek`: per resource, the
     * quantities sold each week (0 when none), trimmed of the lowest and highest week, then averaged.
     * Ores also get their total need, including the ore that goes into the ingots expected to sell.
     */
    public async computeAfterClosingWeek(closedWeek: number): Promise<void> {
        const fromWeek = Math.max(1, closedWeek - SALES_ESTIMATE_HISTORY_WEEKS + 1);
        const weeks = Array.from({ length: closedWeek - fromWeek + 1 }, (_, index) => fromWeek + index);

        const [resources, soldRows, recipes] = await Promise.all([
            this.resourceRepository.all(),
            this.deliveryRepository.quantitiesByWeekAndResource(fromWeek, closedWeek),
            this.resourceRecipeLineRepository.allResourceIngredients(),
        ]);

        const sold = new Map(soldRows.map((row) => [`${row.weekNumber}:${row.resourceId}`, row.quantity]));
        const estimatedSales = new Map(resources.map((resource) => [resource.id, trimmedMean(weeks.map((week) => sold.get(`${week}:${resource.id}`) ?? 0))]));

        const oreIds = new Set(resources.filter((resource) => resource.type === ResourceTypeEnum.MINERAI).map((resource) => resource.id));
        const oreNeeds = expandToOreNeeds(estimatedSales, oreIds, recipes);

        await this.salesEstimateRepository.replaceForWeek(
            closedWeek + 1,
            closedWeek,
            weeks.length,
            resources.map((resource) => ({
                resourceId: resource.id,
                resourceName: resource.name,
                resourceType: resource.type,
                estimatedSales: roundQuantity(estimatedSales.get(resource.id) ?? 0),
                estimatedOreNeed: oreIds.has(resource.id) ? roundQuantity(oreNeeds.get(resource.id) ?? 0) : null,
            })),
        );
    }

    /**
     * What was actually needed, week by week over [fromWeek, toWeek]: per ore, the ore sold as is plus the ore
     * that went into the ingots sold (current recipes), to compare with the forecasts.
     */
    public async actualOreNeeds(fromWeek: number, toWeek: number): Promise<Map<number, Map<string, number>>> {
        const [resources, soldRows, recipes] = await Promise.all([
            this.resourceRepository.all(),
            this.deliveryRepository.quantitiesByWeekAndResource(fromWeek, toWeek),
            this.resourceRecipeLineRepository.allResourceIngredients(),
        ]);
        const oreIds = new Set(resources.filter((resource) => resource.type === ResourceTypeEnum.MINERAI).map((resource) => resource.id));

        const soldByWeek = new Map<number, Map<string, number>>();
        for (const row of soldRows) {
            const sold = soldByWeek.get(row.weekNumber) ?? new Map<string, number>();
            sold.set(row.resourceId, (sold.get(row.resourceId) ?? 0) + row.quantity);
            soldByWeek.set(row.weekNumber, sold);
        }

        return new Map([...soldByWeek].map(([week, sold]) => [week, expandToOreNeeds(sold, oreIds, recipes)]));
    }

    /**
     * Ore needed every week by the fixed weekly orders alone: per ore, the ore they order as is plus the ore going
     * into the ingots they order (current recipes). A floor for the weekly need.
     */
    public async recurringOrderOreNeeds(): Promise<Map<string, number>> {
        const [resources, orders, recipes] = await Promise.all([
            this.resourceRepository.all(),
            this.recurringOrderRepository.allWithLines(),
            this.resourceRecipeLineRepository.allResourceIngredients(),
        ]);
        const oreIds = new Set(resources.filter((resource) => resource.type === ResourceTypeEnum.MINERAI).map((resource) => resource.id));

        const ordered = new Map<string, number>();
        for (const line of orders.flatMap((order) => order.lines)) {
            ordered.set(line.resourceId, (ordered.get(line.resourceId) ?? 0) + line.quantity);
        }

        return expandToOreNeeds(ordered, oreIds, recipes);
    }
}
