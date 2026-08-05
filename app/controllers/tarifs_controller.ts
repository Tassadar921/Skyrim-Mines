import { type HttpContext } from '@adonisjs/core/http';
import ResourceRepository from '#repositories/resource_repository';
import ResourceTransformer from '#transformers/resource_transformer';

export default class TarifsController {
    constructor(private readonly resourceRepository: ResourceRepository = new ResourceRepository()) {}

    public async index({ inertia }: HttpContext) {
        const resources = await this.resourceRepository.all();

        return inertia.render('tarifs', {
            resources: resources.map((r) => new ResourceTransformer(r).toObject()),
        });
    }
}
