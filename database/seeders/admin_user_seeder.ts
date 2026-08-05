import { BaseSeeder } from '@adonisjs/lucid/seeders';
import env from '#start/env';
import UserRepository from '#repositories/user_repository';
import UserRoleEnum from '#types/enum/user_role_enum';

export default class extends BaseSeeder {
    private readonly userRepository: UserRepository = new UserRepository();

    public async run(): Promise<void> {
        const discordId = env.get('ADMIN_DISCORD_ID');

        if (await this.userRepository.findByDiscordId(discordId)) {
            return;
        }

        await this.userRepository.create({
            discordId,
            username: env.get('ADMIN_USERNAME'),
            role: UserRoleEnum.ADMIN,
        });
    }
}
