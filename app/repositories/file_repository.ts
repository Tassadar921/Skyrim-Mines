import BaseRepository from '#repositories/base/base_repository';
import File from '#models/file';

export default class FileRepository extends BaseRepository<typeof File> {
    constructor() {
        super(File);
    }

    public async findOrFail(id: string): Promise<File> {
        return File.findOrFail(id);
    }

    public async create(data: { path: string; originalName: string; mimeType: string; size: number }): Promise<File> {
        return File.create(data);
    }

    public async delete(id: string): Promise<void> {
        const file = await File.findOrFail(id);
        await file.delete();
    }
}
