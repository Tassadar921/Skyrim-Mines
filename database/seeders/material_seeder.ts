import { BaseSeeder } from '@adonisjs/lucid/seeders';
import MaterialRepository from '#repositories/material_repository';

const MATERIAL_ORDER = ['Charbon pauvre', 'Charbon', 'Briquette', 'Coke', 'Pioches'];

export default class extends BaseSeeder {
    private readonly materialRepository: MaterialRepository = new MaterialRepository();

    public async run(): Promise<void> {
        const existing = await this.materialRepository.all();
        if (existing.length > 0) return;

        for (const name of MATERIAL_ORDER) {
            await this.materialRepository.create({ name, buyPrice: '0' });
        }
    }
}
