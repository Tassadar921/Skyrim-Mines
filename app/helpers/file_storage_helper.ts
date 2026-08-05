import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import app from '@adonisjs/core/services/app';

type UploadableFile = {
    extname?: string;
    move(location: string, options?: { name?: string; overwrite?: boolean }): Promise<void>;
};

export async function storeUploadedFile(file: UploadableFile, subdirectory: string): Promise<string> {
    const filename = `${randomUUID()}.${file.extname}`;
    await file.move(app.publicPath(subdirectory), { name: filename });

    return `/${subdirectory}/${filename}`;
}

export async function storeGeneratedFile(buffer: Buffer, subdirectory: string, filename: string): Promise<string> {
    const directory = app.publicPath(subdirectory);
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, filename), buffer);

    return `/${subdirectory}/${filename}`;
}

export async function deleteStoredFile(publicPath: string): Promise<void> {
    await unlink(app.publicPath(publicPath.replace(/^\//, ''))).catch(() => {});
}
