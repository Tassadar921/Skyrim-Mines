import { BaseSeeder } from '@adonisjs/lucid/seeders';
import ResourceRepository from '#repositories/resource_repository';
import ResourceTypeEnum from '#types/enum/resource_type_enum';

const MINERAIS: [string, string][] = [
    ['Fer', '0.2'],
    ['Corindon', '0.3'],
    ['Argent', '0.6'],
    ['Or', '0.6'],
    ['Orichalque', '4'],
    ['Pierre de Lune', '18'],
    ['Vif-Argent', '20'],
];

const LINGOTS: [string, string][] = [
    ['Fer', '2.5'],
    ['Corindon', '3'],
    ['Acier', '6'],
    ['Argent', '9'],
    ['Or', '9'],
    ['Pierre de Lune', '60'],
    ['Vif-Argent', '70'],
];

export default class extends BaseSeeder {
    private readonly resourceRepository: ResourceRepository = new ResourceRepository();

    public async run(): Promise<void> {
        const existing = await this.resourceRepository.all();
        if (existing.length > 0) return;

        for (const [name, price] of MINERAIS) {
            await this.resourceRepository.create({ name, type: ResourceTypeEnum.MINERAI, buyPrice: price, sellPrice: price });
        }

        for (const [name, price] of LINGOTS) {
            await this.resourceRepository.create({ name, type: ResourceTypeEnum.LINGOT, buyPrice: price, sellPrice: price });
        }
    }
}
